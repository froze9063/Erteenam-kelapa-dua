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
  ChevronRight,
  Wallet,
  ArrowDownCircle,
  Hash,
  Clock,
  Maximize2,
} from "lucide-react";

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

  useEffect(() => {
    const docRef = doc(db, "saldo", bulan);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDataSaldo({
          saldo: data.saldo || 0,
          total_keluar: data.total_keluar || 0,
        });
      } else {
        setDataSaldo({ saldo: 0, total_keluar: 0 });
      }
    });
    return () => unsub();
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

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;
    try {
      await addDoc(collection(db, "timeline"), {
        user: posterName.trim() || "Warga Anonim",
        content: postText,
        image: selectedImage,
        createdAt: serverTimestamp(),
      });
      setPostText("");
      setPosterName("");
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
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
          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          setSelectedImage(base64);
        };
      };
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-12 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* FULL SCREEN IMAGE MODAL */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setFullScreenImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>
          <img
            src={fullScreenImage}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            alt="Full view"
          />
        </div>
      )}

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/20 blur-[100px] md:blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-emerald-600/10 blur-[100px] md:blur-[150px] rounded-full"></div>
      </div>

      <header className="relative pt-12 md:pt-24 pb-16 md:pb-24 px-4 md:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-8 md:w-12 bg-indigo-500"></div>
                <span className="text-indigo-400 font-black text-[10px] md:text-xs tracking-[0.3em] uppercase">
                  {greeting}, Portal RT.06
                </span>
              </div>
              <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-2 md:mb-4">
                INFO <br />
                <span className="italic text-outline hover:text-white transition-all duration-500">
                  WARGA
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-400 text-xs md:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-500" /> Kelapa Dua
                  Tangerang
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-1.5 md:p-2 rounded-2xl md:rounded-3xl backdrop-blur-3xl flex items-center w-full md:w-auto">
              <div className="p-3 md:p-4 bg-indigo-600 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-600/30">
                <Calendar size={20} className="md:w-6 md:h-6" />
              </div>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="bg-transparent text-lg md:text-xl font-black py-2 px-4 md:px-6 outline-none cursor-pointer appearance-none flex-1"
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="lg:col-span-8 bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 opacity-80">
                <Wallet size={18} />{" "}
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                  Total Kas RT
                </span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                Rp{dataSaldo.saldo?.toLocaleString("id-ID")}
              </h2>
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

          <div className="lg:hidden">
            <RincianPengeluaran listPengeluaran={listPengeluaran} />
          </div>

          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            <EmergencyPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <div className="bg-[#1A1D24] rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  className="w-10 h-10 rounded-xl bg-indigo-500/20"
                  alt="avatar"
                />
                <input
                  value={posterName}
                  onChange={(e) => setPosterName(e.target.value)}
                  placeholder="Nama Warga..."
                  className="bg-white/5 border-none rounded-xl px-4 py-2 flex-1 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full bg-transparent border-none text-base md:text-lg font-medium min-h-[80px] md:min-h-[100px] focus:ring-0 placeholder:text-slate-600"
                placeholder="Apa kabar hari ini?"
              />

              {selectedImage && (
                <div className="relative inline-block mt-2">
                  <img
                    src={selectedImage}
                    className="w-24 h-24 object-cover rounded-xl border border-indigo-500/50"
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
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest"
                >
                  <ImageIcon size={18} className="text-indigo-500" /> Sisipkan
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
                  className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95 shadow-xl"
                >
                  KIRIM
                </button>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {listTimeline.map((post) => (
                <div key={post.id} className="relative group">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-600/20">
                        {post.user.charAt(0)}
                      </div>
                      <div className="w-[1.5px] h-full bg-white/5"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm md:text-base font-black">
                          {post.user}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {post.createdAt?.toDate
                              ? post.createdAt
                                  .toDate()
                                  .toLocaleDateString("id-ID")
                              : "Baru"}
                          </span>
                          {post.createdAt?.toDate && (
                            <span className="text-[8px] font-bold text-indigo-400/80 uppercase">
                              {post.createdAt
                                .toDate()
                                .toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-[#1A1D24] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                        <div className="p-4 md:p-6">
                          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                        {post.image && (
                          <div
                            className="px-2 pb-2 relative group/img cursor-pointer"
                            onClick={() => setFullScreenImage(post.image)}
                          >
                            <img
                              src={post.image}
                              className="w-full h-auto rounded-lg transition-all"
                              alt="img"
                            />
                            <div className="absolute inset-2 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Maximize2 className="text-white" size={24} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:hidden pb-10">
              <EmergencyPanel />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 md:space-y-12">
            <div className="hidden lg:block">
              <RincianPengeluaran listPengeluaran={listPengeluaran} />
            </div>

            <section className="bg-emerald-500 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-black shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-black text-emerald-500 p-2.5 rounded-xl">
                  <Zap size={20} />
                </div>
                <h3 className="font-black text-xl tracking-tight uppercase">
                  Agenda Warga
                </h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {listAgenda.map((ag) => (
                  <div
                    key={ag.id}
                    className="bg-white/20 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-white/30"
                  >
                    <h4 className="font-black text-sm md:text-lg mb-2">
                      {ag.name}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-70 font-black text-[8px] md:text-[9px] uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {ag.date}
                      </span>
                      {ag.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {ag.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {ag.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#1A1D24] rounded-2xl md:rounded-[3rem] p-6 md:p-10 border border-white/5">
              <h3 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6 text-center">
                Kepengurusan
              </h3>
              <div className="space-y-4 md:space-y-6">
                {pengurus.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}
                      >
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          {p.jabatan}
                        </p>
                        <p className="text-sm md:text-base font-black">
                          {p.nama}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmergencyPanel() {
  return (
    <div className="bg-[#1A1D24] border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6">
      <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>{" "}
        Panggilan Darurat
      </h3>
      <div className="space-y-3">
        {emergencyContacts.map((contact) => (
          <a
            key={contact.name}
            href={`tel:${contact.phone}`}
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`${contact.color} p-2 rounded-lg`}>
                {contact.icon}
              </div>
              <span className="font-bold text-xs md:text-sm">
                {contact.name}
              </span>
            </div>
            <span className="font-black text-base md:text-lg">
              {contact.phone}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function RincianPengeluaran({ listPengeluaran }: { listPengeluaran: any[] }) {
  return (
    <section className="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-xl md:text-2xl tracking-tighter">
            Pengeluaran
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Laporan Kas
          </p>
        </div>
        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
          <ArrowDownCircle size={22} />
        </div>
      </div>
      <div className="space-y-3">
        {listPengeluaran.length > 0 ? (
          listPengeluaran.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <ReceiptText size={16} className="text-slate-400" />
                </div>
                <div>
                  <span className="block font-black text-[10px] md:text-xs">
                    {item.name}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.date}
                  </span>
                </div>
              </div>
              <span className="font-black text-rose-600 text-xs md:text-sm">
                -Rp{item.amount?.toLocaleString("id-ID")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-400 text-[10px] font-bold italic">
              Kosong
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
