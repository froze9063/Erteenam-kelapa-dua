"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
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
  Clock,
  Maximize2,
  Loader2,
} from "lucide-react";

// --- KONFIGURASI KEAMANAN & DATA ---
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
  const [bulan, setBulan] = useState("2026-01");
  const [dataSaldo, setDataSaldo] = useState({ saldo: 0, total_keluar: 0 });
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
        });
      } else {
        setDataSaldo({ saldo: 0, total_keluar: 0 });
      }
      setIsFetching(false);
    });
  }, [bulan]);

  useEffect(() => {
    const q = query(
      collection(db, "pengeluaran"),
      where("date_month", "==", bulan),
      orderBy("date", "desc")
    );
    return onSnapshot(q, (snapshot) =>
      setListPengeluaran(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }, [bulan]);

  useEffect(() => {
    const q = query(
      collection(db, "agenda"),
      where("date_month", "==", bulan),
      orderBy("date", "asc")
    );
    return onSnapshot(q, (snapshot) =>
      setListAgenda(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
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

  // --- LOGIKA POSTING DENGAN COOLDOWN ---
  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;

    // Cek Cooldown (5 Menit)
    const LAST_POST_KEY = "portal_rt_last_post";
    const COOLDOWN_TIME = 5 * 60 * 1000; // 5 menit dalam ms
    const lastPost = localStorage.getItem(LAST_POST_KEY);
    const now = Date.now();

    if (lastPost && now - parseInt(lastPost) < COOLDOWN_TIME) {
      const remainingSeconds = Math.ceil(
        (COOLDOWN_TIME - (now - parseInt(lastPost))) / 1000
      );
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      alert(
        `Mohon tunggu ${remainingMinutes} menit lagi untuk mengirim postingan.`
      );
      return;
    }

    const cleanContent = filterText(postText);
    const cleanName = filterText(posterName.trim() || "Warga Anonim");

    try {
      await addDoc(collection(db, "timeline"), {
        user: cleanName,
        content: cleanContent,
        image: selectedImage,
        createdAt: serverTimestamp(),
      });

      // Simpan waktu posting terakhir
      localStorage.setItem(LAST_POST_KEY, now.toString());

      setPostText("");
      setPosterName("");
      setSelectedImage(null);
      alert("Postingan terkirim!");
    } catch (err) {
      alert("Gagal mengirim postingan.");
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
    <main className="min-h-screen bg-[#0F1115] text-white pb-12 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <img
            src={fullScreenImage}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            alt="Full view"
          />
        </div>
      )}

      {/* Decorative BG */}
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

            {/* LOKASI HEADER */}
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs md:text-sm">
              <MapPin size={16} className="text-indigo-500" />
              <span>Kelapa Dua Tangerang</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-2 rounded-3xl flex items-center w-full md:w-auto">
            <div className="p-4 bg-indigo-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="bg-transparent text-xl font-black py-2 px-6 outline-none appearance-none flex-1"
            >
              <option value="2026-01" className="text-slate-900">
                Januari 2026
              </option>
              <option value="2026-02" className="text-slate-900">
                Februari 2026
              </option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-10 flex flex-col">
        {/* ROW 1: SALDO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
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
              <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                <div className="p-1.5 bg-rose-500 rounded-full">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-bold opacity-60 uppercase">
                    Pengeluaran Bulan Ini
                  </p>
                  <p className="text-lg font-black">
                    Rp{dataSaldo.total_keluar?.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            <EmergencyPanel />
          </div>
        </div>

        {/* MOBILE ONLY: PENGELUARAN (Tampil sebelum Pengurus di Mobile) */}
        <div className="lg:hidden mb-8 order-1">
          <RincianPengeluaran
            listPengeluaran={listPengeluaran}
            isLoading={isFetching}
          />
        </div>

        {/* SECTION: PENGURUS RT (Mobile: Order 2) */}
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

        {/* ROW 2: TIMELINE & SIDEBAR (Mobile: Order 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 order-3">
          <div className="lg:col-span-7 space-y-8">
            {/* Input Post */}
            <div className="bg-[#1A1D24] rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    posterName || "anon"
                  }`}
                  className="w-10 h-10 rounded-xl bg-indigo-500/20"
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
                className="w-full bg-transparent border-none text-base md:text-lg font-medium min-h-[100px] focus:ring-0 placeholder:text-slate-600"
                placeholder="Apa info hari ini?"
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest"
                >
                  <ImageIcon size={18} /> Foto
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
                  className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95 shadow-xl"
                >
                  KIRIM
                </button>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-6">
              {isFetching
                ? [1, 2].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))
                : listTimeline.map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-col md:flex-row items-start gap-4"
                    >
                      <div className="hidden md:flex w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center font-black">
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
                            className="mt-4 rounded-xl w-full h-auto cursor-pointer border border-white/5"
                            onClick={() => setFullScreenImage(post.image)}
                            alt="post"
                          />
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* SIDEBAR */}
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
                {isFetching ? (
                  <Skeleton className="h-20 w-full bg-black/10" />
                ) : (
                  listAgenda.map((ag) => (
                    <div
                      key={ag.id}
                      className="bg-white/20 p-6 rounded-[2rem] border border-white/30 transition-transform hover:scale-[1.02]"
                    >
                      <h4 className="font-black text-lg mb-2">{ag.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-70 font-black text-[9px] uppercase">
                          <Calendar size={12} /> {ag.date}{" "}
                          {ag.time && `• ${ag.time}`}
                        </div>
                        {ag.location && (
                          <div className="flex items-center gap-2 opacity-70 font-black text-[9px] uppercase">
                            <MapPin size={12} /> {ag.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <div className="lg:hidden">
              <EmergencyPanel />
            </div>
          </div>
        </div>
      </div>
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
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-indigo-500/10 border border-white/5 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`${contact.color} p-2.5 rounded-xl text-white`}>
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
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between"
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
                -Rp{item.amount?.toLocaleString("id-ID")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-40 font-black text-[10px] italic">
            BELUM ADA DATA
          </div>
        )}
      </div>
    </section>
  );
}
