from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import Flask-CORS
import openai
import os
from dotenv import load_dotenv
from firebase_admin import credentials, firestore, initialize_app
import uuid
import base64
import json
import tempfile

# Decode from env var and write to a temp file
firebase_json_base64 = os.environ.get("FIREBASE_ADMIN_JSON")
firebase_json = base64.b64decode(firebase_json_base64).decode("utf-8")

with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".json") as f:
    f.write(firebase_json)
    firebase_path = f.name

cred = credentials.Certificate(firebase_path)
initialize_app(cred)
db = firestore.client()

load_dotenv()

app = Flask(__name__)

# ✅ Allow ALL origins, methods, and headers
CORS(app, resources={r"/generate-story": {"origins": "*"}}, supports_credentials=True)

openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route("/", methods=["GET"])
def home():
    return "Flask Server is Running!"

# ✅ Add this new image generation function here
def generate_image(prompt):
    image_response = openai.Image.create(
        prompt=prompt,
        n=1,
        size="1024x1024"
    )
    return image_response["data"][0]["url"]

# ✅ Handle preflight OPTIONS requests explicitly
@app.route("/generate-story", methods=["OPTIONS"])
def handle_options():
    response = jsonify({"message": "CORS preflight successful"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response, 200

@app.route("/generate-story", methods=["POST"])
def generate_story():
    try:
        data = request.json
        brand_name = data.get("brandName", "Unknown Brand")
        campaign_goal = data.get("campaignGoal", "Brand Awareness")

        prompt = f"Create a compelling AI-powered marketing story for '{brand_name}', focused on '{campaign_goal}'."

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a marketing AI."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=200
        )

        story = response["choices"][0]["message"]["content"].strip()

        # 🔥 Generate the image URL from DALL·E
        image_prompt = f"{brand_name} marketing campaign visual, {campaign_goal}"
        image_url = generate_image(image_prompt)

        # ✅ Save to Firestore (now inside the function scope)
        doc_ref = db.collection("marketing_stories").document(str(uuid.uuid4()))
        doc_ref.set({
            "brandName": brand_name,
            "campaignGoal": campaign_goal,
            "story": story,
            "imageUrl": image_url,
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        # ✅ Return both story and image URL
        result = {
            "story": story,
            "imageUrl": image_url,
            "choices": ["Continue", "Explore Features", "Buy Now"]
        }

        # response = jsonify({"story": story, "choices": ["Continue", "Explore Features", "Buy Now"]})
        # response.headers.add("Access-Control-Allow-Origin", "*")
        # return response
        response = jsonify({
            "story": story,
            "imageUrl": image_url,  # ✅ Add this
            "choices": ["Continue", "Explore Features", "Buy Now"]
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response


    except Exception as e:
        response = jsonify({"error": "Server error", "details": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # 👈 fallback for local dev
    print(f"✅ Flask Server Starting on port {port}...")
    app.run(debug=True, host="0.0.0.0", port=port)
