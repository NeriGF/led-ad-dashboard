// src/pages/success.tsx
export default function SuccessPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>✅ Payment Successful!</h1>
      <p>Your preview slot has been unlocked.</p>
      <a href="/upload">Back to Upload</a>
    </div>
  );
}

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
