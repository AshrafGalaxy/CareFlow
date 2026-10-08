import json
import re
import os
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.prompts import REPORT_ANALYSIS_SYSTEM_PROMPT, REPORT_ANALYSIS_USER_PROMPT


def _extract_json(raw: str) -> dict:
    """
    Rock-solid JSON extractor. Tries multiple strategies in order:
    1. Direct parse
    2. Strip markdown fences then parse
    3. Regex to find the outermost { } block
    """
    text = raw.strip()

    # Strategy 1: Direct parse (ideal case - model followed instructions)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Strip markdown code fences (```json ... ```)
    if "```" in text:
        parts = text.split("```")
        # parts[1] is the content between first and second ```
        if len(parts) >= 2:
            block = parts[1]
            if block.lower().startswith("json"):
                block = block[4:]
            try:
                return json.loads(block.strip())
            except json.JSONDecodeError:
                pass

    # Strategy 3: Regex — find the first complete JSON object in the string
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # All strategies failed
    raise ValueError("Could not extract JSON from model response")


async def analyze_report(ocr_text: str) -> dict:
    """
    Takes OCR text from a medical report.
    Returns structured dict: {summary, highlights, abnormal_values, questions_for_doctor}
    """
    if not ocr_text or len(ocr_text.strip()) < 50:
        raise ValueError("Insufficient readable text detected in report for clinical analysis.")

    messages = [
        SystemMessage(content=REPORT_ANALYSIS_SYSTEM_PROMPT),
        HumanMessage(content=REPORT_ANALYSIS_USER_PROMPT.format(ocr_text=ocr_text[:4000]))
    ]

    # Use Groq exclusively
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        raise ValueError("GROQ_API_KEY is missing. Analysis cannot function.")
        
    from app.ai.model_provider import ainvoke_with_model_fallback
    try:
        response = await ainvoke_with_model_fallback(
            messages=messages,
            is_vision=False,
            temperature=0.1,
            max_retries=1
        )
        result = _extract_json(response.content)
        summary = result.get("summary")
        if not summary or "error connecting" in summary.lower() or len(summary.strip()) < 10:
            raise ValueError("Extracted JSON does not contain valid clinical summary")

        return {
            "summary": summary,
            "highlights": result.get("highlights", []),
            "actionable_insights": result.get("actionable_insights", []),
            "abnormal_values": result.get("abnormal_values", []),
            "questions_for_doctor": result.get("questions_for_doctor", [])
        }
    except Exception as llm_err:
        print(f"LLM or JSON extraction error in analyze_report: {llm_err}")
        # Try regex fallback on response.content only if response was generated
        if 'response' in locals() and hasattr(response, 'content') and response.content:
            clean_content = response.content.replace("```json", "").replace("```", "").strip()
            summary_match = re.search(r'"summary"\s*:\s*"([^"]+)"', clean_content)
            if summary_match and len(summary_match.group(1)) > 15 and "error connecting" not in summary_match.group(1).lower():
                return {
                    "summary": summary_match.group(1),
                    "highlights": [],
                    "actionable_insights": [],
                    "abnormal_values": [],
                    "questions_for_doctor": []
                }
        # Re-raise so the report pipeline knows analysis failed truthfully
        raise RuntimeError(f"AI report analysis failed: {llm_err}") from llm_err
