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
    description: `Report: ${slug.join("/")}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const [report, ...section] = slug;

  const mdx = await resolveMdx(report, section.join("/") || "introduction");
  if (!mdx) notFound();

  const { default: Content } = mdx;
  const nav = await getReportNav(report);

  return (
    <ReportLayout nav={nav} slug={report}>
      <article/>
        <Content />
      <article/>
    </ReportLayout>
  );
}