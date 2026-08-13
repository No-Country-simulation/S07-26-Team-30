import { NextRequest, NextResponse } from "next/server";
import { chromium as playwrightChromium, type Browser } from "playwright-core";
import sparticuzChromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reuse one Chromium instance across requests: launching per request is the
// dominant fixed cost. The instance survives in the same Node process (dev,
// self-hosted). On serverless platforms each invocation gets a fresh process,
// so this cache is a no-op there — behavior stays correct.
let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    // Serverless has no system browser. @sparticuz/chromium ships a
    // compressed Chromium tuned for Lambda/Vercel (no system deps needed).
    return playwrightChromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    });
  }
  // Local dev: use the Chromium installed by `npx playwright install chromium`.
  return playwrightChromium.launch();
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser();
  }
  return browserPromise;
}

async function withBrowser<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
  try {
    const browser = await getBrowser();
    return await fn(browser);
  } catch (error) {
    // The shared browser may have crashed — relaunch once and retry.
    browserPromise = null;
    const browser = await getBrowser();
    return await fn(browser);
  }
}

export async function GET(request: NextRequest) {
  const slug =
    request.nextUrl.searchParams.get("slug") ?? "stranded-capacity-index";
  const url = new URL(`/reports/${slug}`, request.nextUrl.origin).toString();

  try {
    const pdf = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      try {
        // domcontentloaded instead of networkidle: no long polls to wait for,
        // and the canvas/fonts waits below cover the actual dependencies.
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        // Charts use ECharts SVG renderer; ECharts stamps its initialized
        // container with [_echarts_instance_]. Waiting for that attribute is
        // renderer-agnostic (a "figure canvas" selector would never match).
        await page
          .waitForSelector("div[_echarts_instance_]", { timeout: 20_000 })
          .catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        // Short settle so ECharts finishes its intro animations.
        await page.waitForTimeout(600);

        return await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: true,
          headerTemplate: "<div></div>",
          footerTemplate: [
            "<div style=\"width:100%; padding:0 15mm; display:flex; justify-content:space-between; align-items:center; font-size:8.5px; color:#6b7280; font-family:Helvetica, Arial, sans-serif;\">",
            "<span>Source: PhysaFlow Stranded Capacity Index</span>",
            "<span>Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span>",
            "</div>",
          ].join(""),
        });
      } finally {
        await page.close();
      }
    });

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="physaflow-${slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[pdf] generation failed:", error);
    return NextResponse.json(
      { error: "No se pudo generar el PDF" },
      { status: 500 },
    );
  }
}