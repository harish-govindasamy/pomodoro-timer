import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Pomofocus - Pomodoro Timer & Task Manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {/* Timer circle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
              boxShadow: "0 20px 60px rgba(239, 68, 68, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "#1a1a2e",
              }}
            >
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  letterSpacing: "-2px",
                }}
              >
                25:00
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: "#ffffff",
                letterSpacing: "-2px",
              }}
            >
              Pomofocus
            </span>
            <span
              style={{
                fontSize: "22px",
                color: "rgba(255, 255, 255, 0.7)",
                letterSpacing: "1px",
              }}
            >
              Pomodoro Timer & Task Manager
            </span>
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "16px",
            }}
          >
            {["⏱️ Focus Timer", "✅ Task Manager", "📊 Statistics"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#ffffff",
                    }}
                  >
                    {feature}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Free & Open Source • Growth Mindset Academy
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
