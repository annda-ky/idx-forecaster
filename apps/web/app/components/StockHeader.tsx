"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Search, Wallet, Trophy, Star } from "lucide-react";
import { useState } from "react";
import SentimentGauge from "./SentimentGauge";

interface StockHeaderProps {
  ticker: string;
  data: any[]; // Data history for sentiment analysis
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onSearch: (term: string) => void;
}

export default function StockHeader({
  ticker,
  data,
  isWatchlisted,
  onToggleWatchlist,
  onSearch,
}: StockHeaderProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  async function handleSearchQuery(query: string) {
    const { data } = await supabase
      .from("company_profiles")
      .select("symbol, company_name, sector")
      .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(5);

    if (data) {
      setSearchResults(data);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* LEFT: Title & Ticker */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#D4AF37] drop-shadow-sm font-serif">
              {ticker}
            </h1>
            <button
              onClick={onToggleWatchlist}
              className={`p-2 rounded-full transition-all duration-300 border ${
                isWatchlisted
                  ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                  : "bg-black/30 border-[#A98E4B]/30 text-[#A98E4B] hover:text-[#D4AF37] hover:border-[#D4AF37]"
              }`}
              title={
                isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"
              }
            >
              <Star
                size={24}
                fill={isWatchlisted ? "currentColor" : "none"}
                className="transform transition-transform active:scale-90"
              />
            </button>
          </div>
          <p className="text-[#A98E4B] mt-1 font-medium tracking-wide flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D4AF37] inline-block"></span>
            ENTERPRISE STOCK ANALYSIS
          </p>

          <div className="mt-4">
            <SentimentGauge data={data} />
          </div>
        </div>
      </div>

      {/* RIGHT: Navigation & Search */}
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="flex gap-3">
          <Link
            href="/portfolio"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 hover:bg-black/60 hover:border-[#D4AF37] text-slate-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] px-5 py-2.5 rounded-lg transition-all duration-300 group"
          >
            <Wallet
              size={18}
              className="text-[#A98E4B] group-hover:text-[#D4AF37] transition-colors"
            />
            <span className="font-medium">Portfolio</span>
          </Link>

          <Link
            href="/leaderboard"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 hover:bg-black/60 hover:border-[#D4AF37] text-slate-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] px-5 py-2.5 rounded-lg transition-all duration-300 group"
          >
            <Trophy
              size={18}
              className="text-[#A98E4B] group-hover:text-[#D4AF37] transition-colors"
            />
            <span className="font-medium">Rank</span>
          </Link>

          <Link
            href="/market"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 hover:bg-black/60 hover:border-[#D4AF37] text-slate-300 hover:text-[#D4AF37] shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] px-5 py-2.5 rounded-lg transition-all duration-300 group"
          >
            <span className="text-[#A98E4B] group-hover:text-[#D4AF37] transition-colors font-bold">
              %
            </span>
            <span className="font-medium">Market</span>
          </Link>
        </div>

        {/* SEARCH BAR (AUTOCOMPLETE) */}
        <div className="relative w-full md:w-72">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                onSearch(searchInput.toUpperCase());
                setSearchInput("");
                setSearchResults([]);
              }
            }}
          >
            <input
              type="text"
              placeholder="Search Ticker (e.g. BBCA)"
              className="w-full bg-black/40 border border-[#A98E4B]/40 rounded-lg py-2.5 pl-4 pr-10 text-[#F5F5DC] placeholder:text-slate-600 focus:outline-none focus:bg-black/60 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-sans shadow-sm"
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                if (val.length > 1) {
                  // Simple debounce could be added here
                  handleSearchQuery(val);
                } else {
                  setSearchResults([]);
                }
              }}
              onBlur={() => {
                // Slight delay to allow clicking suggestions
                setTimeout(() => setSearchResults([]), 200);
              }}
            />
            <button
              type="submit"
              className="absolute right-3 top-3 text-[#A98E4B] hover:text-[#D4AF37] transition-colors"
            >
              <Search size={18} />
            </button>
          </form>

          {/* SEARCH RESULTS DROPDOWN */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1D23] border border-[#D4AF37]/30 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto backdrop-blur-md">
              {searchResults.map((result) => (
                <button
                  key={result.symbol}
                  className="w-full text-left px-4 py-3 hover:bg-[#D4AF37]/10 border-b border-[#D4AF37]/10 last:border-0 transition-colors flex items-center justify-between group"
                  onClick={() => {
                    onSearch(result.symbol);
                    setSearchInput("");
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <span className="block font-bold text-[#F5F5DC] group-hover:text-[#D4AF37]">
                      {result.symbol}
                    </span>
                    <span className="block text-xs text-[#A98E4B] truncate max-w-[180px]">
                      {result.company_name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase border border-slate-700 px-1 rounded">
                    {result.sector || "Stock"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
