import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">PhysaFlow</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Stranded Capacity Index — An industry reference report on underutilized
        infrastructure in AI data centers.
      </p>
      <Link
        href="/reports/stranded-capacity-index/introduction"
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium transition hover:opacity-90"
      >
        Read the report
      </Link>
    </main>
  );
}