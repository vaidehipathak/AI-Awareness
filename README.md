# AI-Awareness: Explainable Cybersecurity Risk Detection Platform

## Project Overview

AI-Awareness is a deterministic, explainable cybersecurity analysis platform designed to detect and report risks in user-submitted content. The system analyzes text, PDFs, and images for indicators of personally identifiable information (PII), AI-generated text, and image manipulation or deepfakes. All analysis is performed locally using heuristic-based detection methods, returning clear, auditable risk assessments without relying on black-box machine learning models or external APIs. The platform prioritizes explainability, determinism, and privacy, making it suitable for institutional and governmental cybersecurity assessments.

## What Problem This Solves

Traditional cybersecurity helplines and reporting tools face two critical limitations:

1. **Black-box decisions**: Automated AI systems often return a binary risk classification without explanation. Users and reviewers cannot understand why content was flagged or how to interpret the assessment. This opacity undermines trust in the tool and complicates incident response.

2. **Privacy and trust concerns**: Cloud-based analysis tools often transmit user content to external APIs, raising privacy and data sovereignty concerns. Institutions need solutions that can operate entirely on-premises while maintaining full transparency into processing logic.

AI-Awareness addresses both limitations by implementing **explainable, deterministic heuristic detection** that runs locally. Every flag and confidence score is traceable to a specific, auditable rule. The same input always produces the same output, enabling reproducibility and third-party verification.

## Core Capabilities (Implemented)

### Phase 2: Detection Engine

The platform currently implements three detection modules, collectively forming a unified risk assessment engine:

- **PII Detection (Presidio + spaCy)**
  - Identifies common categories of sensitive personal information (names, email addresses, phone numbers, credit card numbers, SSNs, NHS IDs, bank account numbers, driver license numbers, URLs, locations, dates)
  - Returns entity type counts and detection confidence
  - **Does not** store or log raw values; only aggregate statistics are retained

- **Text/PDF AI-Likelihood Detection (Heuristic-based)**
  - Analyzes sentence length variance (burstiness): uniform sentence structure is more consistent with AI-generated text
  - Measures repetition ratio: higher phrase repetition suggests AI generation
  - Computes vocabulary richness (type-token ratio): lower diversity is more AI-like
  - Combines three signals with weighted averaging (40% burstiness, 30% repetition, 30% vocabulary)
  - Returns confidence score [0.0–1.0] and flags for triggered heuristics

- **Image/Deepfake Risk Detection (Heuristic-based)**
  - Analyzes EXIF and metadata: missing or incomplete camera information signals synthetic content
  - Detects JPEG compression artifacts and recompression ratios
  - Checks image resolution and aspect ratio for non-camera-like patterns
  - Performs lightweight face presence sanity checks (no identity recognition)
  - Combines four signals with weighted averaging (35% metadata, 30% compression, 20% resolution, 15% face sanity)
  - Scans PNG metadata for AI generator tags (Stable Diffusion, Midjourney, DALL-E, etc.)
  - Returns confidence score [0.0–1.0] and flags for triggered heuristics

- **Unified Risk Report**
  - Combines detector outputs into a single assessment
  - Computes overall risk label (LOW, MEDIUM, HIGH) based on maximum detector confidence
  - Each detector result includes confidence score, flags, and human-readable explanation
  - File metadata (name, type, size) is included for context

- **PostgreSQL-Backed Persistence**
  - All analyses are persisted to a relational database
  - Supports queries, auditing, and statistical analysis over time
  - Detector results are stored as JSON, enabling future enrichment without schema changes

## System Design Philosophy

AI-Awareness is built on four core principles:

1. **Heuristic-first, not ML-first**
   - Detection uses deterministic, interpretable rules rather than neural networks or statistical models
   - Heuristics are chosen for explainability and robustness, not marginal accuracy gains

2. **Determinism**
   - Same input always produces identical output
   - No randomness, no model weight variation, no online learning
   - Enables reproducibility, auditability, and third-party verification

3. **Modular router architecture**
   - A central router decides which detectors to invoke based on file type
   - Detectors are stateless, pure functions—they do not write to the database
   - Only the router persists results, ensuring consistency and auditability

4. **Privacy-first by design**
   - Raw PII values are never stored; only entity type counts are retained
   - Raw text is not logged or stored beyond the analysis session
   - No face identification or personal attribution
   - No external API calls or data transmission

## High-Level Architecture

```
User Upload
    ↓
API Layer (/api/analyze/) — multipart file + metadata
    ↓
File Validation & Extraction
    ↓
Model Router
├─ Text file → routes to [text_pdf, pii] detectors
├─ PDF file → routes to [text_pdf, pii] detectors
└─ Image file → routes to [image_deepfake] detector
    ↓
Parallel Detector Invocation (pure functions)
├─ text_pdf → heuristic analysis → {confidence, flags, explanation}
├─ pii → Presidio entity detection → {entity_types, count, confidence}
└─ image_deepfake → heuristic analysis → {confidence, flags, explanation}
    ↓
Unified Report Assembly (router responsibility)
    ├─ Collect detector outputs
    ├─ Compute risk label (max confidence)
    ├─ Build final JSON response
    └─ Persist to database (AnalysisFile, DetectionRun, DetectorResult)
    ↓
User Response
```

The router is the only component that writes to the database. Detectors are stateless and have no side effects. All analysis is deterministic and repeatable.

## API Overview

### Endpoint

```
POST /api/analyze/
```

**Input**: Multipart form data
- `file` (required): Text, PDF, or image file (binary)
- `metadata` (optional): JSON string with arbitrary metadata (e.g., `{"source":"user_submission"}`)

**Output**: JSON response
```json
{
  "file_metadata": {
    "name": "example.txt",
    "content_type": "text/plain",
    "size_bytes": 1024,
    "file_type": "text"
  },
  "detectors_executed": ["text_pdf", "pii"],
  "results": [
    {
      "detection_type": "text_pdf",
      "confidence_score": 0.45,
      "flags": ["low_burstiness"],
      "short_explanation": "Text shows moderate AI-generated patterns: uniform sentence structure."
    },
    {
      "detection_type": "pii",
      "confidence_score": 0.8,
      "flags": ["pii:EMAIL_ADDRESS", "pii:PHONE_NUMBER"],
      "short_explanation": "Detected 2 PII spans across 2 type(s)."
    }
  ],
  "risk_label": "MEDIUM"
}
```

**Supported File Types**
- Text: `.txt`, `.md`, `.rtf` (plain text files)
- PDF: `.pdf` (binary PDFs converted to text via router)
- Image: `.jpg`, `.jpeg`, `.png`, `.webp`

**Risk Label Logic**
- `LOW`: maximum detector confidence < 0.4
- `MEDIUM`: maximum detector confidence 0.4–0.7
- `HIGH`: maximum detector confidence ≥ 0.8

## Phase Separation

AI-Awareness is designed as a multi-phase system:

### Phase 1: Infrastructure (Complete)
- Django backend with PostgreSQL database
- CORS-enabled API layer
- Role-based access control
- Environment-driven configuration

### Phase 2: Detection Engine (Current)
- Model Router with explicit file-type routing
- Three heuristic-based detectors (PII, text, image)
- Unified risk reporting
- Database persistence
- All detector implementations are deterministic and explainable

### Phase 3: National Cyber Threat Intelligence (Future, Not Implemented)
- Integration with national threat databases
- Geolocation-based risk assessment
- Temporal threat trend analysis
- Statistical anomaly detection across submission cohorts
- **Phase 3 is not currently implemented and does not influence Phase 2 functionality**

## Security and Privacy Guarantees

AI-Awareness implements strict privacy and security controls:

- **No raw PII storage**: Presidio detector returns only entity type counts, never raw values (names, phone numbers, account numbers, etc.)
- **No text logging**: Raw file content is processed in memory and discarded after analysis; it is never logged to disk or database
- **No face recognition**: Image analysis detects face presence (count, consistency) but never identifies or attributes identity
- **No external APIs**: All processing occurs locally; no content is transmitted to cloud services or third-party APIs
- **No tracking**: User submissions are analyzed and reported without correlation to user identity or historical tracking
- **Deterministic audit trail**: All analysis is reproducible; the same file submitted twice produces identical results, enabling verification and dispute resolution

## Getting Started (High-Level)

### Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/AI-Awareness.git
cd AI-Awareness
```

2. Create a `.env` file in the `backend` directory with the following variables:
```
DB_NAME=ai_awareness_db
DB_USER=postgres
DB_PASSWORD=<your_postgres_password>
DB_HOST=localhost
DB_PORT=5432
DEBUG=False
SECRET_KEY=<generate_a_random_string>
ALLOWED_HOSTS=localhost,127.0.0.1
```

3. Install backend dependencies:
```bash
cd backend
python -m venv django
source django/bin/activate  # On Windows: django\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. Start the backend server:
```bash
python manage.py runserver 9000
```

6. Frontend (optional):
```bash
cd ../frontend
npm install
npm run dev
```

### First Test

```bash
curl -X POST http://localhost:9000/api/analyze/ \
  -F "file=@/path/to/test.txt" \
  -F 'metadata={"source":"test"}'
```

### Health Check

```bash
curl http://localhost:9000/api/health/
```

## Architecture Documentation

For a detailed technical overview of the system architecture, detection pipeline, data model, and extensibility strategy, see [docs/architecture.md](docs/architecture.md).

## License

[Your License Here]

## Contact

For questions, bug reports, or contributions, contact: [contact@example.com]
