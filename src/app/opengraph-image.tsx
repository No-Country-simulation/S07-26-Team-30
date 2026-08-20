import { ImageResponse } from "next/og";

export const alt = "PhysaFlow Stranded Capacity Index Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FOREST = "#0F2B20";
const GOLD = "#d4a94e";

// Carga DM Sans (la fuente del sitio) desde Google Fonts en try/catch: si el
// fetch falla (build sin red, rate limit, etc.) devuelve null y la imagen usa
// la fuente del sistema. Nunca rompe la ruta.
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        },
      },
    ).then((res) => res.text());

    const url = css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2/)?.[0];
    if (!url) return null;

    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const [regular, semibold, bold] = await Promise.all([
    loadFont(400),
    loadFont(600),
    loadFont(700),
  ]);

  const fontEntries = [
    [400, regular],
    [600, semibold],
    [700, bold],
  ] as const;
  const fonts = fontEntries.flatMap(([weight, data]) =>
    data ? [{ name: "DM Sans", data, weight, style: "normal" }] : [],
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: FOREST,
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: fonts.length > 0 ? "DM Sans" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: GOLD,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.35em",
            }}
          >
            PHYSAFLOW
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 22 }}>
            PSCI — 2026
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Stranded Capacity
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: GOLD,
            }}
          >
            Index Report
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            The hidden constraint behind AI infrastructure
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 6,
              borderRadius: 3,
              backgroundColor: GOLD,
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>
            physaflow.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}