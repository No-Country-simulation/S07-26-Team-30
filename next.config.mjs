process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import createMDX from "@next/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  outputFileTracingRoot: __dirname,
  // @sparticuz/chromium resolves its binary via relative paths at runtime, so
  // it must NOT be bundled by webpack/turbopack: externalize it (and its
  // consumer) so the package stays in node_modules on the deployed function.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  // The compressed Chromium binary (bin/*.br) is read from disk at runtime, so
  // file tracing cannot discover it from static imports. Include it explicitly
  // for the PDF route, or the deploy ships without bin/ and executablePath()
  // fails with "The input directory ... does not exist".
  outputFileTracingIncludes: {
    "/api/reports/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

