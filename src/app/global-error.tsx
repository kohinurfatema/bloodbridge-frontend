"use client";

// Replaces the root layout when it crashes, so it can't rely on globals.css
// or providers — styles are inline and it follows the OS color scheme.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          colorScheme: "light dark",
          textAlign: "center",
          padding: 16,
        }}
      >
        <title>Something went wrong — BloodBridge</title>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>
            BloodBridge hit an unexpected error. Please try again.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.5 }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => unstable_retry()}
            style={{
              background: "#c81e1e",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
