/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChannelData } from "../types";

interface InteractiveChartProps {
  data: ChannelData[];
  title: string;
  unit: string;
  isPowerView?: boolean; // Whether viewing power/voltage instead of energy
}

export default function InteractiveChart({ data, title, unit, isPowerView = false }: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeLegend, setActiveLegend] = useState<{ raw: boolean; calc: boolean }>({ raw: true, calc: true });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 350 });

  // Update sizes dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 280),
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded text-slate-400 text-xs">
        Không có dữ liệu đồ thị để hiển thị.
      </div>
    );
  }

  // Calculate scales/max values
  const rawValues = data.map((d) => d.raw);
  const calcValues = data.map((d) => d.calc);

  const minRaw = Math.min(...rawValues) * 0.9999;
  const maxRaw = Math.max(...rawValues) * 1.0001;
  const rawRange = maxRaw - minRaw || 1;

  const minCalc = 0;
  const maxCalc = Math.max(...calcValues, 2) * 1.1; // Ensure some headroom
  const calcRange = maxCalc - minCalc || 1;

  // SVG parameters
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = dimensions.width - paddingLeft - paddingRight;
  const chartHeight = dimensions.height - paddingTop - paddingBottom;

  // Limit number of rendered points/ticks along X-axis to keep visual clarity
  const step = Math.max(1, Math.floor(data.length / 50));
  const displayData = data.filter((_, i) => i % step === 0);

  // Translate coordinates helper
  const getRawCoords = (index: number, val: number) => {
    const x = paddingLeft + (index / (displayData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minRaw) / rawRange) * chartHeight;
    return { x, y };
  };

  const getCalcCoords = (index: number, val: number) => {
    const x = paddingLeft + (index / (displayData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minCalc) / calcRange) * chartHeight;
    return { x, y };
  };

  // Generate path coordinates for lines
  let rawLinePath = "";
  let calcLinePath = "";
  
  if (displayData.length > 1) {
    displayData.forEach((item, index) => {
      const pRaw = getRawCoords(index, item.raw);
      const pCalc = getCalcCoords(index, item.calc);
      
      if (index === 0) {
        rawLinePath = `M ${pRaw.x} ${pRaw.y}`;
        calcLinePath = `M ${pCalc.x} ${pCalc.y}`;
      } else {
        rawLinePath += ` L ${pRaw.x} ${pRaw.y}`;
        calcLinePath += ` L ${pCalc.x} ${pCalc.y}`;
      }
    });
  }

  // Hover detection handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left - paddingLeft;
    const relativeX = mouseX / chartWidth;
    
    let index = Math.round(relativeX * (displayData.length - 1));
    if (index < 0) index = 0;
    if (index >= displayData.length) index = displayData.length - 1;
    
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Grid tick creation helpers
  const yTicksCount = 5;
  const rawTicks = Array.from({ length: yTicksCount }, (_, i) => minRaw + (rawRange / (yTicksCount - 1)) * i);
  const calcTicks = Array.from({ length: yTicksCount }, (_, i) => minCalc + (calcRange / (yTicksCount - 1)) * i);
  
  // X ticks count
  const xTicksCount = 6;
  const xTickIndices = Array.from({ length: xTicksCount }, (_, i) => 
    Math.min(displayData.length - 1, Math.floor((displayData.length / (xTicksCount - 1)) * i))
  );

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded p-4 font-sans shadow-xs flex flex-col flex-1 min-h-[300px]" ref={containerRef}>
      {/* Title & Legend Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <span>Graph: {title}</span>
            <span className="text-slate-400 font-mono text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-normal lowercase select-all">
              {data.length} cycles ({unit})
            </span>
          </span>
        </div>

        {/* Legend buttons to toggle variables */}
        <div className="flex items-center gap-4 text-[11px] font-semibold mt-1 sm:mt-0">
          <button
            onClick={() => setActiveLegend(prev => ({ ...prev, raw: !prev.raw }))}
            className={`flex items-center gap-1.5 transition-opacity px-2 py-0.5 rounded ${
              activeLegend.raw ? "opacity-100 bg-red-50 text-red-700" : "opacity-4 text-slate-400"
            }`}
          >
            <span className="w-2.5 h-2.5 bg-red-600 rounded-xs inline-block"></span>
            <span>RAW (Điện tích lũy)</span>
          </button>
          <button
            onClick={() => setActiveLegend(prev => ({ ...prev, calc: !prev.calc }))}
            className={`flex items-center gap-1.5 transition-opacity px-2 py-0.5 rounded ${
              activeLegend.calc ? "opacity-100 bg-blue-50 text-blue-750" : "opacity-4 text-slate-400"
            }`}
          >
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block"></span>
            <span>CALC (Sản lượng chu kỳ)</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas drawing */}
      <div className="flex-1 relative">
        <svg
          width="100%"
          height={dimensions.height - 40}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible select-none cursor-crosshair"
        >
          {/* Grids and Axes background lines */}
          {Array.from({ length: yTicksCount }).map((_, i) => {
            const y = paddingTop + (chartHeight / (yTicksCount - 1)) * i;
            return (
              <line
                key={`grid-${i}`}
                x1={paddingLeft}
                y1={y}
                x2={dimensions.width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Left Y Axis (RAW Ticks and labels) (Red Theme) */}
          {activeLegend.raw &&
            rawTicks.map((tickVal, i) => {
              const y = paddingTop + chartHeight - (i / (yTicksCount - 1)) * chartHeight;
              return (
                <g key={`raw-tick-${i}`}>
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#dc2626"
                    className="text-[9px] font-mono leading-none"
                  >
                    {tickVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </text>
                  <line x1={paddingLeft - 4} y1={y} x2={paddingLeft} y2={y} stroke="#dc2626" strokeWidth={1} />
                </g>
              );
            })}

          {/* Right Y Axis (CALC Ticks and labels) (Blue Theme) */}
          {activeLegend.calc &&
            calcTicks.map((tickVal, i) => {
              const y = paddingTop + chartHeight - (i / (yTicksCount - 1)) * chartHeight;
              return (
                <g key={`calc-tick-${i}`}>
                  <text
                    x={dimensions.width - paddingRight + 8}
                    y={y + 4}
                    textAnchor="start"
                    fill="#2563eb"
                    className="text-[9px] font-mono leading-none"
                  >
                    {tickVal.toFixed(2)}
                  </text>
                  <line
                    x1={dimensions.width - paddingRight}
                    y1={y}
                    x2={dimensions.width - paddingRight + 4}
                    y2={y}
                    stroke="#2563eb"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

          {/* X Axis drawing */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={dimensions.width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth={1.2}
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth={1.2}
          />
          <line
            x1={dimensions.width - paddingRight}
            y1={paddingTop}
            x2={dimensions.width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth={1.2}
          />

          {/* X Axis Labels */}
          {xTickIndices.map((idx, i) => {
            const item = displayData[idx];
            if (!item) return null;
            const x = paddingLeft + (idx / (displayData.length - 1)) * chartWidth;
            // Show only hours or days if too crowded
            const timeLabel = item.timestamp.split(" ")[1] === "00:00" ? item.timestamp.split(" ")[0].substring(0, 5) : item.timestamp.split(" ")[1];
            return (
              <g key={`x-tick-${i}`}>
                <line x1={x} y1={paddingTop + chartHeight} x2={x} y2={paddingTop + chartHeight + 4} stroke="#94a3b8" strokeWidth={1} />
                <text
                  x={x}
                  y={paddingTop + chartHeight + 15}
                  textAnchor="middle"
                  fill="#475569"
                  className="text-[9px] font-mono leading-none"
                >
                  {timeLabel}
                </text>
              </g>
            );
          })}

          {/* CALC Data Render - Columns/Bars or Area */}
          {activeLegend.calc && (
            <g>
              {displayData.map((item, index) => {
                const p = getCalcCoords(index, item.calc);
                const colWidth = Math.max(2, Math.floor(chartWidth / displayData.length * 0.7));
                return (
                  <rect
                    key={`bar-${index}`}
                    x={p.x - colWidth / 2}
                    y={p.y}
                    width={colWidth}
                    height={paddingTop + chartHeight - p.y}
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    stroke="#2563eb"
                    strokeWidth={0.5}
                    className="transition-all"
                  />
                );
              })}
            </g>
          )}

          {/* RAW Data Render - Red Line plot */}
          {activeLegend.raw && (
            <path
              d={rawLinePath}
              fill="none"
              stroke="#dc2626"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair vertical bar & dots */}
          {hoveredIndex !== null && displayData[hoveredIndex] && (
            <g>
              {/* Vertical ruler line */}
              <line
                x1={paddingLeft + (hoveredIndex / (displayData.length - 1)) * chartWidth}
                y1={paddingTop}
                x2={paddingLeft + (hoveredIndex / (displayData.length - 1)) * chartWidth}
                y2={paddingTop + chartHeight}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />

              {/* RAW data dot marker */}
              {activeLegend.raw && (
                <circle
                  cx={getRawCoords(hoveredIndex, displayData[hoveredIndex].raw).x}
                  cy={getRawCoords(hoveredIndex, displayData[hoveredIndex].raw).y}
                  r={4.5}
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="shadow-sm"
                />
              )}

              {/* CALC data dot marker */}
              {activeLegend.calc && (
                <circle
                  cx={getCalcCoords(hoveredIndex, displayData[hoveredIndex].calc).x}
                  cy={getCalcCoords(hoveredIndex, displayData[hoveredIndex].calc).y}
                  r={4.5}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="shadow-sm"
                />
              )}
            </g>
          )}
        </svg>

        {/* Custom floating Tooltip */}
        {hoveredIndex !== null && displayData[hoveredIndex] && (
          <div
            className="absolute bg-white/95 border border-slate-300 rounded shadow-md p-2.5 text-[10px] space-y-1 font-mono pointer-events-none select-none z-20 min-w-[170px]"
            style={{
              left: Math.min(
                dimensions.width - 200,
                Math.max(10, paddingLeft + (hoveredIndex / (displayData.length - 1)) * chartWidth - 85)
              ),
              top: paddingTop + 10,
            }}
          >
            <div className="font-bold text-[10px] text-slate-800 border-b border-slate-205 pb-1 flex justify-between">
              <span>Đo lúc:</span>
              <span className="text-blue-700">{displayData[hoveredIndex].timestamp}</span>
            </div>
            {activeLegend.raw && (
              <div className="flex justify-between items-center text-red-700 font-semibold gap-2">
                <span>• Tích lũy (RAW):</span>
                <span>
                  {displayData[hoveredIndex].raw.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {unit}
                </span>
              </div>
            )}
            {activeLegend.calc && (
              <div className="flex justify-between items-center text-blue-700 font-semibold gap-2">
                <span>• Chu kỳ (CALC):</span>
                <span>{displayData[hoveredIndex].calc.toFixed(2)} {unit}</span>
              </div>
            )}
            <div className="text-[9px] text-slate-400 border-t border-slate-150 pt-1 mt-1 font-sans flex flex-col gap-0.5">
              <span>U pha A: <strong className="text-slate-600 font-mono">{displayData[hoveredIndex].voltage || 220.4} V</strong></span>
              <span>I pha A: <strong className="text-slate-600 font-mono">{displayData[hoveredIndex].current || 5.12} A</strong></span>
              <span>P tức thời: <strong className="text-slate-600 font-mono">{displayData[hoveredIndex].power || 0.95} kW</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-[9px] text-slate-400 font-medium justify-between border-t border-slate-100 pt-2 shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
          <span>Trục trái (Đỏ) đại diện chỉ số tích lũy từ Công tơ về</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          <span>Trục phải (Xanh) đại diện sản lượng tiêu thụ 30 phút theo chu kỳ tích phân</span>
        </span>
      </div>
    </div>
  );
}
