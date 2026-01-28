"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Wallet, TrendingUp, History, PieChart } from "lucide-react";
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
      <div className="p-10 flex items-center justify-center min-h-screen text-slate-500 font-serif gap-2 animate-pulse">
        <PieChart className="animate-spin text-blue-300" /> Calculating net
        Worth...
      </div>
    );

  return (
    <div className="min-h-screen p-8 font-body">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#A98E4B] hover:text-[#D4AF37] flex items-center gap-2 mb-4 transition-colors font-medium tracking-wide"
          >
            <ArrowLeft size={20} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl font-bold font-serif text-[#D4AF37] drop-shadow-sm tracking-tight">
            My Portfolio
          </h1>
          <p className="text-[#A98E4B] mt-1 tracking-widest text-sm uppercase">
            Ringkasan Aset & Performa Investasi
          </p>
        </div>

        {/* --- RINGKASAN ASET --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1A1D23]/80 p-6 rounded-none border border-[#D4AF37]/30 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={80} />
            </div>
            <div className="flex items-center gap-3 mb-2 text-[#A98E4B] uppercase text-xs tracking-[0.2em] font-semibold">
              <Wallet size={16} className="text-[#D4AF37]" /> Total Equity
            </div>
            <div className="text-3xl font-bold font-mono text-[#F5F5DC] tracking-tight">
              Rp{totalEquity.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-[#1A1D23]/80 p-6 rounded-none border border-[#D4AF37]/30 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <div className="flex items-center gap-3 mb-2 text-[#A98E4B] uppercase text-xs tracking-[0.2em] font-semibold">
              <TrendingUp size={16} className="text-emerald-500" /> Buying Power
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-500 tracking-tight">
              Rp{balance.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-[#1A1D23]/80 p-6 rounded-none border border-[#D4AF37]/30 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <History size={80} />
            </div>
            <div className="flex items-center gap-3 mb-2 text-[#A98E4B] uppercase text-xs tracking-[0.2em] font-semibold">
              <History size={16} className="text-purple-400" /> Total Transaksi
            </div>
            <div className="text-3xl font-bold font-mono text-[#F5F5DC] tracking-tight">
              {transactions.length}
            </div>
          </div>
        </div>

        {/* --- HOLDINGS TABLE --- */}
        <div className="bg-[#1A1D23]/60 rounded-none overflow-hidden shadow-lg mb-8 border border-[#D4AF37]/30 backdrop-blur-sm">
          <div className="p-6 border-b border-[#D4AF37]/20 bg-black/40">
            <h2 className="text-xl font-bold font-serif text-[#D4AF37] tracking-wide">
              Saham yang Dimiliki
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F1115] text-[#A98E4B] text-left text-xs uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-5 font-semibold">Emiten</th>
                  <th className="p-5 font-semibold">Lot</th>
                  <th className="p-5 font-semibold">Avg Price</th>
                  <th className="p-5 font-semibold">Last Price</th>
                  <th className="p-5 font-semibold">Market Value</th>
                  <th className="p-5 font-semibold">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-[#D4AF37]/5 transition-colors group"
                    >
                      <td className="p-5 font-bold text-[#F5F5DC] font-serif tracking-wider text-lg">
                        {stock.symbol}
                      </td>
                      <td className="p-5 text-[#F5F5DC]/80">
                        {(stock.quantity / 100).toLocaleString("id-ID")}
                      </td>
                      <td className="p-5 text-[#A98E4B] font-mono text-xs">
                        Rp
                        {Math.round(stock.average_price).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="p-5 text-[#A98E4B] font-mono text-xs group-hover:text-[#D4AF37] transition-colors">
                        Rp{stock.current_price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-5 font-mono font-medium text-[#F5F5DC]">
                        Rp{stock.market_value.toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`p-5 font-bold ${stock.unrealized_pl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {stock.unrealized_pl >= 0 ? "+" : ""}
                        Rp
                        {Math.round(stock.unrealized_pl).toLocaleString(
                          "id-ID",
                        )}
                        <span className="text-xs ml-1 font-normal opacity-70">
                          ({stock.pl_percentage.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-[#A98E4B] italic font-serif"
                    >
                      Belum ada saham yang dibeli.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TRANSACTION HISTORY --- */}
        <div className="bg-[#1A1D23]/60 rounded-none overflow-hidden shadow-lg border border-[#D4AF37]/30 backdrop-blur-sm">
          <div className="p-6 border-b border-[#D4AF37]/20 bg-black/40">
            <h2 className="text-xl font-bold font-serif text-[#D4AF37] tracking-wide">
              Riwayat Transaksi
            </h2>
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-[#0F1115] text-[#A98E4B] text-left text-xs uppercase tracking-[0.2em] sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="p-5 font-semibold">Waktu</th>
                  <th className="p-5 font-semibold">Tipe</th>
                  <th className="p-5 font-semibold">Emiten</th>
                  <th className="p-5 font-semibold">Lot</th>
                  <th className="p-5 font-semibold">Harga</th>
                  <th className="p-5 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="text-sm hover:bg-[#D4AF37]/5 transition-colors"
                  >
                    <td className="p-5 text-[#A98E4B]">
                      {new Date(trx.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 text-xs font-bold tracking-wider ${
                          trx.type === "BUY"
                            ? "bg-emerald-900/30 text-emerald-500 border border-emerald-500/30"
                            : "bg-rose-900/30 text-rose-500 border border-rose-500/30"
                        }`}
                      >
                        {trx.type}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-[#F5F5DC] font-serif tracking-wide">
                      {trx.symbol}
                    </td>
                    <td className="p-5 text-[#F5F5DC]/70">
                      {(trx.amount / 100).toLocaleString("id-ID")}
                    </td>
                    <td className="p-5 text-[#A98E4B] font-mono text-xs">
                      Rp{trx.price_per_share.toLocaleString("id-ID")}
                    </td>
                    <td className="p-5 font-medium text-[#D4AF37] font-mono">
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
