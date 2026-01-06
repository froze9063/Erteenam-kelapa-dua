"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "../../lib/firebase";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  PlusCircle,
  Search,
  Wallet,
  CheckCircle2,
} from "lucide-react";

export default function SemuaPemasukan() {
  const availableMonths = useMemo(() => {
    const startYear = 2026;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const months = [];
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    for (let y = startYear; y <= currentYear; y++) {
      const mStart = y === startYear ? 0 : 0;
      const mEnd = y === currentYear ? currentMonth : 11;
      for (let m = mStart; m <= mEnd; m++) {
        const val = `${y}-${(m + 1).toString().padStart(2, "0")}`;
        months.push({ value: val, label: `${monthNames[m]} ${y}` });
      }
    }
    return months.reverse();
  }, []);

  const [bulan, setBulan] = useState(availableMonths[0]?.value || "2026-01");
  const [listPemasukan, setListPemasukan] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsFetching(true);
    const qIn = query(
      collection(db, "pemasukan"),
      where("date_month", "==", bulan),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(qIn, (snap) => {
      setListPemasukan(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsFetching(false);
    });

    return () => unsub();
  }, [bulan]);

  const filteredData = listPemasukan.filter((item) =>
    (item.name || item.description || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalMasuk = filteredData.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#0F1115] text-white font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed top-[-5%] right-[-10%] w-[300px] h-[300px] bg-emerald-600/10 blur-[80px] rounded-full pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0F1115]/90 backdrop-blur-xl border-b border-white/5 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 bg-white/5 active:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-emerald-400 font-bold text-[9px] tracking-widest uppercase">
                Laporan
              </p>
              <h1 className="text-lg font-black tracking-tighter italic uppercase leading-none">
                Pemasukan <span className="opacity-50">Kas</span>
              </h1>
            </div>
          </div>

          <div className="bg-[#1E2028] border border-white/10 p-1 rounded-xl flex items-center shrink-0">
            <div className="relative flex items-center">
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="bg-transparent text-[13px] font-bold py-1.5 pl-3 pr-8 outline-none appearance-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                    className="text-slate-900"
                  >
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 text-emerald-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
        {/* STATS & SEARCH SECTION */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="bg-[#1E2028] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 blur-[40px] rounded-full -mr-8 -mt-8"></div>
            <p className="text-[10px] font-bold tracking-[0.1em] text-emerald-400/80 mb-1 uppercase">
              Total Bulan Ini
            </p>
            <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Rp{totalMasuk.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <Search
                className="text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={18}
              />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E2028] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 shadow-lg"
            />
          </div>
        </div>

        {/* DATA LIST */}
        <div className="space-y-3 pb-10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase whitespace-nowrap">
              Rincian Transaksi
            </span>
            <div className="h-[1px] w-full bg-white/5"></div>
          </div>

          {isFetching ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-full bg-[#1E2028]/50 animate-pulse rounded-2xl border border-white/5"
              />
            ))
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 bg-[#1E2028] border border-white/5 rounded-2xl active:scale-[0.99] transition-all shadow-md gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mt-0.5">
                    <Wallet size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-[15px] tracking-tight text-slate-200 leading-snug break-words">
                      {item.name || item.description || "Pemasukan"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                        {item.date}
                      </span>
                      {item.category && (
                        <>
                          <div className="hidden xs:block w-1 h-1 bg-slate-700 rounded-full"></div>
                          <span className="text-[10px] font-medium text-slate-500 break-words">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-[15px] font-black text-emerald-400 tracking-tighter whitespace-nowrap">
                    +Rp{item.amount?.toLocaleString("id-ID")}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-emerald-500/40">
                    <CheckCircle2 size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1E2028]/30 rounded-3xl border border-dashed border-white/10">
              <PlusCircle
                size={40}
                strokeWidth={1}
                className="text-white/10 mb-3"
              />
              <p className="text-[11px] font-bold tracking-widest opacity-30 uppercase text-center">
                Data tidak ditemukan
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
