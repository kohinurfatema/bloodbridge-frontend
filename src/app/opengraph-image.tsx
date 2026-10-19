import { ImageResponse } from "next/og";

export const alt = "BloodBridge — Find blood donors in minutes, not hours";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card, generated at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #c81e1e 0%, #7f1212 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2.7C12 2.7 5 10.2 5 15a7 7 0 0 0 14 0c0-4.8-7-12.3-7-12.3z" />
          </svg>
          BloodBridge
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Find blood donors in minutes, not hours.
          </div>
          <div style={{ fontSize: 32, opacity: 0.85 }}>
            Emergency alerts · Donor matching · Secure payments
          </div>
        </div>
      </div>
    ),
    size,
  );
}
