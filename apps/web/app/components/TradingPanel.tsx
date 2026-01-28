"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  DollarSign,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

interface TradingPanelProps {
  ticker: string;
  currentPrice: number;
}

export default function TradingPanel({
  ticker,
  currentPrice,
}: TradingPanelProps) {
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [balance, setBalance] = useState(0);
  const [ownedQty, setOwnedQty] = useState(0);
  const [qty, setQty] = useState(1); // Lot
  const [loading, setLoading] = useState(false);

  const totalValue = qty * 100 * currentPrice;

  useEffect(() => {
    fetchUserData();
  }, [ticker, mode]);

  async function fetchUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: portData } = await supabase
      .from("portfolios")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (portData) setBalance(portData.balance);

    const { data: stockData } = await supabase
      .from("portfolio_stocks")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("symbol", ticker)
      .single();

    setOwnedQty(stockData ? stockData.quantity : 0);
  }

  async function handleTrade() {
    setLoading(true);
    try {
      const functionName = mode === "BUY" ? "buy_stock" : "sell_stock";

      const { error } = await supabase.rpc(functionName, {
        p_symbol: ticker,
        p_quantity: qty * 100,
        p_price: currentPrice,
      });

      if (error) throw error;

      alert(
        `Berhasil ${mode === "BUY" ? "membeli" : "menjual"} ${qty} Lot ${ticker}!`,
      );
      setQty(1);
      fetchUserData();
    } catch (err: any) {
      alert(`Gagal ${mode}: ` + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col p-6 font-body">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-serif font-semibold text-[#D4AF37] flex items-center gap-2">
          <DollarSign className="text-[#A98E4B]" size={24} />
          Market Execution
        </h3>

        {/* Toggle Buy/Sell - Raffles Pill Style */}
        <div className="flex bg-black/40 p-1 rounded-full border border-[#A98E4B]/30 shadow-inner">
          <button
            onClick={() => setMode("BUY")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 tracking-wider ${
              mode === "BUY"
                ? "bg-emerald-600 text-[#F5F5DC] shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "text-[#A98E4B] hover:text-[#D4AF37]"
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setMode("SELL")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 tracking-wider ${
              mode === "SELL"
                ? "bg-rose-600 text-[#F5F5DC] shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                : "text-[#A98E4B] hover:text-[#D4AF37]"
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {/* Info Card */}
        <div className="bg-[#1A1D23]/80 p-5 rounded-none border border-[#D4AF37]/30 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#A98E4B] flex items-center gap-2 uppercase tracking-[0.2em]">
              <Wallet size={14} />
              {mode === "BUY" ? "Buying Power" : "Owned Lots"}
            </span>
          </div>
          <span
            className={`font-mono text-2xl font-bold tracking-tight ${mode === "BUY" ? "text-[#F5F5DC]" : "text-[#D4AF37]"}`}
          >
            {mode === "BUY"
              ? `Rp${balance.toLocaleString("id-ID")}`
              : `${Math.floor(ownedQty / 100)} Lot`}
          </span>
        </div>

        {/* Input Lot */}
        <div className="bg-black/20 p-4 rounded-none border border-[#A98E4B]/20">
          <label className="text-xs text-[#A98E4B] mb-3 block uppercase tracking-wider pl-1 font-bold">
            Quantity (Lot)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="bg-[#1A1D23] hover:bg-[#2C2C2C] w-12 h-12 rounded-lg text-[#D4AF37] font-bold transition-colors border border-[#A98E4B]/30 shadow-sm"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="flex-1 bg-[#0F1115] border border-[#A98E4B]/30 rounded-lg h-12 text-center text-[#F5F5DC] text-lg font-mono focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="bg-[#1A1D23] hover:bg-[#2C2C2C] w-12 h-12 rounded-lg text-[#D4AF37] font-bold transition-colors border border-[#A98E4B]/30 shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Kalkulasi */}
        <div className="space-y-3 py-4 border-t border-dashed border-[#A98E4B]/30">
          <div className="flex justify-between text-sm">
            <span className="text-[#A98E4B]">Price / Share</span>
            <span className="text-[#F5F5DC] font-mono">
              Rp{currentPrice.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[#A98E4B] text-sm font-semibold tracking-wide">
              Estimated Total
            </span>
            <span
              className={`font-bold text-xl md:text-2xl font-mono ${mode === "BUY" ? "text-emerald-500" : "text-rose-500"}`}
            >
              Rp{totalValue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTrade}
          disabled={
            loading ||
            (mode === "BUY" && balance < totalValue) ||
            (mode === "SELL" && ownedQty < qty * 100)
          }
          className={`w-full font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transform hover:-translate-y-1 ${
            mode === "BUY"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50"
              : "bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-[#D4AF37]" />
          ) : (
            <>
              {mode === "BUY" ? (
                <ArrowUpCircle size={20} />
              ) : (
                <ArrowDownCircle size={20} />
              )}
              {mode === "BUY" ? "EXECUTE BUY" : "EXECUTE SELL"}
            </>
          )}
        </button>

        {/* Error Info */}
        <div className="min-h-[20px]">
          {mode === "BUY" && balance < totalValue && (
            <p className="text-xs text-rose-400 text-center bg-rose-900/20 py-2 rounded border border-rose-500/30">
              Insufficient funds for this trade.
            </p>
          )}
          {mode === "SELL" && ownedQty < qty * 100 && (
            <p className="text-xs text-rose-400 text-center bg-rose-900/20 py-2 rounded border border-rose-500/30">
              Insufficient stock holdings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
