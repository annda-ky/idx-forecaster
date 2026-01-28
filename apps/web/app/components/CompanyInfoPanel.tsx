"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Info, Loader2 } from "lucide-react";

export default function CompanyInfoPanel({ ticker }: { ticker: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("symbol", ticker)
        .single();
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [ticker]);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center text-slate-500 animate-pulse font-serif italic gap-2">
        <Loader2 className="animate-spin" size={16} /> Curating company
        insights...
      </div>
    );

  if (!profile)
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Info size={32} className="mb-3 text-slate-400" />
        <p>Company profile data not available yet.</p>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-8 font-body">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-serif font-bold text-[#D4AF37] mb-2 tracking-wide">
          {profile.company_name}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-black/40 border border-[#A98E4B]/40 text-xs text-[#F5F5DC] shadow-sm uppercase tracking-wider">
            {profile.sector}
          </span>
          <span className="px-3 py-1 bg-black/40 border border-[#A98E4B]/40 text-xs text-[#F5F5DC] shadow-sm uppercase tracking-wider">
            {profile.industry}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1D23]/80 border border-[#A98E4B]/20 p-4 border-l-2 border-l-[#D4AF37] shadow-sm">
          <p className="text-xs text-[#A98E4B] uppercase tracking-widest mb-1">
            Market Cap
          </p>
          <p className="text-lg font-mono font-semibold text-[#F5F5DC]">
            {(profile.market_cap / 1_000_000_000_000).toFixed(2)}T
          </p>
        </div>
        <div className="bg-[#1A1D23]/80 border border-[#A98E4B]/20 p-4 shadow-sm">
          <p className="text-xs text-[#A98E4B] uppercase tracking-widest mb-1">
            P/E Ratio
          </p>
          <p className="text-lg font-mono font-semibold text-[#F5F5DC]">
            {profile.pe_ratio?.toFixed(2) || "N/A"}
          </p>
        </div>
        <div className="bg-[#1A1D23]/80 border border-[#A98E4B]/20 p-4 shadow-sm">
          <p className="text-xs text-[#A98E4B] uppercase tracking-widest mb-1">
            Dividend Yield
          </p>
          <p className="text-lg font-mono font-semibold text-emerald-400">
            {(profile.dividend_yield * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <h4 className="font-serif text-lg text-[#D4AF37] border-b border-[#A98E4B]/30 pb-2">
          About Company
        </h4>
        <p className="text-sm text-[#F5F5DC]/80 leading-relaxed text-justify">
          {profile.description}
        </p>
      </div>
    </div>
  );
}
