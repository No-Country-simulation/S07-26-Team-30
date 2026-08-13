import type { NavItem } from "@/types";
import { ReportIndex } from "./report-index";
import { ReadingProgress } from "./reading-progress";

interface ReportLayoutProps {
  children: React.ReactNode;
  nav: NavItem[];
  slug: string;
}

const titleize = (slug: string) =>
  slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export function ReportLayout({ children, nav, slug }: ReportLayoutProps) {
  const title = `PhysaFlow — ${titleize(slug)}`;

  return (
    <div className="mx-auto w-full">
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent"
      />
      <ReadingProgress items={nav} title={title} />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-wrap gap-x-8 px-4 py-16 sm:py-20">
        <ReportIndex items={nav} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
