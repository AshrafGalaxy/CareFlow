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
        return {
            "summary": "We couldn't extract enough text from this report to analyze it. Please try uploading a clearer image or a different file.",
            "highlights": [],
            "abnormal_values": [],
            "questions_for_doctor": ["Could you help me understand what this report means?"]
        }

    messages = [
        SystemMessage(content=REPORT_ANALYSIS_SYSTEM_PROMPT),
        HumanMessage(content=REPORT_ANALYSIS_USER_PROMPT.format(ocr_text=ocr_text[:4000]))
    ]

    # Use Groq (fast, reliable, high limits) with Gemini as fallback
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key and groq_api_key.strip():
        from langchain_groq import ChatGroq
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=groq_api_key,
            temperature=0.1,
            max_retries=1
        )
    else:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            temperature=0.1,
            max_retries=1
        )

    response = await llm.ainvoke(messages)

    try:
        result = _extract_json(response.content)
        # Validate required keys exist
        return {
            "summary": result.get("summary", "Analysis complete. Please see highlights below."),
            "highlights": result.get("highlights", []),
            "abnormal_values": result.get("abnormal_values", []),
            "questions_for_doctor": result.get("questions_for_doctor", [])
        }
    except (ValueError, Exception):
        # Last resort: show summary only
        clean = response.content.replace("```json", "").replace("```", "").strip()
        # Try one more time to get just the summary value from the text
        summary_match = re.search(r'"summary"\s*:\s*"([^"]+)"', clean)
        summary_text = summary_match.group(1) if summary_match else clean[:500]
        return {
            "summary": summary_text,
            "highlights": [],
            "abnormal_values": [],
            "questions_for_doctor": []
        }
