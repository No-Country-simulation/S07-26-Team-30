import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          PhysaFlow
        </Link>
        <span className="text-xs text-muted-foreground">
          Stranded Capacity Index
        </span>
      </div>
    </header>
  );
}
