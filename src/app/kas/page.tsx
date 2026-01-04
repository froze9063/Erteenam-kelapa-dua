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
  Users,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KasFullListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"semua" | "sudah" | "belum">(
    "semua"
  );
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    const kasRef = collection(db, "kas");
    // Ambil semua data kas untuk bulan Januari 2026
    const q = query(
      kasRef,
      where("date_month", "==", "2026-01"),
      orderBy("nama", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setAllData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsub;
  }, []);

  // Filter Logika
  const filteredData = allData.filter((warga) => {
    const matchSearch = warga.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "sudah") return matchSearch && warga.status === 1;
    if (activeTab === "belum") return matchSearch && warga.status === 0;
    return matchSearch;
  });

  // Hitung Quick Stats
  const totalSudah = allData.filter((d) => d.status === 1).length;
  const totalBelum = allData.filter((d) => d.status === 0).length;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/5 rounded-2xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
              Rekapitulasi Iuran
            </h1>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} className="text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-tighter">
                Januari 2026
              </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {/* STATS MINI CARDS */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-[2rem]">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              Sudah Bayar
            </p>
            <h3 className="text-2xl font-black text-emerald-500">
              {totalSudah}{" "}
              <span className="text-[10px] text-emerald-500/50">Warga</span>
            </h3>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-[2rem]">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">
              Belum Bayar
            </p>
            <h3 className="text-2xl font-black text-rose-500">
              {totalBelum}{" "}
              <span className="text-[10px] text-rose-500/50">Warga</span>
            </h3>
          </div>
        </div>

        {/* SEARCH & TABS */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1D24] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-[#1A1D24] rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "semua" ? "bg-white text-black" : "text-slate-500"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("sudah")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "sudah"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-500"
              }`}
            >
              Sudah
            </button>
            <button
              onClick={() => setActiveTab("belum")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "belum"
                  ? "bg-rose-600 text-white"
                  : "text-slate-500"
              }`}
            >
              Belum
            </button>
          </div>
        </div>

        {/* LIST DATA */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-20 opacity-30">
              <Loader2 className="animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Sinkronisasi...
              </p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((warga) => (
              <div
                key={warga.id}
                className="bg-[#1A1D24] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      warga.status === 1
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {warga.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                      {warga.nama}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                      <MapPin size={10} />
                      <p className="text-[10px] font-bold">{warga.alamat}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {warga.status === 1 ? (
                    <div className="flex flex-col items-end">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-500/50 uppercase mt-1">
                        LUNAS
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <XCircle size={24} className="text-rose-500/20" />
                      <span className="text-[8px] font-black text-rose-500/50 uppercase mt-1">
                        BELUM
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Tidak ada data ditemukan
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
