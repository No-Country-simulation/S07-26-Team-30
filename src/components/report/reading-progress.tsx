"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { NavItem } from "@/types";
import { cn, readReadingOffset } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ShareButton } from "./share-button";

export function ReadingProgress({
  items,
  title,
  slug,
}: {
  items: NavItem[];
  title: string;
  slug: string;
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
        "sticky top-0 z-50 w-full print:hidden transition-[opacity,transform] duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="border-b border-white/10 bg-[#0F2B20]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-end gap-4 px-4 py-6 sm:justify-between sm:px-6 lg:px-8">
          <p className="m-0 hidden min-w-0 truncate text-left font-display text-lg font-normal tracking-wide text-white sm:block">
            {title}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <ThemeToggle />
            <ShareButton title={title} />
            <a
              href={`/api/reports/pdf?slug=${encodeURIComponent(slug)}`}
              className="flex shrink-0 flex-col items-center gap-1 bg-transparent text-white transition-colors duration-200 hover:text-[#e8cf9a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Download aria-hidden="true" className="size-5" />
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em]">
                Download
              </span>
            </a>
          </div>
        </div>
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
