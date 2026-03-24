import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a04 40%, #1c1c1c 100%)",
          position: "relative",
        }}
      >
        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232, 81, 2, 0.4) 0%, rgba(232, 81, 2, 0.1) 50%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Dark plum glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(55, 20, 28, 0.6) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            zIndex: 1,
          }}
        >
          {/* TBO logo text */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#a3a3a3",
              letterSpacing: "6px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            TBO
          </div>

          {/* Edition badge */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#E85102",
              letterSpacing: "3px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            4ª EDIÇÃO
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            Pesquisa de Clima
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: "600px",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            100% anônima · ~9 min · Sua voz importa
          </div>

          {/* Divider */}
          <div
            style={{
              width: "80px",
              height: "3px",
              background: "linear-gradient(90deg, #E85102, #EC7602)",
              borderRadius: "2px",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
