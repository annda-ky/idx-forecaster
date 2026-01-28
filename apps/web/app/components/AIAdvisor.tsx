"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";

interface AdvisorData {
  sentiment: string;
  score: number;
  title: string;
  message: string;
  rsi: number;
  ema_20: number;
  trend: string;
}

export default function AIAdvisor({ ticker }: { ticker: string }) {
  const [insight, setInsight] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsight();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stock_insights",
          filter: `symbol=eq.${ticker}`,
        },
        (payload) => {
          setInsight(payload.new as AdvisorData);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticker]);

  async function fetchInsight() {
    setLoading(true);
    const { data } = await supabase
      .from("stock_insights")
      .select("*")
      .eq("symbol", ticker)
      .single();

    if (data) setInsight(data);
    setLoading(false);
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "STRONG BUY":
        return "text-emerald-400";
      case "BUY":
        return "text-emerald-500";
      case "STRONG SELL":
        return "text-rose-500";
      case "SELL":
        return "text-rose-400";
      default:
        return "text-[#D4AF37]"; // Gold for Neutral
    }
  };

  const getBorderColor = (sentiment: string) => {
    switch (sentiment) {
      case "STRONG BUY":
        return "border-emerald-500";
      case "STRONG SELL":
        return "border-rose-500";
      default:
        return "border-[#D4AF37]";
    }
  };

  if (loading)
    return (
      <div className="w-full bg-[#1A1D23]/90 border border-[#D4AF37]/30 p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-md animate-pulse">
        <Sparkles className="text-[#D4AF37] animate-spin-slow" size={24} />
        <span className="text-[#A98E4B] font-serif text-sm tracking-widest italic">
          Requesting Concierge Assessment...
        </span>
      </div>
    );

  if (!insight)
    return (
      <div className="w-full bg-[#1A1D23]/90 border border-[#D4AF37]/30 p-6 flex items-center justify-center gap-3 backdrop-blur-md">
        <AlertCircle className="text-[#A98E4B]" />
        <span className="text-[#F5F5DC] font-serif">
          Assessment data currently unavailable for {ticker}.
        </span>
      </div>
    );

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#1A1D23] to-[#0F1115] border-l-4 ${getBorderColor(insight.sentiment)} border-y border-r border-[#D4AF37]/20 p-6 shadow-2xl relative overflow-hidden group`}
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={100} className="text-[#D4AF37]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        {/* Left: Message */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-[#D4AF37] fill-[#D4AF37]" size={18} />
            <h3 className="text-[#D4AF37] font-serif font-bold tracking-wide text-lg">
              Raffles Concierge
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest uppercase">
              AI Driven
            </span>
          </div>

          <h4 className="text-[#F5F5DC] font-bold text-xl mb-1 mt-3">
            {insight.title}
          </h4>
          <p className="text-[#F5F5DC]/80 font-body text-sm leading-relaxed max-w-2xl">
            "{insight.message}"
          </p>

          <div className="mt-4 flex gap-4 text-xs font-mono text-[#A98E4B]">
            <span className="flex items-center gap-1">
              RSI: <b className="text-[#F5F5DC]">{insight.rsi}</b>
            </span>
            <span className="flex items-center gap-1">
              Trend:{" "}
              <b
                className={
                  insight.trend === "Bullish"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                {insight.trend}
              </b>
            </span>
          </div>
        </div>

        {/* Right: Verdict */}
        <div className="flex flex-col items-end min-w-[150px] border-l border-[#D4AF37]/10 pl-6">
          <span className="text-[#A98E4B] text-[10px] uppercase tracking-[0.3em] mb-1">
            FINAL VERDICT
          </span>
          <span
            className={`text-2xl md:text-3xl font-serif font-black tracking-tight ${getSentimentColor(insight.sentiment)} drop-shadow-sm`}
          >
            {insight.sentiment}
          </span>
          <div className="mt-2 w-full bg-[#0F1115] h-1.5 rounded-full overflow-hidden border border-[#A98E4B]/20">
            <div
              className={`h-full ${getSentimentColor(insight.sentiment).replace("text-", "bg-")}`}
              style={{ width: `${insight.score}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-[#A98E4B] mt-1 font-mono">
            Confidence: {insight.score}%
          </span>
        </div>
      </div>
    </div>
  );
}
