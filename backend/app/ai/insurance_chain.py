import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.ai.prompts import INSURANCE_SYSTEM_PROMPT, PROCEDURE_EXTRACTION_PROMPT

SCHEME_DOCS_PATH = "data/schemes_index"
SCHEMES_DIR = "data/schemes"


def _get_llm():
    groq_api_key = os.getenv("GROQ_API_KEY")

    if groq_api_key and groq_api_key.strip():
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=groq_api_key,
            temperature=0.1,
            max_retries=1
        )

    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.1,
        max_retries=1
    )


async def build_scheme_index():
    docs = []

    for filename in os.listdir(SCHEMES_DIR):
        if filename.endswith(".txt"):
            filepath = os.path.join(SCHEMES_DIR, filename)

            with open(filepath, encoding="utf-8") as f:
                text = f.read()

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )

            chunks = splitter.split_text(text)

            for chunk in chunks:
                docs.append(
                    Document(
                        page_content=chunk,
                        metadata={"source": filename}
                    )
                )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )

    store = FAISS.from_documents(docs, embeddings)

    os.makedirs(SCHEME_DOCS_PATH, exist_ok=True)
    store.save_local(SCHEME_DOCS_PATH)

    return store


async def get_scheme_retriever():
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )

    if os.path.exists(f"{SCHEME_DOCS_PATH}/index.faiss"):
        store = FAISS.load_local(
            SCHEME_DOCS_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
    else:
        store = await build_scheme_index()

    return store.as_retriever(search_kwargs={"k": 6})


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

    retriever = await get_scheme_retriever()

    # Better retrieval query (uses full user context)
    search_query = f"""
    Patient Query: {query}
    Extracted Procedure: {procedure}
    State: {state}

    Find relevant government insurance schemes, eligibility,
    costs, coverage, and required documents.
    """

    print("RETRIEVAL QUERY:", search_query)

    scheme_docs = await retriever.ainvoke(search_query)

    context = "\n\n".join([
        doc.page_content for doc in scheme_docs
    ])

    print("RETRIEVED DOCS:", len(scheme_docs))

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