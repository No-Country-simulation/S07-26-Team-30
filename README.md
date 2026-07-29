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
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/MDX-1B1B1F?style=flat-square&logo=mdx&logoColor=white">
  <img alt="MDX" src="https://img.shields.io/badge/MDX-1B1B1F?style=flat-square&logo=mdx&logoColor=white">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/AI_SDK-000000?style=flat-square&logo=openai&logoColor=white">
  <img alt="AI SDK" src="https://img.shields.io/badge/AI_SDK-000000?style=flat-square&logo=openai&logoColor=white">
</picture>

---

## Tabla de contenidos

- [Visión general](#visión-general)
- [El reporte](#el-reporte)
- [Stack técnico](#stack-técnico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Equipo](#equipo)
- [Roadmap del MVP](#roadmap-del-mvp)
- [Primeros pasos](#primeros-pasos)
- [Scripts disponibles](#scripts-disponibles)

---

## Visión general

**PhysaFlow** es una empresa de infraestructura de IA enfocada en un problema concreto de los data centers modernos: la **stranded capacity** — capacidad pagada y encendida que no produce nada porque las capas físicas y operativas del facility no se coordinan entre sí.

Este repositorio contiene el sitio web del primer reporte público de PhysaFlow: el **Stranded Capacity Index (SCI)**. Un documento de referencia de la industria que define el vocabulario, la taxonomía y la métrica de un problema que hasta ahora nadie había documentado de forma exhaustiva y pública.

> El sitio no es un blog ni una landing page. Es un documento de referencia que debe verse y sentirse como tal.

---

## El reporte

El reporte se estructura en torno a una **taxonomía nombrada** de las formas que toma la stranded capacity en tres capas de un data center:

```
┌─────────────────────────────────────┐
│         WORKLOAD                    │
│  (scheduling, pipelines, MUR)       │
├─────────────────────────────────────┤
│         IT                          │
│  (GPU/CPU, networking, compute)      │
├─────────────────────────────────────┤
│         FACILITY                    │
│  (power, cooling, floor space)       │
└─────────────────────────────────────┘
```

Cada sección incluye descripciones en lenguaje de operador: **qué se ve, qué cuesta, por qué ocurre**. El sitio incluye además:

- Metodología de cálculo del índice SCI
- Gráficos y visualizaciones descargables
- Bloque "cómo citar este reporte" en formato académico y periodístico
- Chatbot contextual que responde preguntas exclusivamente sobre el contenido del reporte
- Diseño responsivo con paleta forest-green y gold de PhysaFlow

---

## Stack técnico

| Tecnología | Versión | Propósito |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15 (App Router) | Framework principal, rutas y server components |
| [React](https://react.dev/) | 19 | UI declarativa |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | latest | Componentes de interfaz accesibles |
| [MDX](https://mdxjs.com/) | 3 | Contenido del reporte como datos |
| [AI SDK](https://sdk.vercel.ai/) | 7 | Chatbot con streaming de texto |
| [ESLint](https://eslint.org/) | 9 | Calidad de código |
| [Prettier](https://prettier.io/) | 3 | Formateo consistente |

---

## Arquitectura

El proyecto sigue una arquitectura **limpia y orientada al dominio** dentro de lo que un MVP de 5 semanas requiere — sin overengineering, pero con las abstracciones correctas en los puntos que van a evolucionar.

```
src/
├── app/                    # Next.js App Router (rutas, layouts, API)
│   ├── api/chat/           ← endpoint POST para el chatbot (AI SDK)
│   └── reports/[...slug]/  ← catch-all para secciones anidadas
├── components/             # UI atómica
│   ├── chatbot/            ← floating button + dialog con streaming
│   ├── layout/             ← header, footer
│   └── report/             ← Figure, Blockquote, Definition, TOC
├── content/reports/        # Los MDX son la fuente de verdad del reporte
├── lib/                    # Lógica de dominio
│   ├── context-provider.ts ← interfaz ContextProvider + StaticSearchProvider
│   ├── mdx.ts              ← mapéo de módulos MDX + navegación
│   └── search.ts           ← keyword search liviano
└── types/                  # Tipos compartidos
```

### Decisiones clave

**MDX como fuente de verdad**: cada sección del reporte es un archivo `.mdx` en `content/reports/`. Se renderizan con `@next/mdx` y se importan estáticamente para que webpack pueda compilarlas. No hay CMS, no hay base de datos.

**Búsqueda por contexto sin embeddings**: en lugar de un RAG completo con vectores (innecesario para un solo reporte), el `StaticSearchProvider` carga los MDX desde disco, los divide por secciones y hace scoring por keywords — título pesa 5×, frecuencia en contenido suma. La interfaz `ContextProvider` permite migrar a Pinecone/pgvector cuando el contenido crezca sin tocar el resto del código.

**Chatbot con contexto inyectado**: el API route recibe los mensajes, extrae el query, llama al provider, construye un system prompt con las secciones relevantes y streamea la respuesta con `streamText`. No hay estado de sesión, no hay base de datos vectorial — es deliberadamente simple para el MVP.

---

## Estructura del proyecto

```
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts          ← AI SDK — streamText con contexto
│   │   ├── reports/[...slug]/page.tsx ← renderiza la sección MDX correspondiente
│   │   ├── layout.tsx                 ← layout raíz (Header, Footer, ChatButton)
│   │   ├── page.tsx                   ← landing page
│   │   └── globals.css                ← Tailwind v4 + tema forest-green/gold
│   ├── components/
│   │   ├── chatbot/                   ← ChatButton + ChatDialog (flotante)
│   │   ├── layout/                    ← Header (sticky, backdrop-blur) + Footer
│   │   └── report/                    ← Figure, Blockquote, Definition, TOC
│   ├── content/reports/
│   │   └── stranded-capacity-index/   ← 7 secciones del reporte en MDX
│   │       ├── introduction.mdx
│   │       ├── methodology.mdx
│   │       ├── taxonomy/
│   │       │   ├── facility.mdx
│   │       │   ├── it.mdx
│   │       │   └── workload.mdx
│   │       ├── citations.mdx
│   │       └── conclusion.mdx
│   ├── lib/
│   │   ├── context-provider.ts     ← interfaz + StaticSearchProvider
│   │   ├── mdx.ts                  ← navegación + módulos MDX
│   │   ├── prompts.ts              ← system prompt del chatbot
│   │   ├── search.ts               ← keyword search utilitario
│   │   └── utils.ts                ← cn(), slugify()
│   ├── types/index.ts
│   └── mdx-components.tsx          ← mapeo de componentes MDX custom
├── .env.example                         ← variables de entorno
├── next.config.mjs                      ← @next/mdx + pageExtensions
├── tailwind.config.ts                   ← (Tailwind v4 usa CSS nativo)
└── tsconfig.json                        ← path alias @/ → src/
```

---

## Equipo

| Rol | Nombre | LinkedIn |
|---|---|---|
| **Frontend Developer** | Lautaro Frioni | — |
| **Backend Developer** | Gabriel Braga | — |
| **Full Stack Developer** | Hugo Ariel Seijo | — |
| **Backend Developer** | Ivan Moreno Rivero | — |
| **QA Engineer** | Héctor Iván Gamboa | — |

---

## Roadmap del MVP (5 semanas)

```
Semana 1   ████████████░░░░░░░░  Scaffold + layout + ruta MDX
Semana 2   ████████████████░░░░  Componentes de reporte + diseño responsivo
Semana 3   ████████████████████  Contenido completo + visualizaciones
Semana 4   ████████████████████  Chatbot + búsqueda contextual
Semana 5   ████████████████████  QA, refinamiento, deploy
```

### Hitos

- [x] Arquitectura inicial (Next.js 15, Tailwind v4, MDX, AI SDK)
- [x] Layout base (header, footer, navegación, landing page)
- [x] Ruta de reportes con catch-all para secciones anidadas
- [x] Componentes de reporte (Figure, Blockquote, Definition, TOC)
- [x] Chatbot con búsqueda por contexto (ContextProvider interface)
- [x] Contenido placeholder en MDX (7 secciones)
- [ ] Gráficos y visualizaciones descargables
- [ ] Bloque "cómo citar este reporte"
- [ ] Paleta forest-green y gold de PhysaFlow
- [ ] QA y refinamiento visual
- [ ] Deploy

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
# Editar .env.local y agregar la API key del proveedor elegido

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) y navegar a `/reports/stranded-capacity-index/introduction`.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build de producción |
| `npm run lint` | ESLint + Next.js lint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run format` | Formatear con Prettier |

---

## Licencia

Este proyecto es parte de una simulación laboral. El contenido del reporte es propiedad intelectual de PhysaFlow.