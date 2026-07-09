import json
import os
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.prompts import INSURANCE_SYSTEM_PROMPT, PROCEDURE_EXTRACTION_PROMPT

SCHEMES_DIR = "data/schemes"

def _get_llm():
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        raise ValueError("GROQ_API_KEY is missing. Insurance AI cannot function.")

    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=groq_api_key,
        temperature=0.1,
        max_retries=1
    )

async def extract_procedure(query: str) -> str:
    llm = _get_llm()

    response = await llm.ainvoke([
        SystemMessage(content=PROCEDURE_EXTRACTION_PROMPT),
        HumanMessage(content=query)
    ])

    extracted = response.content.strip()

    if not extracted or extracted.lower() in ["unknown", "none", "general"]:
        return query

    return extracted

async def navigate_insurance(query: str, state: str = "Maharashtra") -> dict:
    """
    Main insurance navigator pipeline.
    """

    procedure = await extract_procedure(query)

    print("USER QUERY:", query)
    print("EXTRACTED PROCEDURE:", procedure)

    # Read all scheme text files for context instead of using FAISS/Embeddings
    context_parts = []
    if os.path.exists(SCHEMES_DIR):
        for filename in os.listdir(SCHEMES_DIR):
            if filename.endswith(".txt"):
                filepath = os.path.join(SCHEMES_DIR, filename)
                try:
                    with open(filepath, encoding="utf-8") as f:
                        context_parts.append(f.read())
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
                    
    context = "\n\n".join(context_parts)
    if not context.strip():
        context = "No scheme documents found. Provide general insurance advice."

    print("LOADED SCHEMES CONTEXT LENGTH:", len(context))

    llm = _get_llm()

    prompt = f"""
{INSURANCE_SYSTEM_PROMPT}

KNOWLEDGE BASE CONTEXT:
{context}

IMPORTANT:
- Use ONLY schemes relevant to the identified procedure and state.
- Do NOT repeat the same scheme unless it is strongly supported.
- If no exact scheme is found, choose the closest matching scheme.
- Use realistic cost estimates.
- Never return null, NaN, or invalid numeric values.

PATIENT QUERY: {query}
PATIENT STATE: {state}
IDENTIFIED PROCEDURE: {procedure}

Return ONLY valid JSON (no markdown, no preamble) matching:

{{
  "procedure_extracted": "string",
  "schemes_suggested": [
    {{
      "name": "string",
      "eligibility": "string",
      "coverage_amount": "string",
      "coverage_details": "string",
      "how_to_apply": "string",
      "hbp_code": "string or null"
    }}
  ],
  "cost_estimate": {{
    "consultation": {{
      "min": number,
      "max": number,
      "unit": "INR"
    }},
    "procedure": {{
      "min": number,
      "max": number,
      "unit": "INR",
      "notes": "string"
    }},
    "medicines": {{
      "min": number,
      "max": number,
      "unit": "INR"
    }},
    "hospital_stay": {{
      "min": number,
      "max": number,
      "unit": "INR",
      "notes": "string"
    }},
    "total_estimate": {{
      "min": number,
      "max": number,
      "unit": "INR"
    }}
  }},
  "documents_checklist": [
    {{
      "document": "string",
      "required": true,
      "notes": "string"
    }}
  ],
  "cashless_guidance": "string",
  "questions_to_ask": [
    "string",
    "string",
    "string"
  ],
  "disclaimer": "Cost estimates are approximate. Eligibility must be verified with the hospital and scheme office."
}}
"""

    response = await llm.ainvoke([
        HumanMessage(content=prompt)
    ])

    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]

        if raw.startswith("json"):
            raw = raw[4:]

    result = json.loads(raw.strip())

    # Ensure Aadhaar card is always present
    if not any(
        d.get("document") == "Aadhaar Card"
        for d in result.get("documents_checklist", [])
    ):
        result.setdefault("documents_checklist", []).insert(
            0,
            {
                "document": "Aadhaar Card",
                "required": True,
                "notes": "Original + photocopy"
            }
        )

    return result