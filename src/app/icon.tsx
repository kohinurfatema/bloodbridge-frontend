import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Generated at build time — a white blood drop on the brand red.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c81e1e",
          borderRadius: 14,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 2.7C12 2.7 5 10.2 5 15a7 7 0 0 0 14 0c0-4.8-7-12.3-7-12.3z" />
        </svg>
      </div>
    ),
    size,
  );
}
