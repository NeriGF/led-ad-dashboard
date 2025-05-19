// src/pages/upload.tsx
import { useState, useEffect } from "react";
import { storage, db } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");

    if (sessionId) {
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) {
            setUnlocked(true);
          }
        });
    }
  }, []);

  const handleUpload = async () => {
    try {
      let fileURL = "";

      if (type === "image" && file) {
        const storageRef = ref(storage, `ads/${file.name}`);
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "ads"), {
        title,
        type,
        fileURL,
        createdAt: new Date(),
      });

      setMessage("Ad uploaded successfully!");
    } catch (err) {
      setMessage("Upload failed.");
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Ad</h1>

      <input
        placeholder="Ad Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <select onChange={(e) => setType(e.target.value)}>
        <option value="text">Text</option>
        <option value="image">Image</option>
      </select>

      {type === "image" && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      )}

      <div style={{ marginTop: 20 }}>
        {unlocked ? (
          <>
            <h3>🎉 Premium unlocked!</h3>
            <button onClick={handleUpload}>Upload</button>
          </>
        ) : (
          <button onClick={handleCheckout}>Unlock More Ads (Preview)</button>
        )}
      </div>

      <p>{message}</p>
    </div>
  );
}
