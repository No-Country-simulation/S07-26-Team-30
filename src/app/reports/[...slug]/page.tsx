import { notFound } from "next/navigation";
import { getReportNav, resolveAllMdx, resolveMdx } from "@/lib/mdx";
import { ReportLayout } from "@/components/report";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [report] = slug;
  return {
    title: `PhysaFlow — ${report}`,
    description: `Report: ${slug.join("/")}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const [report, ...section] = slug;

  const nav = await getReportNav(report);
  const sectionSlug = section.join("/");

  if (sectionSlug) {
    const mdx = await resolveMdx(report, sectionSlug);
    if (!mdx) notFound();
    const { default: Content } = mdx;

    return (
      <ReportLayout nav={nav} slug={report}>
        <article id={sectionSlug}>
          <Content />
        </article>
      </ReportLayout>
    );
  }

  const sections = await resolveAllMdx(report);
  if (sections.length === 0) notFound();

  return (
    <ReportLayout nav={nav} slug={report}>
      <div className="space-y-16">
        {sections.map(({ slug: sSlug, Component }) => (
          <article key={sSlug} id={sSlug}>
            <Component />
          </article>
        ))}
      </div>
    </ReportLayout>
  );
}