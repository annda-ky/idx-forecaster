"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { Search, Wallet } from "lucide-react";
import Link from "next/link";
import TradingPanel from "./components/TradingPanel";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("BBCA.JK");
  const [searchInput, setSearchInput] = useState("");

  // State Toggle Indikator
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);

  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  async function fetchData(symbol: string) {
    setLoading(true);

    const { data: rawHistory } = await supabase
      .from("stock_prices")
      .select("date, close, sma_20, ema_20, rsi_14") // Ambil RSI juga
      .eq("symbol", symbol)
      .order("date", { ascending: false })
      .limit(90);

    const history = rawHistory ? rawHistory.reverse() : [];

    const { data: forecast } = await supabase
      .from("predictions")
      .select("forecast_date, predicted_price")
      .eq("symbol", symbol)
      .order("forecast_date", { ascending: true });

    if (history && forecast && history.length > 0) {
      const formattedHistory = history.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("id-ID"),
        actual: item.close,
        sma: item.sma_20,
        ema: item.ema_20,
        rsi: item.rsi_14, // Map RSI
        predicted: null,
      }));

      const lastHistory = history[history.length - 1];

      const formattedForecast = forecast.map((item: any) => ({
        date: new Date(item.forecast_date).toLocaleDateString("id-ID"),
        actual: null,
        sma: null,
        ema: null,
        rsi: null,
        predicted: item.predicted_price,
      }));

      if (lastHistory && formattedForecast.length > 0) {
        formattedForecast.unshift({
          date: new Date(lastHistory.date).toLocaleDateString("id-ID"),
          actual: null,
          sma: null,
          ema: null,
          rsi: null,
          predicted: lastHistory.close,
        });
      }

      setData([...formattedHistory, ...formattedForecast]);
    } else {
      setData([]);
    }
    setLoading(false);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      setTicker(searchInput.toUpperCase());
    }
  };

  const currentPrice =
    data.length > 0 ? data.findLast((d) => d.actual !== null)?.actual || 0 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">IDX Forecaster</h1>
            <p className="text-slate-400">Analisis Pergerakan Saham {ticker}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/portfolio"
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              <Wallet size={18} />
              <span>My Portfolio</span>
            </Link>

            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari emiten (contoh: TLKM.JK)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-4 pr-10 text-white focus:outline-none focus:border-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KOLOM KIRI: GRAFIK UTAMA & RSI */}
          <div className="lg:col-span-2 space-y-4">
            {/* 1. GRAFIK HARGA */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  📊 Price Action
                </h2>

                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showSMA}
                      onChange={(e) => setShowSMA(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-orange-400">SMA 20</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showEMA}
                      onChange={(e) => setShowEMA(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-purple-400">EMA 20</span>
                  </label>
                </div>

                {data.length > 0 && (
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-400">Harga Terakhir</p>
                    <p className="text-2xl font-bold text-white">
                      Rp{currentPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              <div className="h-[350px] w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Mengambil data {ticker}...
                  </div>
                ) : data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} syncId="stockSync">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={false} // Sembunyikan tanggal di chart atas biar rapi
                      />
                      <YAxis
                        stroke="#64748b"
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => `Rp${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                        }}
                        itemStyle={{ color: "#e2e8f0" }}
                        formatter={(value: number, name: string) => {
                          if (!value) return ["-", name];
                          return [`Rp${value.toLocaleString("id-ID")}`, name];
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Harga Historis"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Prediksi AI"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: "#10b981" }}
                      />
                      {showSMA && (
                        <Line
                          type="monotone"
                          dataKey="sma"
                          name="SMA 20"
                          stroke="#f97316"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}
                      {showEMA && (
                        <Line
                          type="monotone"
                          dataKey="ema"
                          name="EMA 20"
                          stroke="#a855f7"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <p>Data tidak ditemukan</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. GRAFIK RSI (Indikator Momentum) */}
            {data.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  RSI (14) - Momentum
                </h3>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} syncId="stockSync">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[30, 70]}
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                        }}
                        itemStyle={{ color: "#e2e8f0" }}
                        formatter={(value: number) => [
                          value?.toFixed(2),
                          "RSI",
                        ]}
                      />
                      <ReferenceLine
                        y={70}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: "Overbought",
                          position: "insideTopRight",
                          fill: "#ef4444",
                          fontSize: 10,
                        }}
                      />
                      <ReferenceLine
                        y={30}
                        stroke="#22c55e"
                        strokeDasharray="3 3"
                        label={{
                          value: "Oversold",
                          position: "insideBottomRight",
                          fill: "#22c55e",
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rsi"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: TRADING PANEL */}
          <div className="lg:col-span-1">
            {data.length > 0 ? (
              <TradingPanel ticker={ticker} currentPrice={currentPrice} />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex items-center justify-center text-slate-500">
                <p>Pilih saham valid untuk mulai trading</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
