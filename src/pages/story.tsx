// src/pages/story.tsx
import { useState } from "react";

export default function StoryBuilder() {
  const [brandName, setBrandName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
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

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  };

  // Session verification for paywall unlock
  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (sessionId) {
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) setUnlocked(true);
        });
    }
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Story-Driven Marketing</h1>

      <input
        placeholder="Brand Name"
        onChange={(e) => setBrandName(e.target.value)}
        style={{ marginBottom: 10, display: "block" }}
      />
      <input
        placeholder="Campaign Goal"
        onChange={(e) => setCampaignGoal(e.target.value)}
        style={{ marginBottom: 20, display: "block" }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Story"}
      </button>

      {story && (
        <div style={{ marginTop: 30 }}>
          <h3>Your Story</h3>
          <p>{story}</p>
          {imageUrl && <img src={imageUrl} alt="Generated Visual" width="400" />}

          {unlocked ? (
            <button style={{ marginTop: 20 }}>Download Story & Image</button>
          ) : (
            <button onClick={handleCheckout} style={{ marginTop: 20 }}>
              Unlock Download ($2.99)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
