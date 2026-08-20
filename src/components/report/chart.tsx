"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
  type BarSeriesOption,
  type FunnelSeriesOption,
  type GaugeSeriesOption,
  type HeatmapSeriesOption,
  type LineSeriesOption,
  type PieSeriesOption,
  type RadarSeriesOption,
  type SankeySeriesOption,
  type ScatterSeriesOption,
  type TreemapSeriesOption,
} from "echarts/charts";
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  type GraphicComponentOption,
  type GridComponentOption,
  type LegendComponentOption,
  type RadarComponentOption,
  type TitleComponentOption,
  type TooltipComponentOption,
  type VisualMapComponentOption,
} from "echarts/components";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import { Download } from "lucide-react";
import { cn, slugify } from "@/lib/utils";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GaugeChart,
  SankeyChart,
  ScatterChart,
  FunnelChart,
  TreemapChart,
  HeatmapChart,
  GridComponent,
  GraphicComponent,
  RadarComponent,
  VisualMapComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  SVGRenderer,
  CanvasRenderer,
]);

export type ChartOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | RadarSeriesOption
  | GaugeSeriesOption
  | SankeySeriesOption
  | ScatterSeriesOption
  | FunnelSeriesOption
  | TreemapSeriesOption
  | HeatmapSeriesOption
  | GridComponentOption
  | GraphicComponentOption
  | RadarComponentOption
  | VisualMapComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | TitleComponentOption
>;

interface ChartProps {
  option: ChartOption;
  caption?: string;
  title?: string;
  height?: number;
  className?: string;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

const WATERMARK = "Source: PhysaFlow Stranded Capacity Index (PSCI)";

const MOBILE_BREAKPOINT = 520;
const MOBILE_HEIGHT_SCALE = 1.15;

// Compact mutation target; options are JSON-serializable, so values are loose.
type LooseOption = Record<string, any>;

function truncate(value: unknown, max: number): string {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Builds the execution option for the current viewport width.
 * Desktop uses the MDX-provided option as-is; narrow viewports get a
 * compacted layout: confined tooltips, scrollable legend, rotated and
 * truncated axis labels, smaller sankey nodes, and tighter grids.
 * Functions are safe here because this runs client-side only.
 */
function buildChartOption(option: ChartOption, width: number): ChartOption {
  if (width >= MOBILE_BREAKPOINT) return option;

  const o = JSON.parse(JSON.stringify(option)) as LooseOption;

  // Tooltips must never overflow the viewport on touch devices.
  o.tooltip = { ...(o.tooltip ?? {}), confine: true };

  // Legend: scrollable, full-width, compact with truncated names.
  if (o.legend && typeof o.legend === "object") {
    o.legend = {
      ...o.legend,
      type: "scroll",
      left: 0,
      right: 0,
      width: "100%",
      iconSize: 8,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { ...(o.legend.textStyle ?? {}), fontSize: 10 },
      formatter: (name: string) => truncate(name, 16),
    };
  }

  // Grids: keep axis labels inside the plot area.
  if (o.grid && typeof o.grid === "object") {
    o.grid = { ...o.grid, containLabel: true, left: 6, right: 6 };
  }

  // Category axes with many items: rotate and truncate labels.
  for (const axisKey of ["xAxis", "yAxis"]) {
    const raw = o[axisKey];
    const axes = Array.isArray(raw) ? raw : [raw];
    for (const axis of axes) {
      if (!axis || typeof axis !== "object" || axis.type !== "category") continue;
      const itemCount = Array.isArray(axis.data) ? axis.data.length : 0;
      axis.axisLabel = {
        ...(axis.axisLabel ?? {}),
        fontSize: 10,
        hideOverlap: true,
        interval: 0,
        ...(itemCount > 5 ? { rotate: 35 } : {}),
        formatter: (value: unknown) => truncate(value, itemCount > 5 ? 10 : 16),
      };
    }
  }

  if (Array.isArray(o.series)) {
    for (const series of o.series) {
      if (!series || typeof series !== "object") continue;
      if (series.type === "sankey") {
        series.nodeWidth = 8;
        series.nodeGap = 8;
        series.label = {
          ...(series.label ?? {}),
          fontSize: 10,
          width: 88,
          overflow: "truncate",
        };
      } else if (series.type === "heatmap") {
        series.itemStyle = { ...(series.itemStyle ?? {}), borderWidth: 1 };
      } else if (
        series.type === "bar" ||
        series.type === "line" ||
        series.type === "scatter"
      ) {
        if (series.label && series.label.show) {
          series.label = { ...series.label, fontSize: 10 };
        }
      }
    }
  }

  // Radar: compact axis names and radius.
  if (o.radar && typeof o.radar === "object") {
    o.radar = {
      ...o.radar,
      radius: "58%",
      axisName: { ...(o.radar.axisName ?? {}), fontSize: 10 },
    };
  }

  // VisualMap: smaller so it fits beside the heatmap.
  if (o.visualMap && typeof o.visualMap === "object") {
    o.visualMap = {
      ...o.visualMap,
      itemWidth: 10,
      itemHeight: 80,
      textStyle: { ...(o.visualMap.textStyle ?? {}), fontSize: 10 },
    };
  }

  return o as ChartOption;
}

function withWatermark(option: ChartOption): ChartOption {
  // Options are JSON-serializable (server-component prop), so a deep clone is safe.
  const cloned = JSON.parse(JSON.stringify(option)) as ChartOption;
  const graphic = Array.isArray(cloned.graphic) ? cloned.graphic : [];
  return {
    ...cloned,
    // Sin animaciones de entrada: el canvas offscreen se captura de
    // inmediato y la animación haría que las barras/líneas salieran en su
    // estado inicial (vacías) en el PNG/SVG descargado.
    animation: false,
    graphic: [
      ...graphic,
      {
        type: "text",
        left: "center",
        bottom: 6,
        silent: true,
        style: {
          text: WATERMARK,
          fill: "rgba(32, 40, 35, 0.35)",
          fontSize: 10,
          fontWeight: 500,
        },
      },
    ],
  };
}

async function renderOffscreen(
  option: ChartOption,
  width: number,
  height: number,
  renderer: "canvas" | "svg",
) {
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.left = "-99999px";
  host.style.top = "0";
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  document.body.appendChild(host);

  const chart = echarts.init(host, undefined, { renderer, width, height });
  chart.setOption(withWatermark(option));
  // Espera un frame para que el chart (sin animación) pinte su estado final
  // antes de capturar la imagen.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const dataUrl =
    renderer === "svg"
      ? chart.getDataURL({ type: "svg" })
      : chart.getDataURL({
          type: "png",
          pixelRatio: 2,
          backgroundColor: "#fff",
        });
  chart.dispose();
  host.remove();
  return dataUrl;
}

interface DownloadButtonProps {
  label: string;
  onDownload: () => void;
}

function DownloadButton({ label, onDownload }: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#dcd7c9] bg-[#f5f3ec] px-3 py-1.5 text-xs font-medium text-[#5c6259] transition-colors hover:border-[#c6a15b]/60 hover:bg-[#c6a15b]/5 hover:text-[#202823]"
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

export function Chart({
  option,
  caption,
  title,
  height = 360,
  className,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);
  const optionRef = useRef(option);
  optionRef.current = option;
  const heightRef = useRef(height);
  heightRef.current = height;

  // PDF mode (?pdf=1): charts render without intro animations so the print
  // pipeline can snapshot as soon as the SVG is laid out, skipping the wait.
  const pdfMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("pdf");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container, undefined, { renderer: "svg" });
    chartRef.current = chart;
    let mobile = false;
    let applied = false;
    const baseHeight = heightRef.current;

    const apply = () => {
      const width = container.clientWidth;
      const nextMobile = width < MOBILE_BREAKPOINT;

      // Always apply the option on the first pass (the chart starts empty),
      // then re-apply only when crossing the breakpoint.
      if (!applied || nextMobile !== mobile) {
        applied = true;
        mobile = nextMobile;
        container.style.height = `${Math.round(
          baseHeight * (nextMobile ? MOBILE_HEIGHT_SCALE : 1),
        )}px`;
        chart.setOption(
          pdfMode
            ? {
                ...(nextMobile
                  ? buildChartOption(optionRef.current, width)
                  : optionRef.current),
                animation: false,
              }
            : nextMobile
              ? buildChartOption(optionRef.current, width)
              : optionRef.current,
          { notMerge: true },
        );
      }
      chart.resize();
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  const baseName = slugify(title || caption || "chart");

  const downloadPng = async () => {
    const chart = chartRef.current;
    if (!chart) return;

    const width = Math.round(chart.getWidth());
    const heightPx = Math.round(chart.getHeight());
    const dataUrl = await renderOffscreen(
      optionRef.current,
      width,
      heightPx,
      "canvas",
    );

    downloadDataUrl(dataUrl, `${baseName}.png`);
  };

  const downloadSvg = async () => {
    const chart = chartRef.current;
    if (!chart) return;

    const width = Math.round(chart.getWidth());
    const heightPx = Math.round(chart.getHeight());
    const dataUrl = await renderOffscreen(
      optionRef.current,
      width,
      heightPx,
      "svg",
    );

    downloadDataUrl(dataUrl, `${baseName}.svg`);
  };

  return (
    <figure className={cn("my-12", className)}>
      {title && (
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
          {title}
        </p>
      )}
      <div className="rounded-xl border border-[#dcd7c9] bg-[#faf8f2] p-3 shadow-card">
        <div className="mb-2 flex items-center justify-end gap-2">
          <DownloadButton label="Download PNG" onDownload={downloadPng} />
          <DownloadButton label="Download SVG" onDownload={downloadSvg} />
        </div>
        <div ref={containerRef} style={{ height }} />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center">
          <span aria-hidden="true" className="mx-auto mb-2.5 block h-px w-10 bg-accent/60" />
          <span className="mx-auto block max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
