<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/PhysaFlow-1B4332?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="PhysaFlow" src="https://img.shields.io/badge/PhysaFlow-2D6A4F?style=for-the-badge&logo=nextdotjs&logoColor=white">
</picture>

# PhysaFlow — Stranded Capacity Index

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB">
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/MDX_3-1B1B1F?style=flat-square&logo=mdx&logoColor=white">
  <img alt="MDX" src="https://img.shields.io/badge/MDX_3-1B1B1F?style=flat-square&logo=mdx&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/ECharts-AA344D?style=flat-square">
  <img alt="ECharts" src="https://img.shields.io/badge/ECharts-AA344D?style=flat-square">
</picture>

---

## Visión general

**PhysaFlow** es una empresa de infraestructura de IA enfocada en un problema concreto de los data centers modernos: la **stranded capacity** — capacidad pagada y encendida que no produce nada porque las capas físicas y operativas del facility no se coordinan entre sí.

Este repositorio contiene el sitio web del primer reporte público de PhysaFlow: el **Stranded Capacity Index (SCI)**. Un documento de referencia de la industria que define el vocabulario, la taxonomía y la métrica de un problema que hasta ahora nadie había documentado de forma exhaustiva y pública.

> El sitio no es un blog ni una landing page. Es un documento de referencia que debe verse y sentirse como tal.

**Demo en producción:** [physaflow-report.vercel.app](https://physaflow-report.vercel.app/)

---

## Características

- **Experiencia de lectura académica**: 7 secciones MDX organizadas en una taxonomía nombrada de tres capas (Facility, IT, Workload), índice lateral navegable, barra de progreso de lectura y navegación entre secciones.
- **Exportación a PDF**: descarga del reporte completo generada server-side con Playwright + Chromium, optimizada para entornos serverless (el PDF excluye navbar, hero y chatbot).
- **Modo oscuro**: toggle en la barra del reporte con preferencia persistida en `localStorage`; los gráficos permanecen siempre en claro para preservar legibilidad.
- **Chatbot contextual**: responde exclusivamente sobre el contenido del reporte mediante streaming (Vercel AI SDK + Groq). Búsqueda contextual por keywords sobre los MDX — sin embeddings ni base vectorial.
- **Citas y compartir**: bloque "cómo citar este reporte" con formatos académico, periodístico y BibTeX, cada uno con botón de copiado; botón para compartir el reporte.
- **Visualizaciones interactivas**: gráficos construidos con Apache ECharts.
- **SEO técnico**: metadata canónica por sección, Open Graph/Twitter cards, imagen OG dinámica (`next/og`), JSON-LD schema `Report`, `sitemap.xml`, `robots.txt` y PWA manifest.
- **Hero con parallax** respetando `prefers-reduced-motion`, diseño responsivo con la paleta forest-green y gold de PhysaFlow.

---

## Stack técnico

| Tecnología                                                                                                | Versión            | Propósito                                                  |
| --------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------- |
| [Next.js](https://nextjs.org/)                                                                            | ^15.5 (App Router) | Framework principal, rutas, server components y API routes |
| [React](https://react.dev/)                                                                               | ^19.2              | UI declarativa                                             |
| [TypeScript](https://www.typescriptlang.org/)                                                             | 5.8                | Tipado estático                                            |
| [Tailwind CSS](https://tailwindcss.com/)                                                                  | ^4.3               | Estilos utilitarios (config vía CSS nativo)                |
| [MDX](https://mdxjs.com/)                                                                                 | ^3.1               | Contenido del reporte como datos                           |
| [AI SDK](https://ai-sdk.dev/)                                                                             | ^7.0               | Streaming del chatbot                                      |
| [@ai-sdk/groq](https://sdk.vercel.ai/providers/ai-sdk-providers/groq)                                     | ^4.0               | Proveedor de LLM para el chatbot                           |
| [Apache ECharts](https://echarts.apache.org/)                                                             | ^6.1               | Visualizaciones de datos                                   |
| [playwright-core](https://playwright.dev/) + [@sparticuz/chromium](https://github.com/Sparticuz/chromium) | ^1.62 / ^149       | Generación de PDF serverless                               |

Tooling: ESLint 9, Prettier 3, TypeScript `--noEmit`.

---

## Arquitectura

El proyecto sigue una arquitectura **limpia y orientada al dominio** dentro de lo que un MVP requiere — sin overengineering, pero con las abstracciones correctas en los puntos que van a evolucionar.

### Decisiones clave

**MDX como fuente de verdad**: cada sección del reporte es un archivo `.mdx` en `src/content/reports/`. La navegación, el orden y la resolución de módulos viven en `src/lib/mdx.ts` (mapa estático `NAV` + imports lazy). No hay CMS ni base de datos.

**Búsqueda contextual sin embeddings**: en lugar de un RAG completo con vectores (innecesario para un solo reporte), el `StaticSearchProvider` carga los MDX desde disco, los divide por secciones y hace scoring por keywords — el título pesa 5×. La interfaz `ContextProvider` permite migrar a Pinecone/pgvector cuando el contenido crezca sin tocar el resto del código.

**Chatbot con contexto inyectado**: el API route recibe los mensajes, consulta al provider, construye un system prompt con las secciones relevantes y streamea la respuesta con `streamText`. Sin estado de sesión, deliberadamente simple para el MVP.

**PDF serverless**: la ruta `/api/reports/pdf` renderiza la página con `playwright-core` + un binario comprimido de Chromium (`@sparticuz/chromium`). Ambos paquetes están externalizados vía `serverExternalPackages` y su binario se incluye explícitamente con `outputFileTracingIncludes` para que sobreviva al tracing de serverless.

---

## Estructura del proyecto

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts           ← POST: chatbot con streaming (AI SDK + Groq)
│   │   │   └── reports/pdf/route.ts    ← GET: export del reporte a PDF (Playwright)
│   │   ├── reports/[...slug]/page.tsx  ← catch-all de secciones del reporte
│   │   ├── report/page.tsx             ← redirect permanente a la portada del SCI
│   │   ├── page.tsx                    ← landing con hero parallax
│   │   ├── layout.tsx                  ← layout raíz (SEO global, Header, Footer, ChatButton)
│   │   ├── globals.css                 ← Tailwind v4 + tema forest-green/gold + tokens dark
│   │   ├── assets/report-img.webp      ← hero comprimido
│   │   ├── opengraph-image.tsx         ← OG image dinámica (next/og)
│   │   └── manifest.ts · robots.ts · sitemap.ts · not-found.tsx
│   ├── components/
│   │   ├── chatbot/                    ← ChatButton + ChatDialog flotante con animaciones
│   │   ├── layout/                     ← Header + Footer
│   │   ├── report/                     ← Chart, CopyCode, Label, PdfDownloadButton,
│   │   │                                 ReadingProgress, ReportIndex, ReportLayout, ShareButton
│   │   └── theme/                      ← ThemeProvider + ThemeToggle (dark mode)
│   ├── content/reports/
│   │   └── stranded-capacity-index/    ← 7 secciones del reporte en MDX (fuente de verdad)
│   │       ├── 01-executive-summary.mdx    (1. Introduction)
│   │       ├── 02-facility-layer.mdx       (2. Taxonomy — 2.1 Facility Layer)
│   │       ├── 03-it-layer.mdx             (2.2 IT Layer)
│   │       ├── 04-workload-layer.mdx       (2.3 Workload Layer)
│   │       ├── 05-methodology.mdx          (3. Methodology & Benchmarks)
│   │       ├── 07-how-to-cite.mdx          (4. How to Cite)
│   │       └── 08-references.mdx           (5. References)
│   ├── lib/
│   │   ├── context-provider.ts         ← interfaz ContextProvider + StaticSearchProvider
│   │   ├── mdx.ts                      ← navegación (NAV) + resolución de módulos MDX
│   │   ├── predefined-questions.ts     ← preguntas sugeridas del chatbot
│   │   ├── prompts.ts                  ← system prompt del chatbot
│   │   └── utils.ts                    ← utilidades compartidas
│   └── types/index.ts
├── .env.example                         ← variables de entorno
├── eslint.config.mjs
├── next.config.mjs                      ← @next/mdx + Chromium externo para la ruta PDF
└── tsconfig.json                        ← path alias @/ → src/
```

---

## Primeros pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/No-Country-simulation/S07-26-Team-30.git
cd S07-26-Team-30

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu API key de Groq (https://console.groq.com)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). El reporte vive en `/reports/stranded-capacity-index`.

---

## Scripts disponibles

| Comando             | Descripción                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Servidor de desarrollo        |
| `npm run build`     | Build de producción           |
| `npm run start`     | Servir el build de producción |
| `npm run lint`      | ESLint (config Next.js)       |
| `npm run typecheck` | TypeScript `--noEmit`         |
| `npm run format`    | Formatear con Prettier        |

---

## Equipo

| Rol                      | Nombre             |
| ------------------------ | ------------------ |
| **Frontend Developer**   | Lautaro Frioni     |
| **Backend Developer**    | Gabriel Braga      |
| **Full Stack Developer** | Hugo Ariel Seijo   |
| **Backend Developer**    | Ivan Moreno Rivero |
| **QA Engineer**          | Héctor Iván Gamboa |

Proyecto desarrollado como equipo 30 de la simulación laboral de [No-Country](https://no-country.org/) (S07-26).

---

## Licencia

Este proyecto es parte de una simulación laboral. El contenido del reporte es propiedad intelectual de PhysaFlow.
