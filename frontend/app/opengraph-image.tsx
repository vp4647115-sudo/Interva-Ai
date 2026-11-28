import { ImageResponse } from "next/og";

export const alt = "IntervAi — Practice interviews with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #f8f6ff 0%, #ece7ff 55%, #ffffff 100%)",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ color: "#6C4CFF", fontSize: 34, fontWeight: 700 }}>INTERVAI</div>
        <div style={{ marginTop: 32, fontSize: 78, lineHeight: 1.08, fontWeight: 800, display: "flex", flexDirection: "column" }}>
          <span>Practice interviews.</span>
          <span>Build real confidence.</span>
        </div>
        <div style={{ marginTop: 28, color: "#667085", fontSize: 30 }}>
          AI mock interviews with feedback tailored to you
        </div>
      </div>
    ),
    size,
  );
}
