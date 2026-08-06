import type { NavItem } from "@/types";

interface ReportLayoutProps {
  children: React.ReactNode;
  nav: NavItem[];
  slug: string;
}

export function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function Sidebar() {
  return (
    <nav className="sticky top-8 space-y-1">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Report
      </h2>
      <p className="text-sm text-muted-foreground">Navigation placeholder</p>
    </nav>
  );
}
