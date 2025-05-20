export default function PreviewPage() {
  const [data, setData] = useState(null);
  const [userHasPaid, setUserHasPaid] = useState(false);

  useEffect(() => {
    const sessionId = new URL(window.location.href).searchParams.get("session_id");
    if (sessionId) {
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) setUserHasPaid(true);
        });
    }

    fetch("/api/get-latest-story")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });
    const data = await res.json();
    window.location.href = data.url;
  };

  if (!userHasPaid) {
    return <button onClick={handleCheckout}>Unlock Download</button>;
  }

  return data ? (
    <div>
      <h1>{data.brandName}</h1>
      <p>{data.story}</p>
      <img src={data.imageUrl} alt="Generated" />
      <button>Download Story</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
}
