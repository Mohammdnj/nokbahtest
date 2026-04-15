"use client";
import React from "react";
import { motion } from "motion/react";

// ============================================================
// AreaChart — smooth gradient area chart for the hero card
// ============================================================
export function AreaChart({
  data,
  height = 200,
  color = "#0b7a5a",
  showGrid = true,
}: {
  data: number[];
  height?: number;
  color?: string;
  showGrid?: boolean;
}) {
  if (data.length === 0) data = [0, 0];

  const padding = { top: 20, right: 12, bottom: 24, left: 12 };
  const width = 600;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padding.top + innerH - ((v - min) / range) * innerH;
    return { x, y, value: v };
  });

  // Smooth curve using cubic bezier
  const linePath = smoothPath(points);
  const areaPath =
    linePath +
    ` L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid && (
        <g>
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={padding.left}
              x2={padding.left + innerW}
              y1={padding.top + innerH * p}
              y2={padding.top + innerH * p}
              stroke="#e5e7eb"
              strokeDasharray="2,4"
            />
          ))}
        </g>
      )}

      <motion.path
        d={areaPath}
        fill="url(#areaGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Last-point pulse */}
      {points.length > 0 && (
        <g>
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="14"
            fill={color}
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={color}
          />
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2"
            fill="white"
          />
        </g>
      )}
    </svg>
  );
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ============================================================
// Sparkline — tiny inline chart for stat cards
// ============================================================
export function SparkLine({
  data,
  width = 80,
  height = 24,
  color = "#0b7a5a",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-6 w-20" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// DonutChart — for status breakdown
// ============================================================
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  slices,
  size = 160,
  thickness = 18,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={thickness}
      />
      {total > 0 &&
        slices.map((s, i) => {
          if (s.value === 0) return null;
          const length = (s.value / total) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const segment = (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dasharray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: dasharray }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
            />
          );
          offset += length;
          return segment;
        })}
    </svg>
  );
}

// ============================================================
// HorizontalBars — for top cities
// ============================================================
export function HorizontalBars({
  data,
  color = "#0b7a5a",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{d.label}</span>
            <span className="font-bold text-[#0b7a5a] dark:text-emerald-400">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
