"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, TrendingUp, Loader2 } from "lucide-react";

interface WatchlistPanelProps {
  currentTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export default function WatchlistPanel({
  currentTicker,
  onSelectTicker,
}: WatchlistPanelProps) {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, [currentTicker]);

  async function fetchWatchlist() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("watchlists")
      .select("symbol, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setWatchlist(data || []);
    setLoading(false);
  }

  async function removeItem(symbol: string, e: React.MouseEvent) {
    e.stopPropagation();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", user.id)
      .eq("symbol", symbol);

    fetchWatchlist();
  }

  return (
    <div className="h-full flex flex-col font-body">
      <div className="p-4 bg-[#0F1115]/90 backdrop-blur-sm border-b border-[#D4AF37]/30 sticky top-0 z-10">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></span>
          Your Watchlist
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-[#D4AF37]" />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-[#1A1D23] rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-[#A98E4B]/30">
              <TrendingUp size={24} className="text-[#A98E4B]" />
            </div>
            <p className="text-[#F5F5DC] text-sm">No assets watched.</p>
            <p className="text-xs text-[#A98E4B] mt-2">
              Add stocks to track their performance here.
            </p>
          </div>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.symbol}
              onClick={() => onSelectTicker(item.symbol)}
              className={`group relative p-5 cursor-pointer transition-all duration-300 border-b border-[#A98E4B]/10 hover:bg-[#1A1D23] ${
                currentTicker === item.symbol
                  ? "bg-[#1A1D23] border-l-4 border-l-[#D4AF37]"
                  : "bg-transparent border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-bold text-sm tracking-wider shadow-inner ${
                      currentTicker === item.symbol
                        ? "bg-[#D4AF37] text-black"
                        : "bg-[#2C2C2C] text-[#A98E4B] group-hover:text-[#F5F5DC]"
                    }`}
                  >
                    {item.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <h4
                      className={`font-bold font-serif text-lg tracking-tight ${
                        currentTicker === item.symbol
                          ? "text-[#D4AF37]"
                          : "text-[#F5F5DC] group-hover:text-white"
                      }`}
                    >
                      {item.symbol}
                    </h4>
                    <p className="text-[10px] text-[#A98E4B] uppercase tracking-widest">
                      Jakarta Stock Exchange
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => removeItem(item.symbol, e)}
                  className="p-2 text-[#555] hover:text-[#F87171] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
