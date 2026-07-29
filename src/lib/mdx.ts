import type { NavItem } from "@/types";

const NAV: Record<string, NavItem[]> = {
  "stranded-capacity-index": [
    { label: "Introduction", slug: "introduction" },
    { label: "Methodology", slug: "methodology" },
    {
      label: "Taxonomy",
      slug: "taxonomy",
      children: [
        { label: "Facility", slug: "taxonomy/facility" },
        { label: "IT", slug: "taxonomy/it" },
        { label: "Workload", slug: "taxonomy/workload" },
      ],
    },
    { label: "Citations", slug: "citations" },
    { label: "Conclusion", slug: "conclusion" },
  ],
};

export async function getReportNav(report: string): Promise<NavItem[]> {
  return NAV[report] ?? [];
}

const MDX_MODULES: Record<
  string,
  Record<string, () => Promise<{ default: React.ComponentType }>>
> = {
  "stranded-capacity-index": {
    introduction: () =>
      import("@/content/reports/stranded-capacity-index/introduction.mdx"),
    methodology: () =>
      import("@/content/reports/stranded-capacity-index/methodology.mdx"),
    "taxonomy/facility": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/facility.mdx"),
    "taxonomy/it": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/it.mdx"),
    "taxonomy/workload": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/workload.mdx"),
    citations: () =>
      import("@/content/reports/stranded-capacity-index/citations.mdx"),
    conclusion: () =>
      import("@/content/reports/stranded-capacity-index/conclusion.mdx"),
  },
};

export async function resolveMdx(
  report: string,
  section: string,
): Promise<{ default: React.ComponentType } | null> {
  const loader = MDX_MODULES[report]?.[section];
  if (!loader) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}