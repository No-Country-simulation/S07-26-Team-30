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
  GridComponent,
  LegendComponent,
  RadarComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
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

interface DownloadButtonProps {
  label: string;
  onDownload: () => void;
}

function DownloadButton({ label, onDownload }: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container, undefined, { renderer: "svg" });
    chartRef.current = chart;
    chart.setOption(optionRef.current);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  const baseName = slugify(title || caption || "chart");

  const downloadPng = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const width = Math.round(chart.getWidth());
    const heightPx = Math.round(chart.getHeight());

    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.left = "-99999px";
    host.style.top = "0";
    host.style.width = `${width}px`;
    host.style.height = `${heightPx}px`;
    document.body.appendChild(host);

    const pngChart = echarts.init(host, undefined, { renderer: "canvas" });
    pngChart.setOption(optionRef.current);
    const dataUrl = pngChart.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
    pngChart.dispose();
    host.remove();

    downloadDataUrl(dataUrl, `${baseName}.png`);
  };

  const downloadSvg = () => {
    const chart = chartRef.current;
    if (!chart) return;
    downloadDataUrl(chart.getDataURL({ type: "svg" }), `${baseName}.svg`);
  };

  return (
    <figure className={cn("my-8", className)}>
      {title && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center justify-end gap-2">
          <DownloadButton label="Download PNG" onDownload={downloadPng} />
          <DownloadButton label="Download SVG" onDownload={downloadSvg} />
        </div>
        <div ref={containerRef} style={{ height }} />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
