<<<<<<< HEAD
import createMDX from "@next/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  outputFileTracingRoot: __dirname,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

=======
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    // @sparticuz/chromium reads its bin/*.br assets via fs at runtime, so
    // Next's file tracing never detects them. Force-include the package so
    // the Chromium binary is bundled into the serverless function.
    outputFileTracingIncludes: {
      "/api/reports/pdf": ["./node_modules/@sparticuz/chromium/**/*"],
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
>>>>>>> 8fb7ec78f33e1929313f2de9a000f867c7013344
