import type { NavItem } from "@/types";

const NAV: Record<string, NavItem[]> = {
  "stranded-capacity-index": [
    { label: "Introduction", slug: "introduction" },
    {
      label: "Facility",
      slug: "taxonomy/facility",
      children: [
        { label: "Concept 1", slug: "taxonomy/facility/concept-1" },
        { label: "Concept 2", slug: "taxonomy/facility/concept-2" },
        { label: "Concept 3", slug: "taxonomy/facility/concept-3" },
      ],
    },
    {
      label: "IT",
      slug: "taxonomy/it",
      children: [
        { label: "Concept 1", slug: "taxonomy/it/concept-1" },
        { label: "Concept 2", slug: "taxonomy/it/concept-2" },
      ],
    },
    {
      label: "Workload",
      slug: "taxonomy/workload",
      children: [
        { label: "Concept 1", slug: "taxonomy/workload/concept-1" },
        { label: "Concept 2", slug: "taxonomy/workload/concept-2" },
      ],
    },
    { label: "Methodology", slug: "methodology" },
    { label: "Conclusion", slug: "conclusion" },
    { label: "References", slug: "references" },
    { label: "How to Cite", slug: "how-to-cite" },
  ],
};

export async function getReportNav(report: string): Promise<NavItem[]> {
  return NAV[report] ?? [];
}

function flattenSections(item: NavItem): string[] {
  if (item.children?.length) {
    return item.children.flatMap(flattenSections);
  }
  return [item.slug];
}

export function getReportSections(report: string): string[] {
  const items = NAV[report] ?? [];
  return items.flatMap(flattenSections);
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
      import("@/content/reports/stranded-capacity-index/taxonomy/facility/index.mdx"),
    "taxonomy/facility/concept-1": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/facility/concept-1.mdx"),
    "taxonomy/facility/concept-2": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/facility/concept-2.mdx"),
    "taxonomy/facility/concept-3": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/facility/concept-3.mdx"),
    "taxonomy/it": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/it/index.mdx"),
    "taxonomy/it/concept-1": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/it/concept-1.mdx"),
    "taxonomy/it/concept-2": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/it/concept-2.mdx"),
    "taxonomy/workload": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/workload/index.mdx"),
    "taxonomy/workload/concept-1": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/workload/concept-1.mdx"),
    "taxonomy/workload/concept-2": () =>
      import("@/content/reports/stranded-capacity-index/taxonomy/workload/concept-2.mdx"),
    references: () =>
      import("@/content/reports/stranded-capacity-index/references.mdx"),
    "how-to-cite": () =>
      import("@/content/reports/stranded-capacity-index/how-to-cite.mdx"),
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

export async function resolveAllMdx(
  report: string,
): Promise<Array<{ slug: string; Component: React.ComponentType }>> {
  const sections = getReportSections(report);
  const resolved: Array<{ slug: string; Component: React.ComponentType }> = [];

  for (const slug of sections) {
    const loader = MDX_MODULES[report]?.[slug];
    if (!loader) continue;
    try {
      const mod = await loader();
      resolved.push({ slug, Component: mod.default });
    } catch {
      // skip sections whose import fails
    }
  }

  return resolved;
}
