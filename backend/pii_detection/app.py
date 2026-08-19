import os
from flask import Flask, render_template, request
from router import model_router
from file_handler import extract_text_from_file
from privacy_educator import generate_privacy_education
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    education = []
    extracted_text = ""

    if request.method == "POST":
        text_input = request.form.get("text_input")

        # TEXT INPUT
        if text_input and text_input.strip():
            result = model_router(text_input)
            education = generate_privacy_education(
                result["detected_pii"], result["risk_level"]
            )

        # FILE UPLOAD
        elif "file" in request.files:
            file = request.files["file"]
            # Use secure_filename to prevent path traversal (e.g. ../../settings.py)
            safe_name = secure_filename(file.filename) if file.filename else ""
            if safe_name:
                # Enforce file size limit before saving
                file.seek(0, 2)  # Seek to end
                file_size = file.tell()
                file.seek(0)     # Reset
                if file_size > MAX_UPLOAD_BYTES:
                    return render_template("index.html", result=None, education=[],
                                           extracted_text="", error="File exceeds 5 MB limit.")
                file_path = os.path.join(UPLOAD_FOLDER, safe_name)
                file.save(file_path)

                extracted_text = extract_text_from_file(file_path)
                result = model_router(extracted_text)
                education = generate_privacy_education(
                    result["detected_pii"], result["risk_level"]
                )

    return render_template(
        "index.html",
        result=result,
        education=education,
        extracted_text=extracted_text
    )

if __name__ == "__main__":
    # Never run with debug=True — exposes interactive Werkzeug debugger (RCE risk)
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode)
