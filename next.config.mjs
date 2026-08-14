process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import createMDX from "@next/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  outputFileTracingRoot: __dirname,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

