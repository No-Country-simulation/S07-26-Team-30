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
        className="h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent print:hidden"
      />
      <ReadingProgress items={nav} title={title} slug={slug} />
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-x-8 px-4 py-16 print:px-0 print:py-0 sm:py-20 lg:grid-cols-[16rem_minmax(0,768px)_16rem]">
        <ReportIndex items={nav} slug={slug} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
