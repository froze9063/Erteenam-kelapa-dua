"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { AlertTriangle, MapPin, ArrowRight, ChevronDown } from "lucide-react";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`}></div>
);

export default function TunggakanWarga() {
  // Tahun mulai data RT — samakan dengan startYear di page.tsx
  const START_YEAR = 2026;

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = START_YEAR; y <= currentYear; y++) {
      years.push(y);
    }
    return years.reverse(); // tahun terbaru di atas
  }, []);

  const [tahun, setTahun] = useState(availableYears[0]);
  const [listTunggakan, setListTunggakan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setListTunggakan(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
      },
      (err) => {
        console.error("Gagal ambil data tunggakan:", err);
        setIsLoading(false);
      },
    );
    return () => unsub();
  }, [tahun]);

  const displayData = listTunggakan.slice(0, 3);

  return (
    <div className="bg-[#1A1D24] border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
          <AlertTriangle size={18} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
          Tunggakan Warga
        </h3>

        <div className="flex-1" />

        {/* Dropdown Tahun */}
        <div className="relative flex items-center bg-white/5 border border-white/5 rounded-xl">
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest py-2 pl-4 pr-8 outline-none appearance-none cursor-pointer text-slate-300"
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
            size={12}
            className="absolute right-3 text-rose-400 pointer-events-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 mb-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : displayData.length > 0 ? (
          displayData.map((warga) => (
            <div
              key={warga.id}
              className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-200">
                  {warga.nama}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mt-1">
                  <MapPin size={9} />
                  {warga.alamat}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-black text-sm whitespace-nowrap text-rose-400">
                  Rp{(warga.totalTunggakan || 0).toLocaleString("id-ID")}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {warga.jumlahBulan} bulan
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 opacity-20 text-[10px] font-black border border-dashed border-white/10 rounded-2xl">
            DATA KOSONG
          </div>
        )}
      </div>

      {/* Lihat Semua */}
      {!isLoading && listTunggakan.length > 0 && (
        <Link
          href={`/tunggakan?tahun=${tahun}`}
          className="group flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
            Lihat Semua
          </span>
          <ArrowRight
            size={14}
            className="text-rose-500 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}
