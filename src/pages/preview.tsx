// pages/preview.tsx
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/get-latest-story") // You can create this API route
      .then((res) => res.json())
      .then(setData);
  }, []);

  return data ? (
    <div>
      <h1>{data.brandName}</h1>
      <p>{data.story}</p>
      <img src={data.imageUrl} alt="Generated Visual" />
    </div>
  ) : (
    <p>Loading...</p>
  );
}
