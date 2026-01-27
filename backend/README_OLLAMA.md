# Ollama Custom Model Setup

This project uses a "fine-tuned" (customized via Modelfile) local LLM running on **Ollama**.

## Prerequisites
1.  **Install Ollama**: Download from [ollama.com](https://ollama.com/).
2.  **Pull Base Model**: Ensure you have internet access to pull the base `mistral` model (approx 4GB).

## Setup Instructions

1.  **Create the Custom Model**:
    Run the following command from the project root:
    ```bash
    ollama create ai-awareness-core -f backend/Modelfile
    ```
    This creates a model named `ai-awareness-core` that includes our specific system prompts and parameters.

2.  **Verify the Model**:
    Check if the model is listed:
    ```bash
    ollama list
    ```
    You should see `ai-awareness-core`.

3.  **Run Backend**:
    The backend is configured in `core/ai_client.py` to automatically connect to `http://localhost:11434`.

## Troubleshooting
- **Connection Refused**: Make sure Ollama is running (`ollama serve`).
- **Model Not Found**: Run step 1 again.
- **Slow Performance**: Local inference depends on your GPU/CPU.
