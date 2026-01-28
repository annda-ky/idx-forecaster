"use client";

import { useEffect, useState } from "react";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentGaugeProps {
  data: any[];
}

export default function SentimentGauge({ data }: SentimentGaugeProps) {
  const [score, setScore] = useState(50);
  const [sentiment, setSentiment] = useState("NEUTRAL");

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Ambil data terakhir yang valid (bukan forecast)
    // Forecast biasanya 'close' nya null atau 'actual' nya null di chart logic kita
    const latestHistory = data.findLast(
      (d) => d.close !== null && d.rsi !== null,
    );

    if (!latestHistory) return;

    calculateSentiment(latestHistory);
  }, [data]);

  const calculateSentiment = (marketData: any) => {
    const { close, sma, ema, rsi } = marketData;
    let tempScore = 50; // Start Neutral

    // 1. Trend Analysis (Price vs EMA20) - Bobot 40%
    if (ema) {
      if (close > ema * 1.01)
        tempScore += 20; // Strong Uptrend
      else if (close > ema)
        tempScore += 10; // Weak Uptrend
      else if (close < ema * 0.99)
        tempScore -= 20; // Strong Downtrend
      else tempScore -= 10; // Weak Downtrend
    }

    // 2. Momentum Analysis (RSI) - Bobot 30%
    if (rsi) {
      if (rsi < 30)
        tempScore += 15; // Oversold (Potential Buy)
      else if (rsi > 70)
        tempScore -= 15; // Overbought (Potential Sell)
      else if (rsi > 50)
        tempScore += 5; // Bullish Momentum
      else tempScore -= 5; // Bearish Momentum
    }

    // 3. SMA Filter (Longer Term Filter) - Bobot 30%
    if (sma) {
      if (close > sma) tempScore += 15;
      else tempScore -= 15;
    }

    // Clamp score 0-100
    const finalScore = Math.max(0, Math.min(100, tempScore));
    setScore(finalScore);

    // Determine Label
    if (finalScore >= 75) setSentiment("STRONG BUY");
    else if (finalScore >= 60) setSentiment("BUY");
    else if (finalScore <= 25) setSentiment("STRONG SELL");
    else if (finalScore <= 40) setSentiment("SELL");
    else setSentiment("NEUTRAL");
  };

  const getSentimentColor = () => {
    if (score >= 60) return "text-emerald-500";
    if (score <= 40) return "text-rose-500";
    return "text-slate-500";
  };

  const getSentimentBg = () => {
    if (score >= 60) return "bg-emerald-500";
    if (score <= 40) return "bg-rose-500";
    return "bg-slate-500";
  };

  const getIcon = () => {
    if (score >= 60)
      return <TrendingUp size={20} className={getSentimentColor()} />;
    if (score <= 40)
      return <TrendingDown size={20} className={getSentimentColor()} />;
    return <Minus size={20} className={getSentimentColor()} />;
  };

  return (
    <div className="flex items-center gap-4 bg-[#0F1115]/50 p-2.5 rounded-lg border border-[#D4AF37]/30 shadow-sm backdrop-blur-md">
      {/* Gauge Visual */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-[#2C2C2C]"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={126} // 2 * PI * 20
            strokeDashoffset={126 - (126 * score) / 100}
            className={`transition-all duration-1000 ease-out ${getSentimentColor()}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Gauge size={14} className="text-[#A98E4B]" />
        </div>
      </div>

      {/* Text Info */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-[#A98E4B] tracking-wider">
          AI Sentiment
        </span>
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span
            className={`font-bold font-mono text-sm ${getSentimentColor()}`}
          >
            {sentiment}
          </span>
        </div>
      </div>
    </div>
  );
}
