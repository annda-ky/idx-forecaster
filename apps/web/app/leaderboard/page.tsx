"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Medal, Crown, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    // Ambil user saat ini untuk highlight
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && user.email) setCurrentUserEmail(user.email);

    // Ambil data dari VIEW yang kita buat tadi
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(10); // Top 10 Sultan

    if (data) setLeaders(data);
    setLoading(false);
  }

  // Fungsi helper untuk ikon ranking
  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <Crown
          size={24}
          className="text-yellow-500 fill-yellow-500 animate-bounce"
        />
      );
    if (rank === 2)
      return <Medal size={24} className="text-slate-400 fill-slate-400" />;
    if (rank === 3)
      return <Medal size={24} className="text-amber-600 fill-amber-600" />;
    return (
      <span className="text-slate-500 font-bold w-6 text-center">#{rank}</span>
    );
  };

  // Fungsi helper untuk warna Tier
  const getTierStyle = (tier: string) => {
    if (tier === "WHALE")
      return "bg-purple-100 text-purple-600 border-purple-200";
    if (tier === "PRO") return "bg-blue-100 text-blue-600 border-blue-200";
    return "bg-slate-100 text-slate-500 border-slate-200";
  };

  return (
    <div className="min-h-screen p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-[#A98E4B] hover:text-[#D4AF37] flex items-center gap-2 mb-6 transition-colors font-medium tracking-wide"
        >
          <ArrowLeft size={20} /> Kembali ke Dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif text-[#D4AF37] mb-2 tracking-tight drop-shadow-md">
            Top Trader Leaderboard
          </h1>
          <p className="text-[#A98E4B] tracking-widest text-sm uppercase">
            Peringkat investor dengan aset tertinggi (Real-time Valuation)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-[#D4AF37] font-serif italic flex flex-col items-center gap-2">
            <Trophy className="animate-bounce" />
            Menghitung kekayaan aset...
          </div>
        ) : (
          <div className="bg-[#1A1D23]/80 rounded-none overflow-hidden shadow-2xl border border-[#D4AF37]/30 relative backdrop-blur-md">
            {/* Hiasan background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80"></div>

            <table className="w-full">
              <thead className="bg-black/40 text-[#A98E4B] text-xs uppercase tracking-[0.2em] font-semibold border-b border-[#D4AF37]/20">
                <tr>
                  <th className="p-6 text-left w-24">Rank</th>
                  <th className="p-6 text-left">Trader</th>
                  <th className="p-6 text-center">Tier</th>
                  <th className="p-6 text-right">Net Worth (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {leaders.map((leader) => (
                  <tr
                    key={leader.rank}
                    className={`
                      group transition-all hover:bg-[#D4AF37]/5
                      ${leader.email === currentUserEmail ? "bg-[#D4AF37]/10 border-l-2 border-[#D4AF37]" : "border-l-2 border-transparent"}
                    `}
                  >
                    <td className="p-6">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full shadow-inner transition-transform group-hover:scale-110 ${leader.rank <= 3 ? "bg-[#0F1115] border border-[#D4AF37]/30" : "bg-transparent"}`}
                      >
                        {getRankIcon(leader.rank)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold text-lg font-serif tracking-wide ${leader.email === currentUserEmail ? "text-[#D4AF37]" : "text-[#F5F5DC]"}`}
                        >
                          {leader.email.split("@")[0]}{" "}
                        </span>
                        {leader.email === currentUserEmail && (
                          <span className="text-xs text-[#A98E4B] font-medium tracking-wider uppercase">
                            It's You!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-bold border tracking-wider ${getTierStyle(leader.tier)}`}
                      >
                        {leader.tier}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-mono text-xl font-bold text-[#D4AF37] tracking-tight drop-shadow-sm">
                        Rp{leader.net_worth.toLocaleString("id-ID")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-[#A98E4B]">
          <div className="p-4 bg-black/40 rounded-none border border-[#A98E4B]/30 shadow-sm backdrop-blur-sm">
            <Shield className="mx-auto mb-2 text-purple-400" size={20} />
            <strong className="text-purple-400 block mb-1 tracking-widest">
              WHALE
            </strong>
            Assets &gt; Rp 500 Juta
          </div>
          <div className="p-4 bg-black/40 rounded-none border border-[#A98E4B]/30 shadow-sm backdrop-blur-sm">
            <Shield className="mx-auto mb-2 text-[#D4AF37]" size={20} />
            <strong className="text-[#D4AF37] block mb-1 tracking-widest">
              PRO
            </strong>
            Assets &gt; Rp 100 Juta
          </div>
          <div className="p-4 bg-black/40 rounded-none border border-[#A98E4B]/30 shadow-sm backdrop-blur-sm">
            <Shield className="mx-auto mb-2 text-slate-500" size={20} />
            <strong className="text-slate-500 block mb-1 tracking-widest">
              ROOKIE
            </strong>
            Starter Trader
          </div>
        </div>
      </div>
    </div>
  );
}
