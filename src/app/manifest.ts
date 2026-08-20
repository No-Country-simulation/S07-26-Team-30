import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PhysaFlow — Stranded Capacity Index Report",
    short_name: "PhysaFlow",
    description:
      "An industry reference report on stranded capacity in AI data centers.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f3ec",
    theme_color: "#0F2B20",
    icons: [
      {
        src: "/images/icon-notext.webp",
        sizes: "any",
        type: "image/webp",
      },
    ],
  };
}