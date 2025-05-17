// src/pages/upload.tsx
import { useState } from "react";
import { storage, db } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Ad</h1>
      <input placeholder="Ad Title" onChange={(e) => setTitle(e.target.value)} />
      <select onChange={(e) => setType(e.target.value)}>
        <option value="text">Text</option>
        <option value="image">Image</option>
      </select>
      {type === "image" && (
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      )}
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
