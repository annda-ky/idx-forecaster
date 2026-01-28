"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StockHeader from "./components/StockHeader";
import StockChart from "./components/StockChart";
import TabbedPanel from "./components/TabbedPanel";
import AIAdvisor from "./components/AIAdvisor";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("BBCA.JK");
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    fetchData(ticker);
    checkWatchlistStatus();
  }, [ticker]);

  async function checkWatchlistStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", user.id)
      .eq("symbol", ticker)
      .single();
    setIsWatchlisted(!!data);
  }

  async function toggleWatchlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isWatchlisted) {
      await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("symbol", ticker);
      setIsWatchlisted(false);
    } else {
      await supabase
        .from("watchlists")
        .insert({ user_id: user.id, symbol: ticker });
      setIsWatchlisted(true);
    }
  }

  async function fetchData(symbol: string) {
    setLoading(true);
    const { data: rawHistory } = await supabase
      .from("stock_prices")
      .select("date, open, high, low, close, sma_20, ema_20, rsi_14")
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
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close, // Using 'close' explicitly for candle
        actual: item.close, // Keep 'actual' for compatibility if needed, or switch everything to OHL
        sma: item.sma_20,
        ema: item.ema_20,
        rsi: item.rsi_14,
        predicted: null,
      }));

      const lastHistory = history[history.length - 1];
      const formattedForecast = forecast.map((item: any) => ({
        date: new Date(item.forecast_date).toLocaleDateString("id-ID"),
        open: null,
        high: null,
        low: null,
        close: null,
        actual: null,
        sma: null,
        ema: null,
        rsi: null,
        predicted: item.predicted_price,
      }));

      if (lastHistory && formattedForecast.length > 0) {
        formattedForecast.unshift({
          date: new Date(lastHistory.date).toLocaleDateString("id-ID"),
          open: null,
          high: null,
          low: null,
          close: null,
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

  const currentPrice =
    data.length > 0 ? data.findLast((d) => d.actual !== null)?.actual || 0 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <StockHeader
          ticker={ticker}
          data={data}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={toggleWatchlist}
          onSearch={setTicker}
        />

        <div className="mb-8">
          <AIAdvisor ticker={ticker} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Charts (2/3 width) */}
          <div className="lg:col-span-2">
            <StockChart
              data={data}
              loading={loading}
              currentPrice={currentPrice}
            />
          </div>

          {/* RIGHT: Tabbed Panel (1/3 width) */}
          <TabbedPanel
            data={data}
            ticker={ticker}
            currentPrice={currentPrice}
            onSelectTicker={setTicker}
          />
        </div>
      </div>
    </div>
  );
}
