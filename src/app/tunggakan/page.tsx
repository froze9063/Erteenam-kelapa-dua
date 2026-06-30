"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  AlertTriangle,
  MapPin,
  ArrowLeft,
  ChevronDown,
  Wallet,
  Search,
} from "lucide-react";

interface Tunggakan {
  id: string;
  nama: string;
  alamat: string;
  totalTunggakan: number;
  jumlahBulan: number;
  tahun: number;
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`}></div>
);

function TunggakanContent() {
  const searchParams = useSearchParams();
  const START_YEAR = 2026;

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = START_YEAR; y <= currentYear; y++) {
      years.push(y);
    }
    return years.reverse();
  }, []);

  const initialTahun = Number(searchParams.get("tahun")) || availableYears[0];

  const [tahun, setTahun] = useState(initialTahun);
  const [listTunggakan, setListTunggakan] = useState<Tunggakan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, "tunggakan"),
      where("tahun", "==", tahun),
      orderBy("totalTunggakan", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setListTunggakan(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Tunggakan),
        );
        setIsLoading(false);
      },
      (err) => {
        console.error("Gagal ambil data tunggakan:", err);
        setIsLoading(false);
      },
    );
    return () => unsub();
  }, [tahun]);

  const filteredData = listTunggakan.filter(
    (w) =>
      w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.alamat.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalKeseluruhan = listTunggakan.reduce(
    (sum, w) => sum + (w.totalTunggakan || 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-16 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 relative z-10">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
              <AlertTriangle size={28} className="text-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Tunggakan Warga
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                Daftar lengkap iuran kas yang belum dibayar
              </p>
            </div>
          </div>

          {/* Dropdown Tahun */}
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl">
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="bg-transparent text-sm font-black uppercase tracking-widest py-3 pl-5 pr-10 outline-none appearance-none cursor-pointer text-slate-200"
            >
              {availableYears.map((y) => (
                <option
                  key={y}
                  value={y}
                  className="text-slate-900 font-sans font-bold"
                >
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-4 text-rose-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1A1D24] border border-white/5 rounded-[2rem] p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <Wallet size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Total Tunggakan
              </p>
              {isLoading ? (
                <Skeleton className="h-6 w-28 mt-1" />
              ) : (
                <p className="text-lg font-black text-rose-400">
                  Rp{totalKeseluruhan.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
          <div className="bg-[#1A1D24] border border-white/5 rounded-[2rem] p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <AlertTriangle size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Jumlah Warga
              </p>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <p className="text-lg font-black text-white">
                  {listTunggakan.length} Orang
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau alamat..."
            className="w-full bg-[#1A1D24] border border-white/5 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-slate-600"
          />
        </div>

        {/* List Lengkap */}
        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : filteredData.length > 0 ? (
            filteredData.map((warga) => (
              <div
                key={warga.id}
                className="flex items-center justify-between p-5 bg-[#1A1D24] border border-white/5 rounded-[2rem] hover:border-rose-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-orange-600 flex items-center justify-center font-black text-sm shrink-0">
                    {warga.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm text-white">
                      {warga.nama}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                      <MapPin size={11} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">
                        {warga.alamat}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-base text-rose-400">
                    Rp{(warga.totalTunggakan || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {warga.jumlahBulan} bulan
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                {searchTerm ? "Warga tidak ditemukan" : "Tidak ada tunggakan"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TunggakanPage() {
  return (
    <Suspense fallback={null}>
      <TunggakanContent />
    </Suspense>
  );
}
