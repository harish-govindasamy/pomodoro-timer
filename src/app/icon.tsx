import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          borderRadius: "96px",
        }}
      >
        {/* Inner circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "420px",
            height: "420px",
            borderRadius: "84px",
            background: "rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Tomato shape */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Stem */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "-20px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "60px",
                  background: "#22c55e",
                  borderRadius: "20px 20px 8px 8px",
                  display: "flex",
                }}
              />
            </div>

            {/* Tomato body */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "280px",
                height: "260px",
                background: "#ffffff",
                borderRadius: "50%",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Timer display */}
              <span
                style={{
                  fontSize: "72px",
                  fontWeight: "bold",
                  color: "#ef4444",
                  letterSpacing: "-4px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                25
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
