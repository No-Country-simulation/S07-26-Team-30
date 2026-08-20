export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.35em] text-accent">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <a
        href="/reports/stranded-capacity-index"
        className="mt-8 rounded-lg px-5 py-2.5 text-[1rem] font-bold text-white transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #a27e2d, #d4a94e)",
          boxShadow: "0 4px 20px rgba(162,126,45,0.35)",
        }}
      >
        Back to the Report
      </a>
    </main>
  );
}