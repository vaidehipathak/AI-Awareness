# AI-Awareness System Architecture

## 1. System Architecture Overview

AI-Awareness is a layered, modular cybersecurity analysis platform designed for transparency and reproducibility. The system consists of five core components:

### 1.1 API Layer

- **Framework**: Django 5.2 with CORS support
- **Endpoint**: `POST /api/analyze/` for file submission
- **Input validation**: Accepts multipart form data with file and optional metadata JSON
- **Error handling**: Returns JSON responses with clear error messages; never crashes on invalid input
- **Authentication**: Currently public; easily extended to role-based access control via Django middleware

### 1.2 File Validation & Extraction

- **Size limits**: Enforced at upload (configurable; currently no hard limit)
- **Type detection**: Based on MIME type and file extension
- **Content extraction**:
  - Text files: decoded directly to UTF-8 (with error handling for non-ASCII)
  - PDFs: extracted via PyPDF2 or pdfplumber to plain text
  - Images: loaded as binary via Pillow, metadata inspected in-place

### 1.3 Model Router

- **Responsibility**: Determine file type, select appropriate detectors, invoke them, aggregate results, compute risk label, persist to database
- **Non-responsibility**: Does not analyze content directly; does not modify detector logic; does not implement detection heuristics
- **Immutability principle**: Router logic is frozen and will not be modified during detector implementation or enhancement
- **File type routing**:
  - Text (`.txt`, `.md`, `.rtf`, `text/*`) → `[text_pdf, pii]`
  - PDF (`.pdf`, `application/pdf`) → `[text_pdf, pii]`
  - Image (`.jpg`, `.png`, `.webp`, `image/*`) → `[image_deepfake]`

### 1.4 Detection Modules (Phase 2)

Three independent detector modules implement explainable, heuristic-based analysis:

- **PII Detector** (`analysis/detectors/pii.py`): Uses Microsoft Presidio Analyzer + spaCy for entity recognition
- **Text/PDF Detector** (`analysis/detectors/text_pdf.py`): Implements heuristic scoring based on sentence variance, repetition, and vocabulary
- **Image/Deepfake Detector** (`analysis/detectors/image_deepfake.py`): Implements heuristic scoring based on metadata, compression, resolution, and face sanity

All detectors:
- Accept binary or text input and metadata (unused for analysis, preserved in output)
- Return standardized JSON output: `{detection_type, confidence_score, flags, short_explanation}`
- Are stateless pure functions (no side effects, no database writes, no external API calls)
- Fail gracefully: any exception is caught and returned as a detector result (never crashes the pipeline)

### 1.5 Database Layer

- **Database**: PostgreSQL 12+
- **ORM**: Django ORM
- **Models**: `AnalysisFile`, `DetectionRun`, `DetectorResult` (see Section 6 for details)
- **Router-only writes**: Only the router writes to the database; detectors have no database access
- **No raw content storage**: Only metadata, detector outputs, and risk labels are persisted

---

## 2. Model Router (Critical Component)

### 2.1 Responsibilities

The router is responsible for:

1. **File type classification**: Inspect filename and MIME type to determine routing category
2. **Detector selection**: Choose which detectors to invoke based on file type
3. **Detector invocation**: Call each detector with extracted content and metadata
4. **Output aggregation**: Collect detector results into a single unified report
5. **Risk label computation**: Calculate overall risk (LOW/MEDIUM/HIGH) based on maximum detector confidence
6. **Database persistence**: Create `AnalysisFile`, `DetectionRun`, and `DetectorResult` records
7. **Response formatting**: Return JSON response to the API layer

### 2.2 Non-Responsibilities

The router explicitly does NOT:

- Implement detection logic (analysis is delegated to detectors)
- Interpret detector results (confidence and flags are passed through unchanged)
- Filter, sanitize, or modify detector outputs
- Make decisions about content classification or judgement (risk label is mathematical, not judgement)
- Store raw content beyond the analysis session
- Communicate with external APIs or services

### 2.3 Why Router Immutability Matters

The router is the single point of consistency in the system. By freezing its logic:

- **Auditability**: All future detection improvements are isolated to detector modules; the aggregation logic remains verifiable
- **Stability**: New detector implementations cannot introduce side effects or database corruption
- **Extensibility**: New detectors can be added by extending the routing logic minimally (one new entry in the detector list)
- **Reproducibility**: Analysis pipeline flow is fixed, enabling regression testing and forensic verification

---

## 3. Detection Pipeline (Step-by-Step)

### 3.1 Flow Diagram

```
User submits file → API validates input → Router extracts content
    ↓
Router determines file type (text/pdf/image)
    ↓
Router selects detectors [text_pdf, pii] or [image_deepfake]
    ↓
For each detector:
    ├─ Invoke pure function with (content, metadata)
    ├─ Detector analyzes locally, returns {detection_type, confidence, flags, explanation}
    ├─ On exception: Detector catches error, returns {detection_type, confidence=0.0, flags=["error"], explanation=<message>}
    └─ Router stores result in output list
    ↓
Router computes risk_label = MAX(detector confidences)
    ├─ if max < 0.4 → LOW
    ├─ elif max < 0.8 → MEDIUM
    └─ else → HIGH
    ↓
Router creates database records (AnalysisFile, DetectionRun, DetectorResult)
    ↓
Router returns unified JSON response to API layer
    ↓
User receives {file_metadata, detectors_executed, results, risk_label}
```

### 3.2 Determinism and Error Isolation

**Determinism**: Every step is deterministic. Given identical input, the analysis is identical. No randomness, no statistical variation, no model drift.

**Error Isolation**: If one detector fails (exception), the error is caught by the detector's try-catch block, returned as a result object with `flags=["error"]`, and does not stop other detectors or crash the pipeline. This ensures that one failing module does not render the entire analysis unusable.

---

## 4. Detection Modules (Phase 2 Implementation)

### 4.1 PII Detector (Presidio + spaCy)

**Location**: `backend/analysis/detectors/pii.py`

**Dependencies**: `presidio-analyzer==2.2.355`, `spacy==3.7.2`, `en_core_web_sm` model

**Algorithm**:
1. Initialize Presidio Analyzer with spaCy NLP engine (lazy initialization)
2. Analyze text for Named Entity Recognition (NER) using spaCy + Presidio's entity recognizers
3. Collect detected entities by type (e.g., EMAIL_ADDRESS, CREDIT_CARD, PERSON, etc.)
4. Compute confidence score as the maximum score across all detected entities (0.0–1.0)
5. Build flags list from entity types found (e.g., `["pii:EMAIL_ADDRESS", "pii:PHONE_NUMBER"]`)
6. Return `{detection_type: "pii", confidence_score, flags, short_explanation}`

**Output Contract**:
```json
{
  "detection_type": "pii",
  "confidence_score": 0.9,
  "flags": ["pii:EMAIL_ADDRESS", "pii:PERSON", "pii:PHONE_NUMBER"],
  "short_explanation": "Detected 7 PII spans across 3 type(s)."
}
```

**Privacy Safeguard**: Entity types and counts are returned; raw values (actual email addresses, phone numbers, SSNs) are never stored or logged.

**Error Handling**: If spaCy model is not installed or Presidio initialization fails, detector returns `confidence_score=0.0`, `flags=["pii_unavailable"]`, with explanatory message.

### 4.2 Text/PDF AI-Likelihood Detector (Heuristic-based)

**Location**: `backend/analysis/detectors/text_pdf.py`

**Algorithm**: Combines three heuristic scores with weighted averaging.

#### Heuristic 1: Sentence Length Variance (Burstiness)
- Split text into sentences using regex `[.!?]+`
- Compute sentence length (word count) for each sentence
- Calculate coefficient of variation: `stdev(lengths) / mean(lengths)`
- Interpretation:
  - Low CV (< 0.3) → uniform sentences → AI-like (score: 0.8)
  - Moderate CV (0.3–0.5) → moderate variance (score: 0.5)
  - High CV (> 0.5) → human-like variation (score: 0.2)
- Flag: `"low_burstiness"` if triggered

#### Heuristic 2: Repetition Ratio
- Extract all bigrams (two-word sequences) from text
- Compute ratio: `1 - (unique_bigrams / total_bigrams)`
- Interpretation:
  - High repetition (> 0.3) → AI-like (score: 0.9, flag: `"high_repetition"`)
  - Moderate (0.2–0.3) → slightly suspicious (score: 0.6, flag: `"high_repetition"`)
  - Low (< 0.1) → human-like (score: 0.1)

#### Heuristic 3: Vocabulary Richness (Type-Token Ratio)
- Count unique words vs. total words: `TTR = unique_words / total_words`
- Interpretation:
  - Low TTR (< 0.4) → repetitive vocabulary → AI-like (score: 0.8, flag: `"low_vocabulary_diversity"`)
  - Moderate (0.4–0.55) → mixed (score: 0.5)
  - High (> 0.55) → rich vocabulary → human-like (score: 0.2)

#### Final Scoring
```
confidence_score = 0.4 × burstiness + 0.3 × repetition + 0.3 × vocabulary
```
Clamp to [0.0, 1.0].

**Text Length Gate**: If text < 200 characters, return `confidence_score=0.0`, `flags=["text_too_short"]`. This prevents false positives on short snippets.

**Output Contract**:
```json
{
  "detection_type": "text_pdf",
  "confidence_score": 0.62,
  "flags": ["low_burstiness", "high_repetition"],
  "short_explanation": "Text shows strong AI-generated patterns: uniform sentence structure, high phrase repetition."
}
```

**Why Heuristics, Not ML?**
- Heuristics are fully explainable: each score has a clear, auditable rule
- No ML weights or hidden decision boundaries
- Deterministic: identical input → identical output
- No training data bias or model drift

### 4.3 Image/Deepfake Risk Detector (Heuristic-based)

**Location**: `backend/analysis/detectors/image_deepfake.py`

**Dependencies**: Pillow, OpenCV (optional, gracefully skipped if unavailable)

**Algorithm**: Combines four heuristic scores with weighted averaging.

#### Heuristic 1: EXIF and Metadata Analysis (Weight: 35%)

**For missing EXIF (common in AI/synthetic images)**:
- Check PNG metadata for AI generator tags: "Stable Diffusion", "Midjourney", "DALL-E", "ComfyUI", "Automatic1111", etc.
- If generator hint found → score: 0.95, flag: `"ai_generator_metadata"`
- If missing EXIF + no generator tag + abnormal DPI → score: 0.85, flag: `"abnormal_dpi"`
- If missing EXIF + clean metadata → score: 0.8, flag: `"missing_exif"`

**For present EXIF**:
- Check for camera make/model/datetime tags (genuine photos typically have at least 2 of 3)
- If incomplete (< 2 tags) → score: 0.6, flag: `"incomplete_exif"`
- If complete → score: 0.1 (authentic-looking)
- Also scan for generator metadata if EXIF present → score: 0.85 if found

#### Heuristic 2: JPEG Compression Artifacts (Weight: 30%)

- Compute bytes-per-pixel: `image_size_bytes / (width × height)`
- Interpretation:
  - Typical camera JPEG: 0.5–2 bytes/pixel
  - Highly compressed or re-encoded: < 0.3 or > 3 bytes/pixel
- If abnormal → score: 0.7, flag: `"abnormal_compression"`
- If slightly suspicious (< 0.5) → score: 0.4, flag: `"abnormal_compression"`
- For non-JPEG images: minimal score (0.1)

#### Heuristic 3: Resolution and Aspect Ratio (Weight: 20%)

- Check for AI-like standard dimensions: (1024×1024), (512×512), (768×768), (1920×1080), etc.
- Check for extreme aspect ratios: < 0.5 or > 2.0 (sign of upscaling)
- Check for unusual dimensions: < 200px or > 8000px in either dimension
- Scoring:
  - Extreme aspect ratio → score: 0.5, flag: `"unusual_resolution"`
  - Very small/large dimensions → score: 0.3–0.4, flag: `"unusual_resolution"`
  - Normal dimensions → score: 0.1

#### Heuristic 4: Face Presence Sanity (Weight: 15%)

- Uses OpenCV Haar cascade classifier for lightweight face detection (no identity recognition)
- Compute aspect ratio to determine if image is portrait-oriented (width/height < 1.2)
- Scoring:
  - Portrait image with zero faces detected → score: 0.6, flag: `"face_inconsistency"` (likely not a real photo)
  - More than 5 faces detected → score: 0.5, flag: `"face_inconsistency"` (likely a collage or synthetic)
  - 1–2 faces (expected for portrait) → score: 0.1 (authentic)
  - If OpenCV unavailable: score: 0.0, no flag (heuristic skipped gracefully)

#### Final Scoring
```
confidence_score = 0.35 × metadata + 0.30 × compression + 0.20 × resolution + 0.15 × face
```
Clamp to [0.0, 1.0].

**Output Contract**:
```json
{
  "detection_type": "image_deepfake",
  "confidence_score": 0.58,
  "flags": ["missing_exif", "abnormal_compression"],
  "short_explanation": "Image shows moderate manipulation signals: missing/incomplete camera metadata, abnormal compression patterns."
}
```

**Why Heuristics, Not Deep Learning?**
- No model inference overhead or latency
- Fully interpretable and auditable
- No dependency on training data or model weights
- Deterministic and reproducible
- Extensible: future ML models can be added as additional heuristics without replacing existing logic

---

## 5. Unified Risk Report

### 5.1 Report Structure

The unified report is the primary output of the analysis system:

```json
{
  "file_metadata": {
    "name": "document.pdf",
    "content_type": "application/pdf",
    "size_bytes": 45120,
    "file_type": "pdf"
  },
  "detectors_executed": ["text_pdf", "pii"],
  "results": [
    {
      "detection_type": "text_pdf",
      "confidence_score": 0.35,
      "flags": [],
      "short_explanation": "Text shows human-like characteristics: varied sentence structure and rich vocabulary."
    },
    {
      "detection_type": "pii",
      "confidence_score": 0.9,
      "flags": ["pii:EMAIL_ADDRESS", "pii:PERSON"],
      "short_explanation": "Detected 5 PII spans across 2 type(s)."
    }
  ],
  "risk_label": "HIGH"
}
```

### 5.2 Confidence Score Meaning

Confidence scores are **heuristic-derived indicators**, not probabilities or certainty measures:

- **0.0–0.3**: Content does not trigger suspicious heuristics; appears consistent with authentic, human-created material
- **0.4–0.6**: Content triggers some suspicious heuristics; warrants human review
- **0.7–1.0**: Content triggers multiple or strong suspicious heuristics; high likelihood of manipulation, synthetic origin, or sensitive information

**Important caveat**: Confidence scores are not calibrated against ground truth. They reflect the strength of heuristic signals, not accuracy percentages. A score of 0.8 does not mean "80% likely to be AI-generated"; it means "eight out of ten heuristic signals fired."

### 5.3 Risk Label Logic

The overall `risk_label` is derived deterministically from detector confidence scores:

```
max_confidence = MAX(detector_scores)

if max_confidence < 0.4:
    risk_label = "LOW"
elif max_confidence < 0.8:
    risk_label = "MEDIUM"
else:
    risk_label = "HIGH"
```

This is a mathematical aggregation, not a judgment. The label indicates the strength of risk signals detected, not the actual risk to an organization.

### 5.4 Why This is a Risk Signal, Not a Judgment

AI-Awareness reports **what was detected**, not **what should be done about it**. 

- A HIGH risk label indicates multiple heuristic signals of manipulation or sensitivity, not a determination that the content is malicious
- Actual threat assessment, policy decisions, and enforcement actions are the responsibility of human analysts and institutional processes
- The system explicitly does not make automated decisions about blocking, flagging, or reporting content

---

## 6. Data Model (Conceptual)

### 6.1 AnalysisFile

Represents a submitted file for analysis.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `original_name` | String | Original filename |
| `content_type` | String | MIME type |
| `size_bytes` | Integer | File size in bytes |
| `created_at` | Timestamp | Submission timestamp |

### 6.2 DetectionRun

Represents a single analysis execution for a file.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `file` | ForeignKey | Reference to AnalysisFile |
| `user` | ForeignKey or NULL | User who submitted (if applicable) |
| `risk_label` | Enum | LOW / MEDIUM / HIGH |
| `detectors_executed` | String[] | List of detector names invoked |
| `created_at` | Timestamp | Execution timestamp |

### 6.3 DetectorResult

Represents the output of a single detector for a single run.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `run` | ForeignKey | Reference to DetectionRun |
| `detector_name` | String | Name of detector (e.g., "pii", "text_pdf", "image_deepfake") |
| `output` | JSON | Full detector output: `{detection_type, confidence_score, flags, short_explanation}` |

### 6.4 Router-Only Write Rule

**Only the router may write to the database.** Detectors are pure functions with no database access.

This rule ensures:
- Consistency: All database writes follow the same validation and error-handling logic
- Auditability: Database state changes are traceable to router decisions
- Isolation: Detector bugs or exceptions cannot corrupt the database
- Testability: Detectors can be tested and updated independently without database access

---

## 7. Privacy, Safety, and Legal Posture

### 7.1 What Data Is Never Stored

- **Raw file content**: Submitted files are extracted, analyzed in memory, and discarded (not persisted)
- **Raw PII values**: Presidio detector returns entity type counts only; actual names, phone numbers, SSNs, etc. are never logged or stored
- **Raw text**: Text from submissions is not logged; only analysis results (confidence, flags) are stored
- **Face identities**: Image detector detects face presence/count but never identifies or stores personal identity information
- **User behavior tracking**: Submissions are analyzed independently; no cross-submission tracking, profiling, or correlation is performed

### 7.2 Why This Design is Safe for Institutional Use

1. **Compliance**: Minimal data retention reduces data protection and privacy regulation exposure
2. **Incident response**: No raw content in database means less sensitive data at risk in case of breach
3. **User trust**: Privacy-by-design builds confidence in institutional cybersecurity processes
4. **Auditability**: Clean, minimal data model is easier to audit and verify for correctness

### 7.3 Explainability and Auditability

Every aspect of analysis is traceable:

- **Detection rules**: All heuristics are documented and auditable (this document)
- **Scoring logic**: Confidence calculation is mathematical and reproducible
- **Database records**: Analysis results are queryable and verifiable
- **Error handling**: Failures are recorded as detector output, enabling forensic analysis

An independent reviewer can:
- Re-submit a file and verify identical results (determinism)
- Audit the detection rules and scoring logic (explainability)
- Query the database to understand how a specific risk assessment was computed
- Modify detector rules and verify behavior changes (testability)

---

## 8. Extensibility and Future Work

### 8.1 How ML Models Can Be Added Later

The system is designed for hybrid heuristic + ML analysis:

**Option 1: ML as a new detector**
```python
# backend/analysis/detectors/ml_classifier.py
def detect(content, metadata):
    # Load pre-trained ML model
    # Run inference
    # Return standardized output: {detection_type, confidence_score, flags, short_explanation}
    # Router invokes identically to heuristic detectors

```

The router would add `"ml_classifier"` to the detector list for applicable file types. No router logic changes needed.

**Option 2: ML as a heuristic enhancement**
Existing heuristics could be enriched with ML scores without replacing them:
```python
# In text_pdf detector
heuristic_score = 0.5  # from existing heuristics
ml_score = model.predict(text)
blended_score = 0.6 * heuristic_score + 0.4 * ml_score
```

### 8.2 How Phase 3 Will Build on Phase 2 Data

Phase 3 (National Cyber Threat Intelligence) will use Phase 2 analysis data as input:

- **Temporal trends**: Query `DetectionRun` records to identify emerging attack patterns (increasing PII submissions, AI-generated phishing, etc.)
- **Geolocation analysis**: Combine submission metadata with geographic data to identify regional threat hotspots
- **Anomaly detection**: Compare individual submissions against cohort baselines to flag outliers
- **Reporting**: Aggregate Phase 2 results to generate institutional risk dashboards

Phase 3 will NOT modify Phase 2 detection logic or database schema.

### 8.3 Explicitly: Phase 3 Is Not Implemented

The current system (Phase 2) does not include:
- National threat database queries
- Geolocation analysis
- Temporal anomaly detection
- Automated reporting to government agencies
- Cross-institutional data sharing

These features are planned for Phase 3 and will be implemented in a future release without disrupting Phase 2 functionality.

---

## 9. Non-Goals

AI-Awareness explicitly does NOT:

- **Automated law enforcement action**: The system does not block, remove, or report content to authorities automatically. Risk assessments are for human review only.
- **Identity attribution**: Analysis does not determine who submitted content or associate submissions with personal identity (no tracking, no profiling).
- **Black-box decisions**: All detection is explained; no opaque ML model decides outcomes.
- **Content moderation or judgment**: The system detects signals; it does not judge whether content is "acceptable" or "harmful."
- **Endpoint security**: This is not an antivirus, firewall, or intrusion detection system; it analyzes user-submitted content only.
- **Real-time threat intel**: Phase 2 provides no threat feeds, vulnerability databases, or real-time attack alerts (Phase 3 planned).

---

## 10. Deployment Considerations

### 10.1 Minimum Requirements

- Python 3.11+
- PostgreSQL 12+
- 2 GB RAM (minimum; 4+ GB recommended for concurrent requests)
- Stable internet connection (one-time: to download spaCy model; OpenCV cascades)

### 10.2 Performance Notes

- **Typical analysis time**:
  - Text (< 10KB): 100–500 ms
  - PDF (< 50 pages): 500–2000 ms
  - Image: 200–800 ms
- **Concurrent requests**: Django development server supports limited concurrency; use Gunicorn/uWSGI for production
- **Database**: PostgreSQL should be on reliable storage; consider automated backups

### 10.3 Scalability

Phase 2 is designed for institutional use (100–1000 submissions/day). For larger volumes:
- Scale horizontally: multiple Django application servers behind a load balancer
- Use connection pooling (e.g., PgBouncer) for PostgreSQL
- Consider async processing (Celery + Redis) for long-running analyses (Phase 3+)

---

## References

- Presidio Analyzer Documentation: https://microsoft-presidio.readthedocs.io/
- spaCy Documentation: https://spacy.io/
- Django Documentation: https://docs.djangoproject.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
