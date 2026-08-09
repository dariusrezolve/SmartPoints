import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #059669, #0d9488)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 48,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.96)",
            border: "18px solid rgba(209, 250, 229, 0.72)",
            borderRadius: 132,
            boxShadow: "0 24px 44px rgba(6, 78, 59, 0.25)",
            display: "flex",
            height: 340,
            justifyContent: "center",
            width: 340,
          }}
        >
          <svg aria-label="Completed task" fill="none" height="230" viewBox="0 0 64 64" width="230">
            <path d="M14 33 26 45 51 19" stroke="#047857" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" />
          </svg>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#f59e0b",
            border: "12px solid #fffbeb",
            borderRadius: 999,
            boxShadow: "0 12px 24px rgba(120, 53, 15, 0.25)",
            display: "flex",
            height: 112,
            justifyContent: "center",
            position: "absolute",
            right: 44,
            top: 48,
            width: 112,
          }}
        >
          <svg aria-label="Points" fill="none" height="58" viewBox="0 0 54 54" width="58">
            <path d="M27 12v30M12 27h30" stroke="#78350f" strokeLinecap="round" strokeWidth="8" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
