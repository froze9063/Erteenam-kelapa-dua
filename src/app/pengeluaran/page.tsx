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
  TrendingDown,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

export default function SemuaPengeluaran() {
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
  const [listPengeluaran, setListPengeluaran] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsFetching(true);
    const qOut = query(
      collection(db, "pengeluaran"),
      where("date_month", "==", bulan),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(qOut, (snap) => {
      setListPengeluaran(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsFetching(false);
    });

    return () => unsub();
  }, [bulan]);

  const filteredData = listPengeluaran.filter((item) =>
    (item.name || item.description || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalKeluar = filteredData.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#0F1115] text-white font-sans selection:bg-rose-500/30">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0F1115]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-rose-400 font-bold text-[10px] tracking-widest mb-0.5">
                laporan bulanan
              </p>
              <h1 className="text-2xl font-black tracking-tighter italic uppercase">
                pengeluaran <span className="text-outline-white">kas</span>
              </h1>
            </div>
          </div>

          <div className="bg-[#1E2028] border border-white/10 p-1.5 rounded-2xl flex items-center shadow-inner">
            <div className="p-2 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/20">
              <Calendar size={18} />
            </div>
            <div className="relative flex items-center">
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="bg-transparent text-sm font-bold py-1 pl-4 pr-10 outline-none appearance-none cursor-pointer"
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
                size={16}
                className="absolute right-3 text-rose-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 relative z-10">
        {/* STATS & SEARCH SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Total Card */}
          <div className="lg:col-span-5 bg-[#1E2028] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 blur-[50px] rounded-full -mr-10 -mt-10"></div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-rose-400 mb-2 uppercase">
              total keluar bulan ini
            </p>
            <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Rp{totalKeluar.toLocaleString("id-ID")}
            </h2>
            <div className="mt-4 flex items-center gap-2 text-slate-500">
              <TrendingDown size={14} />
              <span className="text-[10px] font-medium italic">
                Berdasarkan filter pencarian
              </span>
            </div>
          </div>

          {/* Search Card */}
          <div className="lg:col-span-7 bg-[#1E2028] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 mb-4 uppercase">
              cari transaksi
            </p>
            <div className="relative flex items-center group">
              <div className="absolute left-5 flex items-center justify-center pointer-events-none">
                <Search
                  className="text-slate-500 group-focus-within:text-rose-500 transition-colors"
                  size={20}
                />
              </div>
              <input
                type="text"
                placeholder="Cari kebutuhan, alat, atau lainnya..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-base font-bold outline-none focus:border-rose-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 placeholder:font-medium"
              />
            </div>
          </div>
        </div>

        {/* DATA LIST */}
        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
              rincian pengeluaran
            </span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          {isFetching ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 w-full bg-[#1E2028] animate-pulse rounded-[2rem] border border-white/5"
              />
            ))
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 bg-[#1E2028] border border-white/5 rounded-[2.5rem] hover:border-rose-500/30 transition-all group hover:bg-[#23262f] shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg tracking-tight text-slate-200 mb-1">
                      {item.name || item.description || "pengeluaran"}
                    </h4>
                    <div className="flex items-center gap-3 opacity-50">
                      <span className="text-xs font-medium text-slate-400">
                        {item.date}
                      </span>
                      {item.category && (
                        <>
                          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                          <span className="text-xs font-medium text-slate-400">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl md:text-2xl font-black text-rose-400 tracking-tighter">
                    -Rp{item.amount?.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-[#1E2028] rounded-[3rem] border border-dashed border-white/10">
              <div className="p-6 bg-white/5 rounded-full mb-6 text-rose-500/20">
                <XCircle size={48} strokeWidth={1} />
              </div>
              <p className="text-xs font-bold tracking-widest opacity-30 uppercase">
                Belum ada data pengeluaran
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
