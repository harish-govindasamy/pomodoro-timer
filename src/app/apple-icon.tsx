import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "36px",
        }}
      >
        {/* Inner circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "150px",
            height: "150px",
            borderRadius: "30px",
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
                marginBottom: "-8px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "22px",
                  background: "#22c55e",
                  borderRadius: "7px 7px 3px 3px",
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
                width: "100px",
                height: "92px",
                background: "#ffffff",
                borderRadius: "50%",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Timer display */}
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#ef4444",
                  letterSpacing: "-2px",
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
