"use client";

import { useState } from "react";
import TradingPanel from "./TradingPanel";
import WatchlistPanel from "./WatchlistPanel";
import CompanyInfoPanel from "./CompanyInfoPanel";

interface TabbedPanelProps {
  data: any[];
  ticker: string;
  currentPrice: number;
  onSelectTicker: (ticker: string) => void;
}

type TabType = "TRADE" | "WATCHLIST" | "INFO";

export default function TabbedPanel({
  data,
  ticker,
  currentPrice,
  onSelectTicker,
}: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("TRADE");

  const TabButton = ({
    name,
    label,
    activeColor,
  }: {
    name: TabType;
    label: string;
    activeColor: string;
  }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-wider transition-all duration-300 relative overflow-hidden group ${
        activeTab === name
          ? "text-white"
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/40"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {/* Active Indicator Bottom */}
      {activeTab === name && (
        <span
          className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${activeColor}`}
        />
      )}
      {/* Active Glow Background */}
      {activeTab === name && (
        <span className={`absolute inset-0 bg-slate-700/30 opacity-100`} />
      )}
    </button>
  );

  return (
    <div className="lg:col-span-1 bg-glass rounded-2xl overflow-hidden shadow-lg flex flex-col h-[650px] border border-slate-700/50">
      {/* 3 TABS HEADER */}
      <div className="flex border-b border-slate-700 bg-slate-800/60 backdrop-blur-sm">
        <TabButton
          name="TRADE"
          label="TRADING"
          activeColor="from-blue-400 to-blue-300"
        />
        <TabButton
          name="WATCHLIST"
          label="WATCHLIST"
          activeColor="from-amber-400 to-amber-300"
        />
        <TabButton
          name="INFO"
          label="COMPANY"
          activeColor="from-purple-400 to-purple-300"
        />
      </div>

      {/* TAB CONTENT */}
      <div className="p-1 flex-1 overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>

        {activeTab === "TRADE" &&
          (data.length > 0 ? (
            <div className="h-full p-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TradingPanel ticker={ticker} currentPrice={currentPrice} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p>Select a valid stock to trade</p>
            </div>
          ))}

        {activeTab === "WATCHLIST" && (
          <div className="h-full p-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <WatchlistPanel
              currentTicker={ticker}
              onSelectTicker={onSelectTicker}
            />
          </div>
        )}

        {activeTab === "INFO" && (
          <div className="h-full p-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CompanyInfoPanel ticker={ticker} />
          </div>
        )}
      </div>
    </div>
  );
}
