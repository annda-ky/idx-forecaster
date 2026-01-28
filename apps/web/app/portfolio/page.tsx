"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
} from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const [balance, setBalance] = useState(0);
  const [stocks, setStocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  async function fetchPortfolioData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Ambil Saldo Cash
    const { data: portData } = await supabase
      .from("portfolios")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (portData) setBalance(portData.balance);

    // 2. Ambil Daftar Saham yang Dimiliki
    const { data: stockData } = await supabase
      .from("portfolio_stocks")
      .select("*")
      .eq("user_id", user.id)
      .gt("quantity", 0); // Hanya ambil yang stoknya > 0

    if (stockData && stockData.length > 0) {
      // 3. Ambil Harga Pasar Terbaru untuk setiap saham
      const symbols = stockData.map((s) => s.symbol);

      // Query "IN" untuk ambil harga terakhir semua saham sekaligus
      const { data: prices } = await supabase
        .from("stock_prices")
        .select("symbol, close, date")
        .in("symbol", symbols)
        .order("date", { ascending: false });

      // Map data saham dengan harga terbarunya
      const mergedData = stockData.map((stock) => {
        // Cari harga closing paling baru untuk simbol ini
        const latestPrice =
          prices?.find((p) => p.symbol === stock.symbol)?.close ||
          stock.average_price;
        const marketValue = stock.quantity * latestPrice;
        const costBasis = stock.quantity * stock.average_price;
        const unrealizedPL = marketValue - costBasis;
        const plPercentage = (unrealizedPL / costBasis) * 100;

        return {
          ...stock,
          current_price: latestPrice,
          market_value: marketValue,
          unrealized_pl: unrealizedPL,
          pl_percentage: plPercentage,
        };
      });

      setStocks(mergedData);
    }

    // 4. Ambil Riwayat Transaksi
    const { data: trxData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (trxData) setTransactions(trxData);

    setLoading(false);
  }

  // Hitung Total Aset (Cash + Saham)
  const totalEquity =
    balance + stocks.reduce((acc, curr) => acc + curr.market_value, 0);

  if (loading)
    return (
      <div className="p-10 text-white bg-slate-950 min-h-screen">
        Loading portfolio...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-white flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-blue-400">My Portfolio</h1>
          <p className="text-slate-400">Ringkasan Aset & Performa Investasi</p>
        </div>

        {/* --- RINGKASAN ASET --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Wallet size={20} /> Total Equity (Net Worth)
            </div>
            <div className="text-3xl font-bold text-white">
              Rp{totalEquity.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <TrendingUp size={20} /> Buying Power (Cash)
            </div>
            <div className="text-3xl font-bold text-green-400">
              Rp{balance.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <History size={20} /> Total Transaksi
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {transactions.length}
            </div>
          </div>
        </div>

        {/* --- HOLDINGS TABLE --- */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold">Saham yang Dimiliki</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950 text-slate-400 text-left text-sm">
                <tr>
                  <th className="p-4">Emiten</th>
                  <th className="p-4">Lot</th>
                  <th className="p-4">Avg Price</th>
                  <th className="p-4">Last Price</th>
                  <th className="p-4">Market Value</th>
                  <th className="p-4">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-blue-400">
                        {stock.symbol}
                      </td>
                      <td className="p-4">
                        {(stock.quantity / 100).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        Rp
                        {Math.round(stock.average_price).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="p-4">
                        Rp{stock.current_price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 font-mono">
                        Rp{stock.market_value.toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`p-4 font-bold ${stock.unrealized_pl >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {stock.unrealized_pl >= 0 ? "+" : ""}
                        Rp
                        {Math.round(stock.unrealized_pl).toLocaleString(
                          "id-ID",
                        )}
                        <span className="text-xs ml-1 font-normal opacity-80">
                          ({stock.pl_percentage.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Belum ada saham yang dibeli.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TRANSACTION HISTORY --- */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-950 text-slate-400 text-left text-sm sticky top-0">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Tipe</th>
                  <th className="p-4">Emiten</th>
                  <th className="p-4">Lot</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="text-sm">
                    <td className="p-4 text-slate-400">
                      {new Date(trx.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          trx.type === "BUY"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {trx.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{trx.symbol}</td>
                    <td className="p-4">
                      {(trx.amount / 100).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      Rp{trx.price_per_share.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      Rp
                      {(trx.amount * trx.price_per_share).toLocaleString(
                        "id-ID",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
