"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "../lib/firebase";
import Link from "next/link";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  Calendar,
  User,
  Zap,
  ImageIcon,
  X,
  MapPin,
  Flame,
  Ambulance,
  Siren,
  TrendingDown,
  Wallet,
  Loader2,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  Copyright,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  PlusCircle,
  FileDown, // Tambahan untuk icon pemasukan
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- KONFIGURASI KEAMANAN ---
const BAD_WORDS = [
  "anjing",
  "anjir",
  "anjay",
  "anjrot",
  "anying",
  "nying",
  "babi",
  "b4bi",
  "bab1",
  "monyet",
  "monyong",
  "kampret",
  "keparat",
  "bedebah",
  "bangsat",
  "bangs4t",
  "brengsek",
  "brngsk",
  "bajingan",
  "baj1ngan",
  "sialan",
  "celaka",
  "laknat",
  "terkutuk",
  "setan",
  "iblis",
  "dajjal",
  "asu",
  "jancok",
  "jancuk",
  "jancu",
  "cuk",
  "cok",
  "pantek",
  "panteq",
  "pantat",
  "pukimak",
  "kimak",
  "makmu",
  "tai",
  "taik",
  "tahi",
  "tey",
  "mbahmu",
  "ndasmu",
  "kirik",
  "kirikmu",
  "bego",
  "begok",
  "bengak",
  "goblok",
  "goblog",
  "gblk",
  "tolol",
  "tulul",
  "idiot",
  "id10t",
  "dongo",
  "oon",
  "odgj",
  "bloon",
  "lemot",
  "bahlul",
  "sinting",
  "edan",
  "gila",
  "geblek",
  "pego",
  "kontol",
  "k0nt0l",
  "kntl",
  "konthol",
  "memek",
  "m3m3k",
  "mmk",
  "meki",
  "ngentot",
  "nentot",
  "ng3nt0t",
  "entot",
  "peler",
  "pler",
  "titit",
  "kontil",
  "itil",
  "pentil",
  "tempik",
  "tempek",
  "tetek",
  "toket",
  "tete",
  "pepek",
  "puki",
  "vagina",
  "penis",
  "lonte",
  "lonthe",
  "perek",
  "pereq",
  "jablay",
  "jablai",
  "pelacur",
  "psk",
  "sundal",
  "sundel",
  "bencong",
  "banci",
  "waria",
  "homo",
  "hom0",
  "lesbi",
  "lezbi",
  "lesbo",
  "gay",
  "gey",
  "kafir",
  "kapir",
  "komunis",
  "pk",
  "pki",
  "teroris",
  "radikal",
];

const filterText = (text: string) => {
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "****");
  });
  return filtered;
};

const pengurus = [
  {
    jabatan: "Ketua RT",
    nama: "Agus Ferianto",
    color: "from-violet-600 to-indigo-600",
  },
  {
    jabatan: "Wakil Ketua",
    nama: "Aulia Panji W",
    color: "from-blue-500 to-cyan-500",
  },
  {
    jabatan: "Sekretaris",
    nama: "Budiyono",
    color: "from-rose-500 to-orange-500",
  },
  { jabatan: "Bendahara", nama: "Aldi", color: "from-emerald-500 to-teal-500" },
];

const emergencyContacts = [
  {
    name: "Polisi",
    phone: "110",
    icon: <Siren size={20} />,
    color: "bg-red-500",
  },
  {
    name: "Ambulans",
    phone: "112",
    icon: <Ambulance size={20} />,
    color: "bg-blue-500",
  },
  {
    name: "Pemadam",
    phone: "112",
    icon: <Flame size={20} />,
    color: "bg-orange-500",
  },
];

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`}></div>
);

const exportToPDF = (
  title: string,
  data: any[],
  type: "in" | "out",
  monthLabel: string
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString("id-ID");

  // Judul Laporan
  doc.setFontSize(16);
  doc.text(`LAPORAN ${title.toUpperCase()}`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Periode: ${monthLabel} | Dicetak: ${dateStr}`, 14, 28);

  // Tabel Hanya: Name, Date, Amount
  const tableColumn = ["Nama", "Tanggal", "Nominal"];
  const tableRows = data.map((item) => [
    item.name || item.user || "Anonim",
    item.date || "-",
    `Rp${(item.amount || 0).toLocaleString("id-ID")}`,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: "striped",
    headStyles: {
      fillColor: type === "in" ? [16, 185, 129] : [225, 29, 72], // Hijau vs Merah
      fontStyle: "bold",
    },
    columnStyles: {
      2: { halign: "right" }, // Kolom Nominal rata kanan
    },
  });

  doc.save(`${title}_${monthLabel.replace(/\s+/g, "_")}.pdf`);
};

export default function PortalRT() {
  const [activeTab, setActiveTab] = useState<"timeline" | "laporan">(
    "timeline"
  );
  const availableMonths = useMemo(() => {
    const startYear = 2026;
    const startMonth = 0;
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
      const mStart = y === startYear ? startMonth : 0;
      const mEnd = y === currentYear ? currentMonth : 11;
      for (let m = mStart; m <= mEnd; m++) {
        const val = `${y}-${(m + 1).toString().padStart(2, "0")}`;
        months.push({ value: val, label: `${monthNames[m]} ${y}` });
      }
    }
    return months.reverse();
  }, []);

  const [bulan, setBulan] = useState(availableMonths[0]?.value || "2026-01");
  const [dataSaldo, setDataSaldo] = useState({
    saldo: 0,
    total_keluar: 0,
    total_masuk: 0,
    sudah_bayar: 0,
    belum_bayar: 0,
  });
  const [listTimeline, setListTimeline] = useState<any[]>([]);
  const [listPengeluaran, setListPengeluaran] = useState<any[]>([]);
  const [listPemasukan, setListPemasukan] = useState<any[]>([]);
  const [listAgenda, setListAgenda] = useState<any[]>([]);
  const [postText, setPostText] = useState("");
  const [posterName, setPosterName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [greeting, setGreeting] = useState("Halo");
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingPage(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsFetching(true);
    const docRef = doc(db, "saldo", bulan);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDataSaldo({
          saldo: data.saldo || 0,
          total_keluar: data.total_keluar || 0,
          total_masuk: data.total_masuk || 0,
          sudah_bayar: data.sudah_bayar || 0,
          belum_bayar: data.belum_bayar || 0,
        });
      } else {
        setDataSaldo({
          saldo: 0,
          total_keluar: 0,
          total_masuk: 0,
          sudah_bayar: 0,
          belum_bayar: 0,
        });
      }
      setIsFetching(false);
    });
  }, [bulan]);

  useEffect(() => {
    const qP = query(
      collection(db, "pengeluaran"),
      where("date_month", "==", bulan),
      orderBy("date", "desc")
    );
    const unsubP = onSnapshot(qP, (snap) =>
      setListPengeluaran(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const qIn = query(
      collection(db, "pemasukan"),
      where("date_month", "==", bulan),
      orderBy("date", "desc")
    );
    const unsubIn = onSnapshot(qIn, (snap) =>
      setListPemasukan(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const qA = query(
      collection(db, "agenda"),
      where("date_month", "==", bulan),
      orderBy("date", "asc")
    );
    const unsubA = onSnapshot(qA, (snap) =>
      setListAgenda(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubP();
      unsubIn();
      unsubA();
    };
  }, [bulan]);

  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) =>
      setListTimeline(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi");
    else if (hour < 18) setGreeting("Selamat Siang");
    else setGreeting("Selamat Malam");
  }, []);

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;
    const key = activeTab === "timeline" ? "last_post" : "last_report";
    const lastPost = localStorage.getItem(key);
    const now = Date.now();
    const COOLDOWN = 5 * 60 * 1000;
    if (lastPost && now - parseInt(lastPost) < COOLDOWN) {
      alert(`Mohon tunggu 5 menit, untuk menghindari spam.`);
      return;
    }
    const cleanContent = filterText(postText);
    const cleanName = filterText(posterName.trim() || "Warga");
    try {
      if (activeTab === "timeline") {
        await addDoc(collection(db, "timeline"), {
          user: cleanName,
          content: cleanContent,
          image: selectedImage,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "laporan"), {
          name: cleanName,
          description: cleanContent,
          image: selectedImage,
          date: new Date().toISOString().split("T")[0],
          date_month: new Date().toISOString().substring(0, 7),
          createdAt: serverTimestamp(),
        });
      }
      localStorage.setItem(key, now.toString());
      setPostText("");
      setPosterName("");
      setSelectedImage(null);
      alert("Berhasil dikirim!");
    } catch (err) {
      alert("Gagal mengirim.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setSelectedImage(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    }
  };

  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const selectedMonthLabel =
    availableMonths.find((m) => m.value === bulan)?.label || bulan;

  if (isLoadingPage) {
    return (
      <div className="fixed inset-0 bg-[#0F1115] flex flex-col items-center justify-center z-[200]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-4 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <button
        onClick={() => setShowPopup(true)}
        className="fixed bottom-10 right-6 z-[60] flex items-center justify-center bg-[#FFD700] text-black w-12 h-12 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border border-black/10 group"
      >
        <div className="relative">
          <Zap size={20} fill="currentColor" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#FFD700]"></span>
        </div>
      </button>

      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <img
            src={fullScreenImage}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            alt="Full view"
          />
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow Ungu di kiri atas */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full"></div>

        {/* Glow Biru di kanan tengah */}
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full"></div>

        {/* Glow Emerald di bawah */}
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 md:pt-24 pb-16 md:pb-24 px-4 md:px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-12 bg-indigo-500"></div>
              <span className="text-indigo-400 font-black text-xs tracking-[0.3em] uppercase">
                {greeting}, Portal RT.06
              </span>
            </div>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85]">
              MODERN <br />{" "}
              <span className="italic text-outline hover:text-white transition-all">
                TRANSPARAN
              </span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs md:text-sm">
              <MapPin size={16} className="text-indigo-500" />
              <span>Kelapa Dua Tangerang</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-3xl flex items-center w-full md:w-auto relative group transition-all hover:bg-white/10">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Calendar size={24} />
            </div>
            <div className="relative flex-1 md:flex-none flex items-center">
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="bg-transparent text-xl font-black py-2 pl-6 pr-12 outline-none appearance-none cursor-pointer w-full"
              >
                {availableMonths.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                    className="text-slate-900 font-sans font-bold"
                  >
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-4 text-indigo-400 pointer-events-none group-hover:translate-y-0.5 transition-transform"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-10 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-[#1E2028] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px] group">
            {/* Aksesori Dekoratif (Glow di dalam card) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-600/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-600/10 blur-[60px] rounded-full -ml-10 -mb-10"></div>

            {/* Tombol Detail Kas - Dibuat lebih elegan */}
            <Link
              href="/kas"
              className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl transition-all duration-300"
            >
              <span className="text-[11px] font-bold tracking-tight text-slate-200">
                Detail Kas
              </span>
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <ArrowUpRight
                  size={14}
                  className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </div>
            </Link>

            <div className="relative z-10 flex flex-col h-full">
              {/* Label Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Wallet size={18} className="text-indigo-400" />
                </div>
                <span className="text-xs font-bold tracking-[0.1em] text-indigo-300/80">
                  Total Saldo
                </span>
              </div>

              {/* Saldo Utama */}
              <div className="mb-auto">
                {isFetching ? (
                  <Skeleton className="h-16 w-3/4 mb-4" />
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                      Rp{dataSaldo.saldo?.toLocaleString("id-ID")}
                    </h2>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 ml-1 italic opacity-80">
                      *terakhir diperbarui pada bulan{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Statistik Grid - Lebih Rapi & Proper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
                {/* Pemasukan */}
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-[1.5rem] backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <PlusCircle size={14} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      pemasukan
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-black text-emerald-400">
                    +Rp{dataSaldo.total_masuk?.toLocaleString("id-ID") || 0}
                  </p>
                </div>

                {/* Pengeluaran */}
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-[1.5rem] backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                      <TrendingDown size={14} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      pengeluaran
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-black text-rose-400">
                    -Rp{dataSaldo.total_keluar?.toLocaleString("id-ID") || 0}
                  </p>
                </div>

                {/* Status Bayar (Warga) */}
                <div className="col-span-2 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-[1.5rem] flex items-center justify-around gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold text-indigo-300/60 uppercase tracking-tighter mb-1">
                      sudah bayar
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-lg font-black">
                        {dataSaldo.sudah_bayar}
                      </span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold text-indigo-300/60 uppercase tracking-tighter mb-1">
                      belum bayar
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-400" />
                      <span className="text-lg font-black">
                        {dataSaldo.belum_bayar}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            <EmergencyPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 order-1">
          <CompactTransactionList
            title="Pemasukan Terkini"
            data={listPemasukan}
            type="in"
            isLoading={isFetching}
            href="/pemasukan"
            monthLabel={selectedMonthLabel}
          />
          <CompactTransactionList
            title="Pengeluaran Terkini"
            data={listPengeluaran}
            type="out"
            isLoading={isFetching}
            href="/pengeluaran"
            monthLabel={selectedMonthLabel}
          />
        </div>

        <section className="mb-12 order-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-white/10"></div>
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">
              Pengurus RT.06
            </h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pengurus.map((p) => (
              <div
                key={p.jabatan}
                className="bg-[#1A1D24] border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/50 transition-all"
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}
                >
                  <User size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {p.jabatan}
                </p>
                <p className="font-black text-sm md:text-base leading-tight">
                  {p.nama}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 order-3">
          <div className="lg:col-span-7 space-y-8">
            <div
              className={`rounded-[2.5rem] p-6 md:p-8 border shadow-2xl transition-all duration-500 ${
                activeTab === "laporan"
                  ? "bg-[#2A1A1A] border-rose-900/30"
                  : "bg-[#1A1D24] border-white/5"
              }`}
            >
              <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    activeTab === "timeline"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <MessageSquare size={14} /> POST INFO
                </button>
                <button
                  onClick={() => setActiveTab("laporan")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    activeTab === "laporan"
                      ? "bg-rose-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <ShieldAlert size={14} /> LAPOR PAK!
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    posterName || "anon"
                  }`}
                  className="w-10 h-10 rounded-xl bg-white/5"
                  alt="avatar"
                />
                <input
                  value={posterName}
                  onChange={(e) => setPosterName(e.target.value)}
                  placeholder="Nama Anda..."
                  className="bg-white/5 border-none rounded-xl px-4 py-2 flex-1 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full bg-transparent border-none text-base md:text-lg font-medium min-h-[120px] focus:ring-0 placeholder:text-slate-600"
                placeholder={
                  activeTab === "timeline"
                    ? "Ada info apa hari ini warga?"
                    : "Tuliskan laporan Anda..."
                }
              />
              {selectedImage && (
                <div className="relative w-24 h-24 mb-4 group animate-in zoom-in-95">
                  <img
                    src={selectedImage}
                    className="w-full h-full object-cover rounded-xl border border-white/10 shadow-xl"
                    alt="preview"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  <ImageIcon
                    size={18}
                    className={
                      activeTab === "laporan"
                        ? "text-rose-500"
                        : "text-indigo-500"
                    }
                  />{" "}
                  Foto
                </button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={handlePost}
                  className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all transform active:scale-95 shadow-xl ${
                    activeTab === "laporan"
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-white text-black hover:bg-indigo-600 hover:text-white"
                  }`}
                >
                  KIRIM
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mb-4">
                Informasi Terbaru
              </h3>
              {isFetching
                ? [1, 2].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))
                : listTimeline.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-col md:flex-row items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="hidden md:flex w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center font-black shadow-lg shadow-indigo-600/20">
                        {post.user.charAt(0)}
                      </div>
                      <div className="flex-1 w-full bg-[#1A1D24] rounded-2xl border border-white/5 p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-black text-sm">{post.user}</h4>
                          <span className="text-[8px] font-black text-slate-500 uppercase">
                            {post.createdAt?.toDate
                              ? post.createdAt
                                  .toDate()
                                  .toLocaleDateString("id-ID")
                              : "Baru"}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {post.content}
                        </p>
                        {post.image && (
                          <img
                            src={post.image}
                            className="mt-4 rounded-xl w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setFullScreenImage(post.image)}
                            alt="post"
                          />
                        )}
                      </div>
                    </div>
                  ))}
              {!isFetching && listTimeline.length > 3 && (
                <Link href="/timeline" className="block w-full group">
                  <div className="flex items-center justify-center gap-3 w-full py-6 rounded-3xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 group-hover:text-white uppercase">
                      Lihat {listTimeline.length - 3} Informasi Lainnya
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-indigo-500 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <section className="bg-[#1A1D24] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
              {/* Dekoratif Glow Halus */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full"></div>

              <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500 mb-2">
                    Agenda Kegiatan
                  </h3>
                  <p className="text-xl font-black tracking-tight text-white uppercase">
                    Jadwal Warga
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <Zap
                    size={20}
                    className="text-emerald-500 fill-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {listAgenda.length > 0 ? (
                  listAgenda.map((ag) => {
                    const today = new Date().toISOString().split("T")[0];
                    const isToday = ag.date === today;
                    const isPast = ag.date < today;

                    let statusLabel = "Mendatang";
                    let accentColor = "text-emerald-400"; // Warna lebih terang
                    let borderColor = "border-white/10"; // Border lebih tegas
                    let bgColor = "bg-white/[0.04]"; // Background lebih solid
                    let textColor = "text-white";

                    if (isToday) {
                      statusLabel = "Hari Ini";
                      accentColor = "text-yellow-400";
                      borderColor = "border-yellow-400/50";
                      bgColor = "bg-yellow-400/[0.08]";
                      textColor = "text-white font-black";
                    } else if (isPast) {
                      statusLabel = "Selesai";
                      accentColor = "text-slate-400"; // Abu-abu terang, bukan transparan
                      borderColor = "border-white/5";
                      bgColor = "bg-white/[0.02]";
                      textColor = "text-slate-300"; // Teks tetap terbaca jelas
                    }

                    return (
                      <div
                        key={ag.id}
                        className={`p-6 rounded-[2rem] border transition-all duration-300 ${borderColor} ${bgColor} ${
                          isPast
                            ? "grayscale-[0.5]"
                            : "hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <h4
                            className={`font-bold text-base md:text-lg leading-tight ${textColor}`}
                          >
                            {ag.name}
                          </h4>
                          <span
                            className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg border border-current tracking-widest ${accentColor} bg-black/20`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div
                            className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wide ${
                              isPast ? "text-slate-500" : "text-slate-300"
                            }`}
                          >
                            <Calendar
                              size={14}
                              className={
                                isToday
                                  ? "text-yellow-400"
                                  : isPast
                                  ? "text-slate-500"
                                  : "text-emerald-400"
                              }
                            />
                            {new Date(ag.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>

                          {ag.time && (
                            <div
                              className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wide ${
                                isPast ? "text-slate-500" : "text-slate-300"
                              }`}
                            >
                              <Clock
                                size={14}
                                className={
                                  isToday
                                    ? "text-yellow-400"
                                    : isPast
                                    ? "text-slate-500"
                                    : "text-emerald-400"
                                }
                              />
                              {ag.time}
                            </div>
                          )}

                          {ag.location && (
                            <div
                              className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wide w-full mt-1 border-t ${
                                isPast
                                  ? "border-white/[0.02]"
                                  : "border-white/5"
                              } pt-2 ${
                                isPast ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              <MapPin
                                size={14}
                                className={
                                  isToday
                                    ? "text-yellow-400"
                                    : isPast
                                    ? "text-slate-500"
                                    : "text-emerald-400"
                                }
                              />
                              <span className="truncate">{ag.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                      Tidak ada agenda
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="lg:hidden">
              <EmergencyPanel />
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER / POWERED BY --- */}
      {/* --- FOOTER / POWERED BY --- */}

      <footer className="max-w-7xl mx-auto px-6 mt-32 mb-16 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Garis Pembatas Halus */}
          <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>

          <div className="flex flex-col items-center gap-6 group">
            <span className="text-[11px] font-black tracking-[0.6em] text-slate-500 uppercase ml-[0.6em]">
              Powered By
            </span>

            <div className="relative">
              {/* Efek Cahaya di belakang logo */}
              <div className="absolute inset-0 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>

              {/* Container Logo Besar */}
              <div className="relative h-30 md:h-38 w-auto flex items-center justify-center overflow-hidden">
                <img
                  src="/images/aldieys.webp"
                  alt="Powered By Logo"
                  className="h-full w-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                />
              </div>
            </div>
          </div>

          {/* Copyright & Lokasi */}
          <div className="flex flex-col items-center gap-3 mt-12">
            <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">
              <Copyright size={12} className="text-indigo-500/40" />
              <span>2026 RT.06 Digital Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px w-6 bg-white/5"></div>
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                Kelapa Dua, Tangerang
              </span>
              <div className="h-px w-6 bg-white/5"></div>
            </div>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#FFD700] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-black">
              {/* Header Popup */}
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black text-[#FFD700] p-3 rounded-2xl shadow-lg">
                  <Zap size={24} fill="currentColor" />
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Konten Utama */}
              <h3 className="text-xl font-black mb-3 leading-tight italic">
                Iuran Kas RT.06
              </h3>
              <p className="text-[13px] font-medium leading-relaxed opacity-90 mb-5">
                Salam hangat Bapak/Ibu warga RT.06, mohon bantuannya untuk
                pembayaran iuran kas pada tanggal{" "}
                <span className="font-bold underline">
                  1-10 setiap bulannya
                </span>
                .
              </p>

              {/* INFO REKENING BOX */}
              <div className="bg-black/5 border border-black/10 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 text-black">
                  Rekening Pembayaran:
                </p>
                <p className="text-base font-black text-black">
                  BCA — 7655027246
                </p>
                <p className="text-[11px] font-bold text-black/80">
                  a/n LAELNALDI SAPUTRA
                </p>
              </div>

              {/* INFO VISIT & KONFIRMASI */}
              <div className="space-y-3 mb-6">
                <p className="text-[11px] font-medium leading-relaxed opacity-80">
                  * Apabila belum sempat membayar, petugas bendahara kami akan{" "}
                  <span className="font-bold italic">
                    datang bersilaturahmi ke rumah
                  </span>{" "}
                  untuk membantu proses pembayaran.
                </p>
                <p className="text-[11px] font-medium leading-relaxed opacity-80">
                  * Bila sudah transfer, mohon kirim bukti ke nomor{" "}
                  <span className="font-bold">081280542508</span>.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                <a
                  href="https://wa.me/6281280542508?text=Halo%20Bendahara%20RT.06%2C%20saya%20ingin%20mengirimkan%20bukti%20transfer%20iuran%20kas%20bulan%20ini."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  Konfirmasi via WhatsApp
                </a>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:opacity-90 active:scale-95 transition-all shadow-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/**
 * Komponen Transaksi Reusable (Sesuai Permintaan: Max 3 data + Lihat Semua)
 */
function CompactTransactionList({
  title,
  data,
  type,
  isLoading,
  href,
  monthLabel,
}: any) {
  const displayData = data.slice(0, 3);

  return (
    <div className="bg-[#1A1D24] border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
      {/* Header Container dengan Flex Wrap untuk Mobile */}
      <div className="flex flex-wrap items-center gap-3 mb-6 px-2">
        {type === "in" ? (
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <PlusCircle size={18} />
          </div>
        ) : (
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
            <TrendingDown size={18} />
          </div>
        )}
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
          {title}
        </h3>

        {/* Spacer tersembunyi di mobile agar tombol turun ke bawah */}
        <div className="hidden sm:block flex-1" />

        {/* Button: Full width di mobile (w-full), auto di desktop (sm:w-auto) */}
        <button
          onClick={() => exportToPDF(title, data, type, monthLabel)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20 mt-2 sm:mt-0 order-last sm:order-none"
        >
          <FileDown size={14} />
          <span className="text-[11px] font-black tracking-tight">
            Download PDF
          </span>
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : displayData.length > 0 ? (
          displayData.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-200">
                  {item.name || item.description || "Tanpa Keterangan"}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                  {item.date}
                </span>
              </div>
              <span
                className={`font-black text-sm whitespace-nowrap ${
                  type === "in" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {type === "in" ? "+" : "-"} Rp
                {item.amount?.toLocaleString("id-ID")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 opacity-20 text-[10px] font-black border border-dashed border-white/10 rounded-2xl">
            DATA KOSONG
          </div>
        )}
      </div>

      {data.length > 0 && (
        <Link
          href={href}
          className="group flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
            Lihat Semua
          </span>
          <ArrowRight
            size={14}
            className="text-indigo-500 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}

const EmergencyPanel = () => (
  <div className="bg-[#1A1D24] border border-white/5 p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
    {/* Dekoratif Glow Halus */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px] rounded-full"></div>

    <div className="relative z-10 flex items-center justify-between mb-8">
      <div>
        <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-rose-500 mb-2">
          Darurat & Laporan
        </h3>
        <p className="text-xl font-black tracking-tight text-white uppercase">
          Kontak Penting
        </p>
      </div>
      <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
        <ShieldAlert size={20} className="text-rose-500" />
      </div>
    </div>

    <div className="space-y-4 relative z-10">
      {emergencyContacts.map((contact) => (
        <a
          key={contact.name}
          href={`tel:${contact.phone}`}
          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-[2rem] hover:bg-white/[0.07] transition-all group border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div
              className={`${contact.color} p-3.5 rounded-2xl shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}
            >
              {contact.icon}
            </div>
            <p className="font-black text-sm md:text-base uppercase tracking-tight text-white">
              {contact.name}
            </p>
          </div>

          {/* Action Icon: Phone Only */}
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-rose-500 group-hover:border-rose-400 group-hover:text-white transition-all duration-300 shadow-lg">
            {/* Menggunakan Lucide Phone Icon atau Siren sebagai representasi panggil */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:animate-bounce"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </a>
      ))}
    </div>

    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
      <span className="text-[9px] font-black uppercase tracking-widest">
        Sistem Aktif 24 Jam
      </span>
    </div>
  </div>
);
