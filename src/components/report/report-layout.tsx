import type { NavItem } from "@/types";
import { titleize } from "@/lib/mdx";
import { ReportIndex } from "./report-index";
import { ReadingProgress } from "./reading-progress";

interface ReportLayoutProps {
  children: React.ReactNode;
  nav: NavItem[];
  slug: string;
}

export function ReportLayout({ children, nav, slug }: ReportLayoutProps) {
  const title = `PhysaFlow — ${titleize(slug)}`;

  return (
    <div className="mx-auto w-full">
      <ReadingProgress items={nav} title={title} slug={slug} />
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-x-8 px-4 pb-16 print:px-0 print:py-0 sm:pb-20 lg:grid-cols-[16rem_minmax(0,768px)_16rem]">
        <ReportIndex items={nav} slug={slug} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
