"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function MarketScreenerPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "change_percentage",
    direction: "desc",
  });
  const [filter, setFilter] = useState("ALL"); // ALL, GAINERS, LOSERS
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMarketData();
  }, []);

  async function fetchMarketData() {
    setLoading(true);

    // 1. Fetch Company Profiles (Base)
    const { data: profiles } = await supabase
      .from("company_profiles")
      .select("symbol, company_name, sector");

    if (!profiles) {
      setLoading(false);
      return;
    }

    // 2. Fetch Latest Price for EACH stock
    // Optimisasi: Ambil harga terakhir dari tabel stock_prices (Group By Symbol)
    // Note: Karena Supabase basic tidak support complex group-by di client, kita fetch recent prices dan filter di JS
    // Untuk performa lebih baik, idealnya ada tabel 'daily_snapshot' atau View.
    // DISINI KITA GUNAKAN LOGIC SEDERHANA: Ambil price unique symbols dari 2 hari terakhir.

    // Workaround: Loop fetch latest price per symbol is TOO SLOW.
    // Solution: We will fetch the latest 2000 records of stock_prices order by date desc.
    const { data: latestPrices } = await supabase
      .from("stock_prices")
      .select("symbol, close, open, volume, date, rsi_14")
      .order("date", { ascending: false })
      .limit(2000); // Asumsi cover semua saham hari ini

    if (latestPrices) {
      // Gabungkan
      const marketData = profiles
        .map((profile) => {
          // Find latest price record
          const priceRecord = latestPrices.find(
            (p) => p.symbol === profile.symbol,
          );

          if (!priceRecord) return null;

          const change = priceRecord.close - priceRecord.open; // Simple daily change approx
          const changePercentage = (change / priceRecord.open) * 100;

          return {
            ...profile,
            price: priceRecord.close,
            change: change,
            change_percentage: changePercentage,
            volume: priceRecord.volume,
            rsi: priceRecord.rsi_14,
            date: priceRecord.date,
          };
        })
        .filter(Boolean); // Remove nulls

      setStocks(marketData);
    }
    setLoading(false);
  }

  // --- Sorting & Filtering Logic ---
  const filteredStocks = stocks
    .filter((s) => {
      if (filter === "GAINERS") return s.change_percentage > 0;
      if (filter === "LOSERS") return s.change_percentage < 0;
      return true;
    })
    .filter(
      (s) =>
        s.symbol.includes(search.toUpperCase()) ||
        s.company_name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen p-8 font-body">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="text-[#A98E4B] hover:text-[#D4AF37] flex items-center gap-2 mb-4 transition-colors font-medium tracking-wide"
            >
              <ArrowLeft size={20} /> Kembali ke Dashboard
            </Link>
            <h1 className="text-4xl font-bold font-serif text-[#D4AF37] drop-shadow-sm tracking-tight flex items-center gap-3">
              <TrendingUp className="text-[#D4AF37]" /> Market Screener
            </h1>
            <p className="text-[#A98E4B] mt-1 tracking-widest text-sm uppercase">
              Pantau Pergerakan Seluruh Pasar Saham Indonesia
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-[#A98E4B]"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari Emiten..."
                className="bg-black/40 border border-[#A98E4B]/30 rounded-lg pl-9 pr-4 py-2 text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex bg-black/40 rounded-lg border border-[#A98E4B]/30 p-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "ALL" ? "bg-[#D4AF37] text-black" : "text-[#A98E4B] hover:text-[#D4AF37]"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("GAINERS")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "GAINERS" ? "bg-emerald-600 text-white" : "text-[#A98E4B] hover:text-emerald-500"}`}
              >
                Gainers
              </button>
              <button
                onClick={() => setFilter("LOSERS")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "LOSERS" ? "bg-rose-600 text-white" : "text-[#A98E4B] hover:text-rose-500"}`}
              >
                Losers
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1A1D23]/80 border border-[#D4AF37]/30 rounded-none shadow-2xl backdrop-blur-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>

          {loading ? (
            <div className="p-20 text-center text-[#D4AF37] animate-pulse font-serif tracking-widest">
              MENGAMBIL DATA PASAR...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60 text-[#A98E4B] text-xs uppercase tracking-[0.2em] font-semibold border-b border-[#D4AF37]/20">
                  <tr>
                    <th
                      className="p-5 text-left cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol
                    </th>
                    <th
                      className="p-5 text-left cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("company_name")}
                    >
                      Company
                    </th>
                    <th
                      className="p-5 text-right cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("price")}
                    >
                      Price
                    </th>
                    <th
                      className="p-5 text-right cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("change_percentage")}
                    >
                      % Change
                    </th>
                    <th
                      className="p-5 text-right cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("volume")}
                    >
                      Volume
                    </th>
                    <th
                      className="p-5 text-center cursor-pointer hover:text-[#D4AF37]"
                      onClick={() => handleSort("rsi")}
                    >
                      RSI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-[#D4AF37]/5 transition-colors group"
                    >
                      <td className="p-5 font-bold font-serif text-[#F5F5DC] tracking-wide">
                        <Link
                          href={`/?ticker=${stock.symbol}`}
                          className="hover:underline decoration-[#D4AF37]"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="p-5 text-[#F5F5DC]/80 text-sm max-w-[200px] truncate">
                        {stock.company_name}
                        <div className="text-[10px] text-[#A98E4B] uppercase tracking-wider mt-1">
                          {stock.sector}
                        </div>
                      </td>
                      <td className="p-5 text-right font-mono text-[#D4AF37]">
                        Rp{stock.price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-5 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${stock.change_percentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {stock.change_percentage >= 0 ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          {Math.abs(stock.change_percentage).toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-5 text-right font-mono text-[#F5F5DC]/70 text-xs">
                        {stock.volume.toLocaleString("id-ID")}
                      </td>
                      <td className="p-5 text-center">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded border ${
                            stock.rsi > 70
                              ? "border-rose-500 text-rose-500"
                              : stock.rsi < 30
                                ? "border-emerald-500 text-emerald-500"
                                : "border-[#A98E4B]/50 text-[#A98E4B]"
                          }`}
                        >
                          {stock.rsi ? Math.round(stock.rsi) : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredStocks.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-[#A98E4B] italic"
                      >
                        Tidak ada data saham yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
