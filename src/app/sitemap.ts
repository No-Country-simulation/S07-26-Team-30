import type { MetadataRoute } from "next";
import { getReportSections } from "@/lib/mdx";

const BASE_URL = "https://physaflow.com";
const REPORT_NAME = "stranded-capacity-index";

export default function sitemap(): MetadataRoute.Sitemap {
  const reportUrl = `${BASE_URL}/reports/${REPORT_NAME}`;
  const sectionUrls = getReportSections(REPORT_NAME).map(
    (section) => `${reportUrl}/${section}`,
  );

  return [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    { url: reportUrl, lastModified: new Date() },
    ...sectionUrls.map((url) => ({ url, lastModified: new Date() })),
  ];
}