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
  }, [ticker, mode]); // Refresh saat ganti saham atau ganti mode

  async function fetchUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Ambil Saldo Uang
    const { data: portData } = await supabase
      .from("portfolios")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (portData) setBalance(portData.balance);

    // 2. Ambil Stok Saham Ini
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
        p_quantity: qty * 100, // Konversi Lot ke Lembar
        p_price: currentPrice,
      });

      if (error) throw error;

      alert(
        `Berhasil ${mode === "BUY" ? "membeli" : "menjual"} ${qty} Lot ${ticker}!`,
      );
      setQty(1);
      fetchUserData(); // Refresh data saldo/stok
    } catch (err: any) {
      alert(`Gagal ${mode}: ` + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign
            className={mode === "BUY" ? "text-green-500" : "text-red-500"}
            size={20}
          />
          Market Order
        </h3>

        {/* Toggle Buy/Sell */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMode("BUY")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              mode === "BUY"
                ? "bg-green-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setMode("SELL")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              mode === "SELL"
                ? "bg-red-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* Info Contextual: Kalau Buy liat Saldo, Kalau Sell liat Stok */}
        <div className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Wallet size={14} />{" "}
            {mode === "BUY" ? "Buying Power" : "Owned Lots"}
          </span>
          <span
            className={`font-mono font-bold ${mode === "BUY" ? "text-green-400" : "text-blue-400"}`}
          >
            {mode === "BUY"
              ? `Rp${balance.toLocaleString("id-ID")}`
              : `${Math.floor(ownedQty / 100)} Lot`}
          </span>
        </div>

        {/* Input Lot */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Jumlah Lot (1 Lot = 100 lbr)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded text-white font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="flex-1 bg-slate-950 border border-slate-700 rounded h-10 text-center text-white"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded text-white font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Kalkulasi */}
        <div className="space-y-1 py-4 border-t border-slate-800 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Harga per lembar</span>
            <span className="text-slate-300">
              Rp{currentPrice.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              Estimasi {mode === "BUY" ? "Biaya" : "Terima"}
            </span>
            <span
              className={`font-bold text-lg ${mode === "BUY" ? "text-white" : "text-green-400"}`}
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
          className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === "BUY"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {mode === "BUY" ? (
                <ArrowUpCircle size={20} />
              ) : (
                <ArrowDownCircle size={20} />
              )}
              {mode === "BUY" ? "BELI SEKARANG" : "JUAL SEKARANG"}
            </>
          )}
        </button>

        {/* Error Message kalau saldo/stok kurang */}
        {mode === "BUY" && balance < totalValue && (
          <p className="text-xs text-red-500 text-center">
            Saldo tidak mencukupi
          </p>
        )}
        {mode === "SELL" && ownedQty < qty * 100 && (
          <p className="text-xs text-red-500 text-center">
            Stok saham tidak mencukupi
          </p>
        )}
      </div>
    </div>
  );
}
