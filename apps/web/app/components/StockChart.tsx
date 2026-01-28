"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Cell,
} from "recharts";
import { useState } from "react";

interface StockData {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  actual: number | null; // Keep for fallback or specific line usage
  sma: number | null;
  ema: number | null;
  rsi: number | null;
  predicted: number | null;
}

interface StockChartProps {
  data: StockData[];
  loading: boolean;
  currentPrice: number;
}

// --- Custom Candle Shape ---
const Candle = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isBullish = close > open;
  const color = isBullish ? "#10b981" : "#ef4444"; // Emerald (Green) or Rose (Red)
  const ratio = Math.abs(high - low) === 0 ? 1 : height / Math.abs(high - low);

  // Calculate Wick Coordinates
  const yHigh = y - (high - Math.max(open, close)) * ratio;
  const yLow = y + height + (Math.min(open, close) - low) * ratio;

  // Re-calculate body height to avoid 0 height rendering issues
  const bodyHeight = height === 0 ? 1 : height;

  return (
    <g stroke={color} fill={color} strokeWidth="1.5">
      {/* Wick Line */}
      <line x1={x + width / 2} y1={yHigh} x2={x + width / 2} y2={yLow} />
      {/* Body Rect */}
      <rect
        x={x}
        y={y}
        width={width}
        height={bodyHeight}
        fill={color}
        stroke="none"
      />
    </g>
  );
};

export default function StockChart({
  data,
  loading,
  currentPrice,
}: StockChartProps) {
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);

  // Helper for Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the candle data item
      const candleData = payload.find((p: any) => p.dataKey === "actual"); // We map 'actual' to bar, or check index
      // Actually, payload[0].payload has the full object
      const dataItem = payload[0].payload;

      return (
        <div className="bg-[#0F1115]/95 border border-[#D4AF37]/50 p-4 rounded-none shadow-2xl backdrop-blur-md min-w-[180px]">
          <p className="font-serif text-[#D4AF37] mb-3 border-b border-[#A98E4B]/30 pb-2 text-lg tracking-wide">
            {label}
          </p>

          {/* OHLC Section */}
          {dataItem.open != null && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
              <span className="text-slate-400">Open</span>
              <span className="font-mono text-right text-white">
                {dataItem.open?.toLocaleString("id-ID") ?? "-"}
              </span>
              <span className="text-slate-400">High</span>
              <span className="font-mono text-right text-emerald-400">
                {dataItem.high?.toLocaleString("id-ID") ?? "-"}
              </span>
              <span className="text-slate-400">Low</span>
              <span className="font-mono text-right text-rose-400">
                {dataItem.low?.toLocaleString("id-ID") ?? "-"}
              </span>
              <span className="text-slate-400">Close</span>
              <span className="font-mono text-right font-bold text-white">
                {dataItem.close?.toLocaleString("id-ID") ?? "-"}
              </span>
            </div>
          )}

          {/* Indicators Section */}
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              // Skip showing "actual" or "close" again if we showed OHLC, unless relevant
              if (
                [
                  "actual",
                  "open",
                  "high",
                  "low",
                  "close",
                  "candleBody",
                ].includes(entry.dataKey)
              )
                return null;

              return (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-slate-500 min-w-[60px]">
                    {entry.name}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {entry.value
                      ? `Rp${Number(entry.value).toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data for Recharts to handle the "Range" for the Bar
  // Recharts Bar can take [min, max] as value.
  // For Candle: [min(open, close), max(open, close)]
  const chartData = data.map((d) => {
    if (d.open === null || d.close === null) return d;
    return {
      ...d,
      candleBody: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
      // We pass raw OHLC values in the object for the shape to use
    };
  });

  return (
    <div className="space-y-6">
      {/* Chart Harga */}
      <div className="bg-glass rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#D4AF37] font-serif tracking-tight">
              📊 Market Overview
            </h2>
            <p className="text-xs text-[#A98E4B] mt-1 uppercase tracking-[0.2em] font-medium font-body">
              Candlestick & AI Forecast
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end md:items-center">
            {/* Toggles */}
            <div className="flex gap-4 text-sm bg-slate-800/50 p-1.5 rounded-lg border border-slate-700 shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 hover:bg-slate-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={showSMA}
                  onChange={(e) => setShowSMA(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-500 text-orange-500 focus:ring-orange-500 accent-orange-500 bg-slate-900"
                />
                <span className="text-slate-300 font-medium text-xs">
                  SMA 20
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 hover:bg-slate-700 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={showEMA}
                  onChange={(e) => setShowEMA(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500 accent-purple-500 bg-slate-900"
                />
                <span className="text-slate-300 font-medium text-xs">
                  EMA 20
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-teal-500 rounded-full animate-spin"></div>
              <span className="animate-pulse">Loading Market Data...</span>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                syncId="stockSync"
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>{/* Gradients if needed */}</defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#A98E4B"
                  tick={{
                    fill: "#F5F5DC",
                    fontSize: 10,
                    fontFamily: "Poppins",
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#A98E4B", strokeOpacity: 0.3 }}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#A98E4B"
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => `${value / 1000}k`}
                  tick={{
                    fill: "#F5F5DC",
                    fontSize: 10,
                    fontFamily: "Poppins",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#D4AF37",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px", fontFamily: "Poppins" }}
                />

                {/* 
                  Candlestick Layer 
                */}
                <Bar
                  dataKey="candleBody"
                  shape={(props: any) => (
                    <Candle
                      {...props}
                      low={props.payload.low}
                      high={props.payload.high}
                      open={props.payload.open}
                      close={props.payload.close}
                    />
                  )}
                  name="Price Action"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.close > entry.open ? "#10b981" : "#ef4444"}
                      stroke={entry.close > entry.open ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Bar>

                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="AI Forecast"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{
                    r: 4,
                    fill: "#0F1115",
                    stroke: "#D4AF37",
                    strokeWidth: 2,
                  }}
                />
                {showSMA && (
                  <Line
                    type="monotone"
                    dataKey="sma"
                    name="SMA 20"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
                {showEMA && (
                  <Line
                    type="monotone"
                    dataKey="ema"
                    name="EMA 20"
                    stroke="#A855F7"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <p>No market data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart RSI */}
      {data.length > 0 && (
        <div className="bg-glass rounded-xl p-6 shadow-sm border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-1 h-4 bg-orange-400 rounded-full"></span>
            RSI (14) Momentum
          </h3>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                syncId="stockSync"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[30, 70]}
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={70}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={30}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="rsi"
                  stroke="#f59e0b"
                  fill="url(#rsiGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
