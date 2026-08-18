import type { NavItem } from "@/types";

const NAV: Record<string, NavItem[]> = {
  "stranded-capacity-index": [
    {
      label: "1. Introduction",
      slug: "01-executive-summary",
      anchor: "1-executive-summary-introduction",
    },
    {
      label: "2. Taxonomy",
      slug: "02-facility-layer",
      anchor: "2-taxonomy-of-stranded-capacity",
      children: [
        {
          label: "2.1. Facility Layer",
          slug: "02-facility-layer",
          anchor: "2-1-layer-1-facility-power-thermal-infrastructure",
        },
        {
          label: "2.2. IT Layer",
          slug: "03-it-layer",
          anchor: "2-2-layer-2-it-hardware-infrastructure",
        },
        {
          label: "2.3. Workload Layer",
          slug: "04-workload-layer",
          anchor: "2-3-layer-3-workload-orchestration",
        },
      ],
    },
    { label: "3. Methodology & Benchmarks", slug: "05-methodology" },
    { label: "4. How to Cite", slug: "07-how-to-cite" },
    { label: "5. References", slug: "08-references" },
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
    "01-executive-summary": () =>
      import("@/content/reports/stranded-capacity-index/01-executive-summary.mdx"),
    "02-facility-layer": () =>
      import("@/content/reports/stranded-capacity-index/02-facility-layer.mdx"),
    "03-it-layer": () =>
      import("@/content/reports/stranded-capacity-index/03-it-layer.mdx"),
    "04-workload-layer": () =>
      import("@/content/reports/stranded-capacity-index/04-workload-layer.mdx"),
    "05-methodology": () =>
      import("@/content/reports/stranded-capacity-index/05-methodology.mdx"),
    "07-how-to-cite": () =>
      import("@/content/reports/stranded-capacity-index/07-how-to-cite.mdx"),
    "08-references": () =>
      import("@/content/reports/stranded-capacity-index/08-references.mdx"),
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
