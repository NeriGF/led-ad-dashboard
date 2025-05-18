// src/pages/cancel.tsx
export default function CancelPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>❌ Payment Canceled</h1>
      <p>Your payment was not completed. Try again when you're ready.</p>
      <a href="/upload">Back to Upload</a>
    </div>
  );
}
