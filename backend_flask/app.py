from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from typing import List, Dict, Any


APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(APP_DIR, 'data.json')


def ensure_data_file_exists() -> None:
    if not os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump({"knowledge": []}, f, indent=2, ensure_ascii=False)


def load_knowledge() -> List[Dict[str, Any]]:
    ensure_data_file_exists()
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('knowledge', [])


def save_knowledge(entries: List[Dict[str, Any]]) -> None:
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump({"knowledge": entries}, f, indent=2, ensure_ascii=False)


def find_best_answer(message: str, knowledge: List[Dict[str, Any]]) -> str:
    message_lower = message.lower().strip()
    best_answer = None
    best_score = 0

    for item in knowledge:
        question = (item.get('question') or '').lower().strip()
        answer = item.get('answer') or ''

        if not question:
            continue

        # Simple keyword/substring matching with scoring
        score = 0
        if question in message_lower:
            score += 3
        # token overlap
        q_tokens = [t for t in question.replace('?', ' ').replace(',', ' ').split() if t]
        for token in q_tokens:
            if token in message_lower:
                score += 1

        if score > best_score:
            best_score = score
            best_answer = answer

    return best_answer or "I don’t know yet. You can teach me in the admin panel."


def create_app() -> Flask:
    app = Flask(__name__)
    # Allow all origins during development to avoid CORS friction
    CORS(app)

    @app.route('/', methods=['GET'])
    def home():
        return jsonify({
            "message": "AI Awareness Assistant backend is running.",
            "endpoints": {
                "POST /chat": {"body": {"message": "string"}},
                "POST /teach": {"body": {"question": "string", "answer": "string", "category": "string"}},
                "GET /health": "status check"
            }
        })

    @app.route('/chat', methods=['POST'])
    def chat():
        payload = request.get_json(silent=True) or {}
        message = (payload.get('message') or '').strip()
        if not message:
            return jsonify({"reply": "Please provide a message."}), 400

        knowledge = load_knowledge()
        reply = find_best_answer(message, knowledge)
        return jsonify({"reply": reply})

    @app.route('/teach', methods=['POST'])
    def teach():
        payload = request.get_json(silent=True) or {}
        question = (payload.get('question') or '').strip()
        answer = (payload.get('answer') or '').strip()
        category = (payload.get('category') or '').strip()

        if not question or not answer:
            return jsonify({"success": False, "message": "Question and answer are required."}), 400

        knowledge = load_knowledge()
        knowledge.append({
            "question": question,
            "answer": answer,
            "category": category
        })
        save_knowledge(knowledge)

        return jsonify({"success": True, "message": "Knowledge saved."})

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == '__main__':
    ensure_data_file_exists()
    app = create_app()
    print("Starting AI Awareness Assistant backend on http://localhost:5000 …")
    app.run(host='0.0.0.0', port=5000, debug=True)


