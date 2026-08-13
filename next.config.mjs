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