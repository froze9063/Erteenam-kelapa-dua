"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  ArrowLeft,
  Search,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KasFullListPage() {
  const router = useRouter();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth();

  const monthOptions = Array.from({ length: currentMonthNum + 1 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    const value = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("id-ID", {
      month: "short",
      year: "numeric",
    });
    return { value, label };
  }).reverse(); // Paling baru di atas

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [activeTab, setActiveTab] = useState<"semua" | "sudah" | "belum">(
    "semua",
  );
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    const kasRef = collection(db, "kas");

    const q = query(
      kasRef,
      where("date_month", "==", selectedMonth),
      orderBy("nama", "asc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setAllData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsub;
  }, [selectedMonth]);

  const filteredData = allData.filter((warga) => {
    const matchSearch = warga.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "sudah") return matchSearch && warga.status === 1;
    if (activeTab === "belum") return matchSearch && warga.status === 0;
    return matchSearch;
  });

  const totalSudah = allData.filter((d) => d.status === 1).length;
  const totalBelum = allData.filter((d) => d.status === 0).length;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white font-sans selection:bg-indigo-500/30">
      <div className="fixed top-[-5%] right-[-5%] w-[250px] h-[250px] bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0F1115]/90 backdrop-blur-xl border-b border-white/5 shadow-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white/5 active:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-indigo-400 font-bold text-[9px] tracking-widest uppercase">
                Rekapitulasi
              </p>
              <h1 className="text-lg font-black tracking-tighter italic uppercase leading-none">
                Iuran <span className="opacity-50">Warga</span>
              </h1>
            </div>
          </div>

          <div className="relative group shrink-0">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <CalendarDays size={14} className="text-indigo-400" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-[#1E2028] border border-white/10 pl-9 pr-8 py-2 rounded-xl text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1E2028] border border-emerald-500/20 p-4 rounded-2xl shadow-lg">
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
              Sudah Bayar
            </p>
            <div className="flex items-end gap-1">
              <h3 className="text-2xl font-black text-emerald-500 leading-none">
                {totalSudah}
              </h3>
              <span className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase">
                Warga
              </span>
            </div>
          </div>
          <div className="bg-[#1E2028] border border-rose-500/20 p-4 rounded-2xl shadow-lg">
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">
              Belum Bayar
            </p>
            <div className="flex items-end gap-1">
              <h3 className="text-2xl font-black text-rose-500 leading-none">
                {totalBelum}
              </h3>
              <span className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase">
                Warga
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <Search
                className="text-slate-500 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
            </div>
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E2028] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-lg"
            />
          </div>

          <div className="flex p-1 bg-[#1E2028] rounded-xl border border-white/5">
            {["semua", "sudah", "belum"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? tab === "sudah"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : tab === "belum"
                        ? "bg-rose-600 text-white shadow-lg"
                        : "bg-white text-black shadow-lg"
                    : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-20 opacity-30">
              <Loader2 className="animate-spin mb-4 text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Sinkronisasi...
              </p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((warga) => (
              <div
                key={warga.id}
                className="bg-[#1E2028] border border-white/5 p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${warga.status === 1 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}
                  >
                    {warga.nama.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[14px] text-slate-200 leading-snug uppercase tracking-tight break-words">
                      {warga.nama}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                      <MapPin size={10} className="shrink-0" />
                      <p className="text-[10px] font-medium break-words leading-tight">
                        {warga.alamat || "Alamat tidak tersedia"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 ml-3">
                  {warga.status === 1 ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 size={22} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-500/50 uppercase mt-1">
                        Lunas
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <XCircle size={22} className="text-white/5" />
                      <span className="text-[8px] font-black text-rose-500/50 uppercase mt-1">
                        Belum
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1E2028]/30 rounded-3xl border border-dashed border-white/10">
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
