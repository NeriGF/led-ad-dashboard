# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import uuid
# import base64
# import tempfile
# import subprocess
# from dotenv import load_dotenv
# from firebase_admin import credentials, firestore, initialize_app
# from openai import OpenAI

# # ✅ Load environment variables
# load_dotenv()

# # 🔐 Firebase setup
# firebase_json_base64 = os.environ.get("FIREBASE_ADMIN_JSON")
# firebase_json = base64.b64decode(firebase_json_base64).decode("utf-8")
# with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".json") as f:
#     f.write(firebase_json)
#     firebase_path = f.name

# cred = credentials.Certificate(firebase_path)
# initialize_app(cred)
# db = firestore.client()

# # 🤖 OpenAI client
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # 🚀 Flask app
# app = Flask(__name__)
# CORS(app, resources={r"/generate-story": {"origins": "*"}}, supports_credentials=True)

# @app.route("/", methods=["GET"])
# def home():
#     return "✅ Flask Server is Running!"

# # 🖼️ Generate image with DALL·E
# def generate_image(prompt):
#     response = client.images.generate(prompt=prompt, n=1, size="1024x1024")
#     return response.data[0].url

# # 🎬 Remotion video rendering
# def render_remotion_video(story, image_url):
#     try:
#         props_json = f'{{\\"story\\": \\"{story}\\", \\"imageUrl\\": \\"{image_url}\\"}}'
#         subprocess.run([
#             "npx", "remotion", "render",
#             "HelloWorld",  # ✅ Must match your Remotion composition ID
#             "out/video.mp4",
#             f"--props={props_json}"
#         ], cwd="my-video2")
#         print("🎬 Remotion render completed!")
#     except Exception as err:
#         print("❌ Remotion render failed:", err)

# @app.route("/generate-story", methods=["POST"])
# def generate_story():
#     try:
#         data = request.json
#         brand = data.get("brandName", "Brand")
#         goal = data.get("campaignGoal", "Awareness")

#         full_prompt = f"Create a compelling AI-powered marketing story for '{brand}' focused on '{goal}'."

#         # 🧠 Generate story
#         chat_response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": "You are a marketing AI."},
#                 {"role": "user", "content": full_prompt},
#             ],
#             max_tokens=200
#         )
#         story = chat_response.choices[0].message.content.strip()

#         # 🖼️ Generate image
#         image_url = generate_image(f"{brand} marketing campaign visual, {goal}")

#         # 🧾 Save to Firestore
#         doc_ref = db.collection("marketing_stories").document(str(uuid.uuid4()))
#         doc_ref.set({
#             "brandName": brand,
#             "campaignGoal": goal,
#             "story": story,
#             "imageUrl": image_url,
#             "createdAt": firestore.SERVER_TIMESTAMP
#         })

#         # 🎬 Kick off Remotion rendering
#         render_remotion_video(story, image_url)

#         return jsonify({
#             "story": story,
#             "imageUrl": image_url,
#             "choices": ["Continue", "Explore Features", "Buy Now"]
#         })

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return jsonify({"error": "Server error", "details": str(e)}), 500

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     print(f"✅ Flask Server Starting on port {port}...")
#     app.run(debug=True, host="0.0.0.0", port=port)

@app.route("/generate-trip-recap", methods=["POST"])
def generate_trip_recap():
    try:
        data = request.json
        trip_title = data.get("tripTitle", "My Vacation")
        description = data.get("tripDescription", "")
        image_urls = data.get("imageUrls", [])  # 🖼️ List of image URLs from frontend

        if not image_urls:
            return jsonify({"error": "No image URLs provided."}), 400

        # 🧠 Generate trip summary with GPT
        full_prompt = (
            f"You are a travel storyteller AI. Create a short, emotional travel recap for this trip:\n\n"
            f"Title: {trip_title}\nDescription: {description}\n\n"
            f"Break it down into a mini story (like Day 1, Day 2...) with excitement and positive emotion."
        )

        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a travel storytelling AI."},
                {"role": "user", "content": full_prompt},
            ],
            max_tokens=500
        )
        trip_story = chat_response.choices[0].message.content.strip()

        # 📦 Save to Firestore
        doc_id = str(uuid.uuid4())
        db.collection("trip_recaps").document(doc_id).set({
            "tripTitle": trip_title,
            "tripDescription": description,
            "imageUrls": image_urls,
            "tripStory": trip_story,
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        # 🎬 Trigger Remotion video generation
        props_json = {
            "title": trip_title,
            "story": trip_story,
            "imageUrls": image_urls
        }

        # Pass as JSON string safely to CLI
        props_str = json.dumps(props_json).replace('"', '\\"')
        subprocess.run([
            "npx", "remotion", "render",
            "TravelRecap",  # Make sure this matches your composition ID
            f"out/{doc_id}.mp4",
            f"--props=\"{props_str}\""
        ], cwd="my-video2")

        print("✅ Remotion render completed.")

        return jsonify({
            "message": "Trip recap generated.",
            "story": trip_story,
            "videoPath": f"out/{doc_id}.mp4",
            "docId": doc_id
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error", "details": str(e)}), 500

