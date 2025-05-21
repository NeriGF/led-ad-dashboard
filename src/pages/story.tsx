// src/pages/story.tsx
import { useState } from "react";

export default function StoryPage() {
  const [brandName, setBrandName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    setStory("");
    setImageUrl("");

    const res = await fetch("http://localhost:5001/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandName, campaignGoal }),
    });

    const data = await res.json();
    setStory(data.story);
    setImageUrl(data.imageUrl);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>AI-Generated Story-Driven Marketing</h1>

      <input
        placeholder="Brand Name"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        placeholder="Campaign Goal"
        value={campaignGoal}
        onChange={(e) => setCampaignGoal(e.target.value)}
      />
      <br />
      <button onClick={generateStory} style={{ marginTop: 20 }}>
        {loading ? "Generating..." : "Generate Story"}
      </button>

      {story && (
        <div style={{ marginTop: 30, padding: 20, backgroundColor: "#f7f7f7", borderRadius: 8 }}>
          <h2>Generated Story</h2>
          <p>{story}</p>

          {imageUrl && (
            <>
              <h3>Generated Visual</h3>
              <img src={imageUrl} alt="Generated Visual" style={{ width: "100%", maxWidth: 400 }} />
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <button>Continue</button>
            <button style={{ marginLeft: 10 }}>Explore Features</button>
            <button style={{ marginLeft: 10 }}>Buy Now</button>
          </div>
        </div>
      )}
    </div>
  );
}
