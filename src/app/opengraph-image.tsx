import { ImageResponse } from "next/og";
export const alt = "Habib AI Studio — Your next creative direction";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#faf9f6",
        padding: "65px 75px",
        color: "#252329",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32 }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 50,
            height: 50,
            borderRadius: 12,
            background: "#6d4aff",
            color: "white",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path
              d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z"
              fill="white"
            />
          </svg>
        </span>
        Habib AI Studio
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 80,
          lineHeight: 1.1,
          letterSpacing: -4,
        }}
      >
        <span>Your ideas.</span>
        <span>A whole new</span>
        <span style={{ color: "#6d4aff", fontStyle: "italic" }}>
          creative direction.
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#726d79" }}>
        Campaign strategy · Ad copy · Visual creative
      </div>
    </div>,
    size,
  );
}
