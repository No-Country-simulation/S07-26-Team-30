import { notFound } from "next/navigation";
import { getReportNav, resolveAllMdx } from "@/lib/mdx";
import { LandingHero } from "@/components/layout/landing-hero";
import { ReportLayout } from "@/components/report";

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

  const nav = await getReportNav(report);

  return (
    <>
      <LandingHero />
      <ReportLayout nav={nav} slug={report}>
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {sections.map(({ slug: section, Component }, index) => (
            <section
              key={section}
              id={section}
              className="scroll-mt-[var(--reading-offset)] first:pt-0"
            >
              {index > 0 && <hr className="section-divider" />}
              <Component />
            </section>
          ))}
        </article>
      </ReportLayout>
    </>
  );
}
