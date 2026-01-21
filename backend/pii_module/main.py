from router import model_router
from file_handler import extract_text_from_file
from privacy_educator import generate_privacy_education

def analyze_text(text):
    result = model_router(text)

    print("\n===== RESULT =====")
    print("Action     :", result["action"])
    print("Risk Level :", result["risk_level"])
    print("Risk Score :", result["risk_score"])

    print("\nDetected PII:")
    if not result["detected_pii"]:
        print("  None")
    else:
        for p in result["detected_pii"]:
            print(
                f"  - {p['type']} | {p['masked_value']} | Confidence: {p['confidence']}"
            )

    print("\nPrivacy Education:")
    education = generate_privacy_education(
        result["detected_pii"], result["risk_level"]
    )
    for msg in education:
        print("•", msg)

    print("==================\n")

def main():
    print("\nPrivacy-Aware PII Detection System")
    print("1. Enter text to analyze")
    print("2. Upload PDF or Image")
    print("Type 'exit' to quit\n")

    while True:
        choice = input("Choose option (1/2): ").strip()

        if choice.lower() == "exit":
            break

        try:
            if choice == "1":
                text = input("\nEnter text to analyze: ").strip()
                analyze_text(text)

            elif choice == "2":
                path = input("\nEnter file path (PDF/Image): ").strip()
                extracted_text = extract_text_from_file(path)

                if not extracted_text:
                    print("❌ No readable text found in file.\n")
                    continue

                print("\n--- Extracted Text Preview ---")
                print(extracted_text[:500])
                print("------------------------------")

                analyze_text(extracted_text)

            else:
                print("❌ Invalid option\n")

        except Exception as e:
            print("❌ Error:", str(e), "\n")

if __name__ == "__main__":
    main()
