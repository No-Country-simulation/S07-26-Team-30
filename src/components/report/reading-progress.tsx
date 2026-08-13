"use client";

import { useEffect, useState } from "react";
import type { NavItem } from "@/types";
import { cn } from "@/lib/utils";

function readReadingOffset(): number {
  if (typeof window === "undefined") return 112;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--reading-offset")
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 112;
  return raw.endsWith("rem") ? n * 16 : n;
}

export function ReadingProgress({
  items,
  title,
}: {
  items: NavItem[];
  title: string;
}) {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);
  const [appearOffset] = useState(readReadingOffset);

  useEffect(() => {
    if (items.length === 0) return;

    const sections = items
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    let frame = 0;

    const update = () => {
      const { scrollY, innerHeight } = window;
      const first = sections[0];
      const last = sections[sections.length - 1];

      const firstTop = first.getBoundingClientRect().top;
      const lastBottom = last.getBoundingClientRect().bottom;

      setVisible(firstTop <= appearOffset);

      const reportStart = firstTop + scrollY;
      const reportEnd = lastBottom + scrollY;
      const startScroll = reportStart;
      const endScroll = reportEnd - innerHeight;
      const total = endScroll - startScroll;
      const done = Math.min(Math.max(scrollY - startScroll, 0), total);
      setPct(total > 0 ? (done / total) * 100 : 0);
    };

    update();

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("load", onScroll, true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("load", onScroll, true);
      cancelAnimationFrame(frame);
    };
  }, [items, appearOffset]);

  if (items.length === 0) return null;

  const rounded = Math.round(pct);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full transition-[opacity,transform] duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="border-b border-white/10 bg-[#1E5A40] pt-8">
        <p className="mb-8 truncate px-4 text-center font-display text-lg font-semibold tracking-wide text-white sm:px-6">
          {title}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        className="w-full"
      >
        <div className="h-1.5 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-[#dfc48c] transition-[width] duration-150 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
