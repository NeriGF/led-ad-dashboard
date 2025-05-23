from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import base64
import tempfile
from dotenv import load_dotenv
from firebase_admin import credentials, firestore, initialize_app
import openai

# Load environment variables
load_dotenv()

# 🔐 Firebase setup
firebase_json_base64 = os.environ.get("FIREBASE_ADMIN_JSON")
firebase_json = base64.b64decode(firebase_json_base64).decode("utf-8")
with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".json") as f:
    f.write(firebase_json)
    firebase_path = f.name

cred = credentials.Certificate(firebase_path)
initialize_app(cred)
db = firestore.client()

# 🔑 OpenAI Client
openai.api_key = os.getenv("OPENAI_API_KEY")

# 🚀 Flask app
app = Flask(__name__)
CORS(app, resources={r"/generate-story": {"origins": "*"}}, supports_credentials=True)

@app.route("/", methods=["GET"])
def home():
    return "✅ Flask Server is Running!"

# 🧠 Image generator
def generate_image(prompt):
    image_response = client.images.generate(
        prompt=prompt,
        n=1,
        size="1024x1024"
    )
    return image_response.data[0].url

@app.route("/generate-story", methods=["POST"])
def generate_story():
    try:
        data = request.json
        brand_name = data.get("brandName", "Unknown Brand")
        campaign_goal = data.get("campaignGoal", "Brand Awareness")

        prompt = f"Create a compelling AI-powered marketing story for '{brand_name}', focused on '{campaign_goal}'."

        print("📦 Request Payload:", data)
        print("🔑 Using OpenAI Key:", os.getenv("OPENAI_API_KEY")[:8] + "...")

        # 🧠 Call OpenAI Chat
        response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a marketing AI."},
        {"role": "user", "content": prompt},
    ],
    max_tokens=200
)
story = response["choices"][0]["message"]["content"].strip()


        # 🖼️ Generate image
        image_prompt = f"{brand_name} marketing campaign visual, {campaign_goal}"
        image_url = generate_image(image_prompt)

        # 🧾 Save to Firestore
        doc_ref = db.collection("marketing_stories").document(str(uuid.uuid4()))
        doc_ref.set({
            "brandName": brand_name,
            "campaignGoal": campaign_goal,
            "story": story,
            "imageUrl": image_url,
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "story": story,
            "imageUrl": image_url,
            "choices": ["Continue", "Explore Features", "Buy Now"]
        })

    except Exception as e:
        import traceback
        print("❌ ERROR in /generate-story:")
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"✅ Flask Server Starting on port {port}...")
    app.run(debug=True, host="0.0.0.0", port=port)
