"use client";

import { useEffect, useMemo, useState } from "react";
import type { NavItem } from "@/types";
import { cn } from "@/lib/utils";
import { PdfDownloadButton } from "./pdf-download-button";

/**
 * Distance (px) from the viewport top at which a target heading is
 * considered "current" — the same single source of truth used by the CSS
 * scroll margins (--reading-offset in globals.css).
 */
function readReadingOffset(): number {
  if (typeof window === "undefined") return 112;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--reading-offset")
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 112;
  return raw.endsWith("rem") ? n * 16 : n;
}

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) =>
    item.children?.length ? flatten(item.children) : [item],
  );
}

function labelParts(label: string) {
  const match = label.match(/^(\d+(?:\.\d+)*)\.\s+(.*)$/);
  return { number: match?.[1], rest: match?.[2] ?? label };
}

/**
 * Resolves the DOM element a nav item points at: its own heading anchor
 * when present, otherwise the report section element. Anchors are generated
 * with the same slugify() used by the MDX heading ids, so they always match.
 */
function resolveTarget(item: NavItem): HTMLElement | null {
  if (item.anchor) {
    const heading = document.getElementById(item.anchor);
    if (heading) return heading;
  }
  return document.getElementById(item.slug);
}

export function ReportIndex({ items, slug }: { items: NavItem[]; slug: string }) {
  const leaves = useMemo(() => flatten(items), [items]);
  const [active, setActive] = useState(leaves[0]?.slug ?? "");
  const [headingOffset] = useState(readReadingOffset);

  // Active key -> leaf index, so the highlight and the "Section X of N"
  // counter always agree. A group shares its first child's index.
  const indexByKey = useMemo(() => {
    const map = new Map<string, number>();
    let leafIndex = 0;
    const visit = (item: NavItem) => {
      if (item.children?.length) {
        map.set(`group:${item.slug}`, leafIndex);
        item.children.forEach(visit);
      } else {
        map.set(item.slug, leafIndex);
        leafIndex += 1;
      }
    };
    items.forEach(visit);
    return map;
  }, [items]);

  useEffect(() => {
    // One entry per nav item, in DOM order. Parents resolve to their own
    // heading; leaves to theirs or to the section. The last entry whose
    // target crossed the reading line wins, so exactly ONE item is ever
    // active: a parent lights only between its heading and the first child
    // heading — never together with a child.
    const entries: { key: string; element: HTMLElement }[] = [];
    const visit = (item: NavItem) => {
      const element = resolveTarget(item);
      if (!element) return;
      entries.push({
        key: item.children?.length ? `group:${item.slug}` : item.slug,
        element,
      });
      item.children?.forEach(visit);
    };
    items.forEach(visit);

    if (entries.length === 0) return;

    const lastKey = entries[entries.length - 1].key;
    let frame = 0;

    const updateActive = () => {
      const { scrollY, innerHeight } = window;
      const doc = document.documentElement;

      if (innerHeight + scrollY >= doc.scrollHeight - 2) {
        setActive(lastKey);
        return;
      }

      let current = entries[0].key;
      for (let i = 0; i < entries.length; i += 1) {
        // +1px tolerance: smooth-scroll landings can end at fractional
        // positions (e.g. 112.4px) and must still light up their item.
        if (entries[i].element.getBoundingClientRect().top <= headingOffset + 1) {
          current = entries[i].key;
        }
      }
      setActive(current);
    };

    updateActive();

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items, headingOffset]);

  if (items.length === 0) return null;

  const activeIndex = indexByKey.get(active) ?? 0;

  const renderRow = (item: NavItem, depth: number) => {
    const { number, rest } = labelParts(item.label);
    const isActive = active === item.slug;
    return (
      <li key={item.slug}>
        <a
          href={`#${item.anchor ?? item.slug}`}
          onClick={() => setActive(item.slug)}
          aria-current={isActive ? "true" : undefined}
          className={cn(
            "-ml-px flex items-baseline gap-2 border-l-2 py-1.5 text-sm transition-[border-color,background-color,color] duration-200",
            depth > 0 ? "pl-9" : "pl-4",
            isActive
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:border-accent/50 hover:bg-accent/5 hover:text-foreground",
          )}
        >
          <span className="w-7 shrink-0 text-right text-[0.8rem] font-semibold tabular-nums text-accent-deep">
            {number}
          </span>
          <span className="min-w-0 truncate">{rest}</span>
        </a>
      </li>
    );
  };

  const renderGroup = (item: NavItem) => {
    const { number, rest } = labelParts(item.label);
    const isActive = active === `group:${item.slug}`;
    return (
      <li key={item.slug}>
        <a
          href={`#${item.anchor ?? item.slug}`}
          onClick={() => setActive(`group:${item.slug}`)}
          aria-current={isActive ? "true" : undefined}
          className={cn(
            "-ml-px flex items-baseline gap-2 border-l-2 py-1.5 pl-4 text-sm transition-[border-color,color] duration-200",
            isActive
              ? "border-accent text-accent"
              : "border-transparent text-foreground hover:border-accent/50 hover:text-accent-deep",
          )}
        >
          <span className="w-7 shrink-0 text-right text-[0.8rem] font-semibold tabular-nums text-accent-deep">
            {number}
          </span>
          <span className="min-w-0 truncate">{rest}</span>
        </a>
        <ol className="space-y-0.5">
          {item.children?.map((child) => renderRow(child, 1))}
        </ol>
      </li>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <nav
        aria-label="Report contents"
        className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
          Contents
        </h2>
        <p className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Section {activeIndex + 1} of {leaves.length}
        </p>
        <span aria-hidden="true" className="mt-4 block h-px w-10 bg-accent/70" />
        <ol className="mt-5 space-y-0.5 border-l border-border/80">
          {items.map((item) =>
            item.children?.length ? renderGroup(item) : renderRow(item, 0),
          )}
        </ol>
        <PdfDownloadButton slug={slug} variant="compact" />
      </nav>
    </aside>
  );
}