"""
Medical Report Guardrail
========================
Fast, zero-cost heuristic validator that runs **after OCR** but **before the
LLM call**.  It rejects documents that clearly are NOT medical/clinical in
nature (invoices, recipes, manuals, legal contracts, tickets, etc.) so we
never burn LLM tokens on garbage input.

Design principles
-----------------
- Pure Python — no external calls, no model inference, runs in < 1 ms.
- Scoring-based: accumulate positive (clinical) and negative (non-medical)
  signals, then make a single accept/reject decision.
- Tuned to be LENIENT (high recall for real reports).  A document only gets
  rejected when the evidence against it is overwhelming and the evidence for
  it is absent.  A borderline doc is ACCEPTED and left to the LLM.
"""

from __future__ import annotations
import re
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Configuration knobs
# ---------------------------------------------------------------------------

# Each matched keyword from CLINICAL_KEYWORDS adds this many points.
_CLINICAL_SCORE_PER_MATCH = 3

# Each matched keyword from NON_MEDICAL_KEYWORDS subtracts this many points.
_NON_MEDICAL_PENALTY_PER_MATCH = 2

# The document is accepted when its net score meets or exceeds this threshold.
_ACCEPT_THRESHOLD = 6  # Needs at least ~2 clinical keywords

# A document is hard-rejected if non-medical score exceeds this, regardless of
# any weak clinical signals.
_HARD_REJECT_NON_MEDICAL_SCORE = 20


# ---------------------------------------------------------------------------
# Keyword lists
# ---------------------------------------------------------------------------

CLINICAL_KEYWORDS: list[str] = [
    # Haematology
    "hemoglobin", "haemoglobin", "hematocrit", "haematocrit",
    "red blood cell", "rbc", "white blood cell", "wbc", "platelet",
    "neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil",
    "mcv", "mch", "mchc", "rdw", "mpv",
    # Biochemistry / metabolic
    "glucose", "hba1c", "creatinine", "urea", "bun", "uric acid",
    "sodium", "potassium", "chloride", "bicarbonate", "calcium",
    "phosphorus", "magnesium", "albumin", "total protein", "globulin",
    "bilirubin", "sgot", "sgpt", "ast", "alt", "alp", "ggt",
    "cholesterol", "triglyceride", "hdl", "ldl", "vldl",
    "tsh", "t3", "t4", "thyroid", "insulin", "cortisol", "ferritin",
    "vitamin d", "vitamin b12", "folate", "folic acid",
    # Urinalysis
    "urinalysis", "urine analysis", "specific gravity", "urine ph",
    "proteinuria", "hematuria", "ketonuria", "glucosuria",
    # Microbiology / pathology
    "culture", "sensitivity", "antibiotic", "mrsa", "pathogen",
    "biopsy", "histopathology", "cytology", "pap smear",
    # Cardiology / imaging markers
    "ecg", "ekg", "echocardiogram", "troponin", "bnp", "nt-probnp",
    "d-dimer", "crp", "esr", "prothrombin", "inr", "ptt",
    # Report structure markers
    "reference range", "normal range", "reference interval",
    "test result", "lab result", "laboratory result",
    "patient name", "patient id", "sample id", "specimen",
    "collected on", "reported on", "date of collection",
    "diagnosis", "clinical notes", "clinical summary",
    "impression", "findings", "attending physician",
    "mg/dl", "mmol/l", "u/l", "iu/l", "g/dl", "ng/ml", "pg/ml",
    "miu/ml", "meq/l", "cells/ul", "10^3/ul", "10^6/ul",
    # Radiology
    "x-ray", "xray", "mri", "ct scan", "ultrasound", "sonography",
    "radiograph", "bone density", "dexa", "pet scan",
]

NON_MEDICAL_KEYWORDS: list[str] = [
    # Financial / invoicing
    "invoice", "receipt", "bill to", "ship to", "subtotal", "grand total",
    "gst", "vat", "tax invoice", "purchase order", "po number",
    "payment terms", "bank account", "swift code", "iban",
    "amount due", "due date", "overdue", "refund",
    # Retail / e-commerce
    "order confirmation", "tracking number", "courier",
    "product description", "qty", "unit price", "discount",
    "return policy", "terms and conditions", "warranty",
    # Legal / contracts
    "whereas", "hereinafter", "indemnify", "arbitration",
    "jurisdiction", "governing law", "intellectual property",
    "confidentiality agreement", "non-disclosure",
    # Food / recipes
    "ingredients", "tablespoon", "teaspoon", "preheat oven",
    "bake at", "simmer", "stir well", "serves",
    # Technical manuals
    "installation guide", "user manual", "firmware", "motherboard",
    "serial number", "model number", "warranty card",
    # Transport / travel
    "boarding pass", "seat number", "gate", "flight number",
    "hotel reservation", "check-in", "check-out",
]


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------

@dataclass
class GuardrailResult:
    is_medical: bool
    clinical_score: int
    non_medical_score: int
    net_score: int
    matched_clinical: list
    matched_non_medical: list
    rejection_reason: str  # Empty string when accepted


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_medical_document(ocr_text: str) -> GuardrailResult:
    """
    Run the heuristic guardrail on extracted OCR text.

    Returns a GuardrailResult.  Callers should check
    result.is_medical and surface result.rejection_reason to the
    user when False.
    """
    if not ocr_text or not ocr_text.strip():
        return GuardrailResult(
            is_medical=False,
            clinical_score=0,
            non_medical_score=0,
            net_score=0,
            matched_clinical=[],
            matched_non_medical=[],
            rejection_reason=(
                "The uploaded document appears to be empty or contains no "
                "readable text. Please upload a clear, legible medical report."
            ),
        )

    text_lower = ocr_text.lower()

    # --- Clinical signals ---
    matched_clinical = []
    for kw in CLINICAL_KEYWORDS:
        pattern = r'(?<![a-z])' + re.escape(kw) + r'(?![a-z])'
        if re.search(pattern, text_lower):
            matched_clinical.append(kw)

    clinical_score = len(matched_clinical) * _CLINICAL_SCORE_PER_MATCH

    # --- Non-medical signals ---
    matched_non_medical = []
    for kw in NON_MEDICAL_KEYWORDS:
        pattern = r'(?<![a-z])' + re.escape(kw) + r'(?![a-z])'
        if re.search(pattern, text_lower):
            matched_non_medical.append(kw)

    non_medical_score = len(matched_non_medical) * _NON_MEDICAL_PENALTY_PER_MATCH
    net_score = clinical_score - non_medical_score

    # Hard reject: zero clinical evidence AND strong non-medical signals
    if clinical_score == 0 and non_medical_score >= _NON_MEDICAL_PENALTY_PER_MATCH * 2:
        reason = _build_rejection_message(matched_non_medical, clinical_score, non_medical_score)
        return GuardrailResult(
            is_medical=False,
            clinical_score=clinical_score,
            non_medical_score=non_medical_score,
            net_score=net_score,
            matched_clinical=matched_clinical,
            matched_non_medical=matched_non_medical,
            rejection_reason=reason,
        )

    # Hard reject: overwhelmingly non-medical even if a few clinical words exist
    if non_medical_score >= _HARD_REJECT_NON_MEDICAL_SCORE and net_score < _ACCEPT_THRESHOLD:
        reason = _build_rejection_message(matched_non_medical, clinical_score, non_medical_score)
        return GuardrailResult(
            is_medical=False,
            clinical_score=clinical_score,
            non_medical_score=non_medical_score,
            net_score=net_score,
            matched_clinical=matched_clinical,
            matched_non_medical=matched_non_medical,
            rejection_reason=reason,
        )

    # Accept: sufficient clinical evidence
    if net_score >= _ACCEPT_THRESHOLD:
        return GuardrailResult(
            is_medical=True,
            clinical_score=clinical_score,
            non_medical_score=non_medical_score,
            net_score=net_score,
            matched_clinical=matched_clinical,
            matched_non_medical=matched_non_medical,
            rejection_reason="",
        )

    # Borderline: accept with benefit of the doubt (short prescriptions, discharge letters, etc.)
    if clinical_score > 0 and non_medical_score < _NON_MEDICAL_PENALTY_PER_MATCH * 3:
        return GuardrailResult(
            is_medical=True,
            clinical_score=clinical_score,
            non_medical_score=non_medical_score,
            net_score=net_score,
            matched_clinical=matched_clinical,
            matched_non_medical=matched_non_medical,
            rejection_reason="",
        )

    # Default: not enough clinical evidence
    reason = (
        "The uploaded document does not appear to contain clinical or laboratory "
        "findings. CareFlow can only analyze medical reports such as blood tests, "
        "urine tests, radiology reports, pathology results, or doctor's clinical notes. "
        "Please upload a valid medical document."
    )
    return GuardrailResult(
        is_medical=False,
        clinical_score=clinical_score,
        non_medical_score=non_medical_score,
        net_score=net_score,
        matched_clinical=matched_clinical,
        matched_non_medical=matched_non_medical,
        rejection_reason=reason,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_rejection_message(
    matched_non_medical: list,
    clinical_score: int,
    non_medical_score: int,
) -> str:
    if not matched_non_medical:
        return (
            "The uploaded file does not appear to be a medical document. "
            "Please upload a clinical lab report, radiology report, or "
            "doctor's notes."
        )

    hints = matched_non_medical[:3]
    hint_str = ", ".join(f'"{h}"' for h in hints)
    return (
        f"The uploaded document appears to be a non-medical file "
        f"(detected terms like {hint_str}). "
        "CareFlow's AI is designed to analyze clinical and laboratory medical "
        "reports only. Please upload a valid medical document such as a blood "
        "test result, radiology report, or clinical summary."
    )
