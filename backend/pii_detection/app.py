import os
from flask import Flask, render_template, request
from router import model_router
from file_handler import extract_text_from_file
from privacy_educator import generate_privacy_education

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
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
            if file.filename:
                file_path = os.path.join(UPLOAD_FOLDER, file.filename)
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
    app.run(debug=True)
