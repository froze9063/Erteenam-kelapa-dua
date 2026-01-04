"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "../lib/firebase";
import Link from "next/link"; // Tambahkan ini
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
  ReceiptText,
  MapPin,
  Flame,
  Ambulance,
  Siren,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  Loader2,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  Copyright,
  CheckCircle2,
  Clock,
  ArrowRight, // Tambahkan ini untuk icon view more
} from "lucide-react";

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
    sudah_bayar: 0,
    belum_bayar: 0,
  });
  const [listTimeline, setListTimeline] = useState<any[]>([]);
  const [listPengeluaran, setListPengeluaran] = useState<any[]>([]);
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
          sudah_bayar: data.sudah_bayar || 0,
          belum_bayar: data.belum_bayar || 0,
        });
      } else {
        setDataSaldo({
          saldo: 0,
          total_keluar: 0,
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
    const cleanName = filterText(posterName.trim() || "Warga Anonim");
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

  if (isLoadingPage) {
    return (
      <div className="fixed inset-0 bg-[#0F1115] flex flex-col items-center justify-center z-[200]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-4 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
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

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/20 blur-[100px] md:blur-[150px] rounded-full"></div>
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
              INFO <br />{" "}
              <span className="italic text-outline hover:text-white transition-all">
                WARGA
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
          <div className="lg:col-span-8 bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 opacity-80">
                <Wallet size={18} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Total Kas RT
                </span>
              </div>
              {isFetching ? (
                <Skeleton className="h-20 w-3/4" />
              ) : (
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                  Rp{dataSaldo.saldo?.toLocaleString("id-ID")}
                </h2>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                  <div className="p-1.5 bg-rose-500 rounded-full">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold opacity-60 uppercase">
                      Pengeluaran
                    </p>
                    <p className="text-lg font-black">
                      Rp{dataSaldo.total_keluar?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 inline-flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-[8px] font-bold opacity-60 uppercase">
                        Sudah Bayar
                      </p>
                      <p className="text-lg font-black">
                        {dataSaldo.sudah_bayar}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-400" />
                    <div>
                      <p className="text-[8px] font-bold opacity-60 uppercase">
                        Belum Bayar
                      </p>
                      <p className="text-lg font-black">
                        {dataSaldo.belum_bayar}
                      </p>
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

        <div className="lg:hidden mb-8 order-1">
          <RincianPengeluaran
            listPengeluaran={listPengeluaran}
            isLoading={isFetching}
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
                : // MODIFIKASI: Gunakan .slice(0, 3) untuk membatasi tampilan di home
                  listTimeline.slice(0, 3).map((post) => (
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

              {/* MODIFIKASI: Tombol View More ke halaman lain */}
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
            <div className="hidden lg:block">
              <RincianPengeluaran
                listPengeluaran={listPengeluaran}
                isLoading={isFetching}
              />
            </div>
            <section className="bg-emerald-500 rounded-[3rem] p-8 md:p-10 text-black shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <Zap size={24} />
                <h3 className="font-black text-xl uppercase tracking-tight">
                  Agenda Warga
                </h3>
              </div>
              <div className="space-y-4">
                {listAgenda.length > 0 ? (
                  listAgenda.map((ag) => {
                    const today = new Date().toISOString().split("T")[0];
                    const isToday = ag.date === today;
                    const isPast = ag.date < today;
                    let label = "Mendatang";
                    let labelStyle = "bg-black/10 text-black";
                    if (isToday) {
                      label = "Hari Ini";
                      labelStyle =
                        "bg-white text-emerald-600 animate-pulse ring-2 ring-white/30";
                    } else if (isPast) {
                      label = "Selesai";
                      labelStyle = "bg-black/20 text-black/50";
                    }
                    return (
                      <div
                        key={ag.id}
                        className={`p-6 rounded-[2rem] border bg-white/20 border-white/30 transition-all ${
                          isPast ? "opacity-50 grayscale" : "hover:scale-[1.02]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <h4 className="font-black text-lg leading-tight">
                            {ag.name}
                          </h4>
                          <span
                            className={`text-[8px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap shadow-sm ${labelStyle}`}
                          >
                            {label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 opacity-70 font-black text-[10px] uppercase">
                            <Calendar size={14} strokeWidth={3} />
                            {ag.date}
                          </div>
                          {ag.time && (
                            <div className="flex items-center gap-2 opacity-70 font-black text-[10px] uppercase">
                              <Clock size={14} strokeWidth={3} />
                              {ag.time} WIB
                            </div>
                          )}
                          {ag.location && (
                            <div className="flex items-center gap-2 opacity-70 font-black text-[10px] uppercase">
                              <MapPin size={14} strokeWidth={3} />
                              {ag.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 opacity-40 font-black text-[10px] italic border-2 border-dashed border-black/10 rounded-[2rem]">
                    TIDAK ADA AGENDA
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

      <footer className="mt-12 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-black text-[10px]">
              06
            </div>
            <div className="text-left">
              <p className="font-black text-[9px] tracking-[0.2em] uppercase">
                Rukun Tetangga 06
              </p>
              <p className="text-[8px] font-bold">Kelapa Dua, Tangerang</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 opacity-20 text-center md:text-right">
            <p className="text-[8px] font-black tracking-widest flex items-center gap-1">
              <Copyright size={10} /> 2026 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// --- SUB-COMPONENTS ---
function EmergencyPanel() {
  return (
    <div className="bg-[#1A1D24] border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
      <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>{" "}
        Panggilan Darurat
      </h3>
      <div className="space-y-3">
        {emergencyContacts.map((contact) => (
          <a
            key={contact.name}
            href={`tel:${contact.phone}`}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-indigo-500/10 border border-white/5 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`${contact.color} p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform`}
              >
                {contact.icon}
              </div>
              <span className="font-bold text-sm">{contact.name}</span>
            </div>
            <span className="font-black text-lg tracking-tighter">
              {contact.phone}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function RincianPengeluaran({
  listPengeluaran,
  isLoading,
}: {
  listPengeluaran: any[];
  isLoading: boolean;
}) {
  return (
    <section className="bg-white rounded-[3rem] p-8 md:p-10 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-2xl tracking-tighter">Pengeluaran</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Laporan Kas
          </p>
        </div>
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
          <ArrowDownCircle size={24} />
        </div>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-slate-100" />
          ))
        ) : listPengeluaran.length > 0 ? (
          listPengeluaran.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <ReceiptText size={18} className="text-slate-400" />
                </div>
                <div>
                  <span className="block font-black text-xs">{item.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {item.date}
                  </span>
                </div>
              </div>
              <span className="font-black text-rose-600 text-sm">
                Rp{item.amount?.toLocaleString("id-ID")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 opacity-40 font-black text-[10px]">
            TIDAK ADA DATA
          </div>
        )}
      </div>
    </section>
  );
}
