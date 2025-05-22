import { useState, useEffect } from "react";

export default function StoryPage() {
  const [brandName, setBrandName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = new URL(window.location.href).searchParams.get("session_id");
    if (sessionId) {
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) setPaid(true);
        });
    }
  }, []);

  const generateStory = async () => {
    setLoading(true);
    setStory("");
    setImageUrl("");
    setChoices([]);

    try {
      const res = await fetch("https://led-ad-dashboard.onrender.com/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, campaignGoal }),
      });

      const data = await res.json();
      setStory(data.story);
      setImageUrl(data.imageUrl);
      setChoices(data.choices || []);
    } catch (err) {
      setStory("Error generating story.");
    }

    setLoading(false);
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });
    const data = await res.json();
    window.location.href = data.url;
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
            {choices.map((choice, idx) => (
              <button key={idx} style={{ marginRight: 10 }}>
                {choice}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            {!paid ? (
              <button onClick={handleCheckout}>🔓 Unlock Download</button>
            ) : (
              <button>⬇️ Download Story</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
