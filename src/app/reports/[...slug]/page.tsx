import { notFound } from "next/navigation";
import { resolveAllMdx } from "@/lib/mdx";
import { LandingHero } from "@/components/layout/landing-hero";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [report] = slug;
  return {
    title: `PhysaFlow — ${report}`,
    description: `Report: ${report}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const [report] = slug;

  const sections = await resolveAllMdx(report);
  if (sections.length === 0) notFound();

  return (
    <>
      <LandingHero />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map(({ slug: section, Component }, index) => (
          <section
            key={section}
            id={section}
            className="scroll-mt-24 first:pt-0"
          >
            {index > 0 && <hr className="mb-8 border-t border-border/60" />}
            <Component />
          </section>
        ))}
      </article>
    </>
  );
}
