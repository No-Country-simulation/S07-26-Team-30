import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getReportNav,
  getReportSectionLabel,
  getReportSections,
  resolveAllMdx,
  resolveMdx,
  titleize,
} from "@/lib/mdx";
import { ReportLayout } from "@/components/report";

interface Props {
  params: Promise<{ slug: string[] }>;
}

const REPORT_NAME = "stranded-capacity-index";
const REPORT_TITLE = "Stranded Capacity Index";
const REPORT_URL = "https://dev.physaflow.com";
const REPORT_DESCRIPTION =
  "An industry reference report on stranded capacity in AI data centers — taxonomy, methodology and benchmarks.";

// Description por sección, con keywords: usada en <meta name="description">,
// Open Graph y JSON-LD.
const SECTION_DESCRIPTIONS: Record<string, string> = {
  "01-executive-summary":
    "Introduction to the PhysaFlow Stranded Capacity Index (PSCI): what stranded capacity is and why it constrains AI infrastructure.",
  "02-facility-layer":
    "Layer 1 of the stranded capacity taxonomy: facility power and thermal infrastructure in AI data centers.",
  "03-it-layer":
    "Layer 2 of the stranded capacity taxonomy: IT hardware — servers, GPUs and networking.",
  "04-workload-layer":
    "Layer 3 of the stranded capacity taxonomy: workload orchestration and scheduling.",
  "05-methodology":
    "Methodology and benchmarks behind the PhysaFlow Stranded Capacity Index (PSCI).",
  "07-how-to-cite":
    "How to cite the PhysaFlow Stranded Capacity Index (PSCI) report.",
  "08-references":
    "References for the PhysaFlow Stranded Capacity Index (PSCI) report.",
};

// 8 URLs estáticas: el índice + las 7 secciones de la NAV.
export function generateStaticParams() {
  return [
    { slug: [REPORT_NAME] },
    ...getReportSections(REPORT_NAME).map((section) => ({
      slug: [REPORT_NAME, section],
    })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [report, ...section] = slug;
  const sectionSlug = section.join("/");

  // Título humano: el label de la NAV sin prefijo numérico, o el título del
  // reporte en el índice. El template "PhysaFlow — %s" completa el <title>.
  const title = sectionSlug
    ? (getReportSectionLabel(report, sectionSlug) ?? titleize(sectionSlug))
    : REPORT_TITLE;

  const description = sectionSlug
    ? (SECTION_DESCRIPTIONS[sectionSlug] ?? REPORT_DESCRIPTION)
    : REPORT_DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical: `/reports/${slug.join("/")}` },
    openGraph: {
      type: "article",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// JSON-LD Report schema, inyectado en el body como script de datos estructurados.
function ReportJsonLd({
  slug,
  headline,
  description,
}: {
  slug: string[];
  headline: string;
  description: string;
}) {
  const url = `${REPORT_URL}/reports/${slug.join("/")}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    headline,
    description,
    url,
    datePublished: "2026-08-20",
    publisher: {
      "@type": "Organization",
      name: "PhysaFlow",
      url: REPORT_URL,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const [report, ...section] = slug;
  const sectionSlug = section.join("/");

  const nav = await getReportNav(report);

  const headline = sectionSlug
    ? `${getReportSectionLabel(report, sectionSlug) ?? titleize(sectionSlug)} — ${REPORT_TITLE}`
    : REPORT_TITLE;
  const description = sectionSlug
    ? (SECTION_DESCRIPTIONS[sectionSlug] ?? REPORT_DESCRIPTION)
    : REPORT_DESCRIPTION;

  if (sectionSlug) {
    const mdx = await resolveMdx(report, sectionSlug);
    if (!mdx) notFound();
    const { default: Content } = mdx;

    return (
      <ReportLayout nav={nav} slug={report}>
        <article id={sectionSlug}>
          <ReportJsonLd slug={slug} headline={headline} description={description} />
          {/* Las secciones sin h1 propio (todo menos 01, que trae su # en el
              MDX) reciben un h1 sr-only: una sola jerarquía por página. */}
          {sectionSlug !== "01-executive-summary" && (
            <h1 className="sr-only">{titleize(report)}</h1>
          )}
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
        <ReportJsonLd slug={slug} headline={headline} description={description} />
        {sections.map(({ slug: sSlug, Component }) => (
          <article key={sSlug} id={sSlug}>
            <Component />
          </article>
        ))}
      </div>
    </ReportLayout>
  );
}