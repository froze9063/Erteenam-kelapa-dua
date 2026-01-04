"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  ImageIcon,
  X,
  Loader2,
  ArrowUp,
  CheckCircle2,
} from "lucide-react";

// --- FILTER KATA KASAR ---
const BAD_WORDS = [
  "anjing",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "goblok",
  "tolol",
];
const filterText = (text: string) => {
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "****");
  });
  return filtered;
};

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<"timeline" | "laporan">(
    "timeline"
  );
  const [listTimeline, setListTimeline] = useState<any[]>([]);
  const [postText, setPostText] = useState("");
  const [posterName, setPosterName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor Scroll untuk Floating Button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Semua Data Timeline
  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setListTimeline(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setIsFetching(false);
    });
    return unsub;
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;
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

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-24 font-sans selection:bg-indigo-500/30">
      {/* MODAL GAMBAR */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <img
            src={fullScreenImage}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            alt="Full view"
          />
        </div>
      )}

      {/* HEADER STICKY */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-white/5 rounded-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">
              Timeline Warga
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold tracking-tight">
                RT.06 LIVE
              </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-10">
        {/* INPUT AREA */}
        <div
          className={`rounded-[2.5rem] p-6 md:p-8 border shadow-2xl transition-all duration-500 ${
            activeTab === "laporan"
              ? "bg-[#2A1A1A] border-rose-900/30"
              : "bg-[#1A1D24] border-white/5"
          }`}
        >
          <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <MessageSquare size={14} /> POST INFO
            </button>
            <button
              onClick={() => setActiveTab("laporan")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                activeTab === "laporan"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <ShieldAlert size={14} /> LAPOR PAK!
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  posterName || "anon"
                }`}
                className="w-8 h-8 opacity-80"
                alt="avatar"
              />
            </div>
            <input
              value={posterName}
              onChange={(e) => setPosterName(e.target.value)}
              placeholder="Nama Anda..."
              className="bg-white/5 border-none rounded-2xl px-5 py-3 flex-1 text-sm font-bold outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-transparent border-none text-base md:text-lg font-medium min-h-[120px] focus:ring-0 placeholder:text-slate-700 resize-none"
            placeholder={
              activeTab === "timeline"
                ? "Tulis informasi untuk warga..."
                : "Apa yang ingin Anda laporkan?"
            }
          />

          {selectedImage && (
            <div className="relative w-24 h-24 mb-4 group animate-in zoom-in-95">
              <img
                src={selectedImage}
                className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-xl"
                alt="preview"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-rose-600 rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-6 border-t border-white/5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <ImageIcon
                size={20}
                className={
                  activeTab === "laporan" ? "text-rose-500" : "text-indigo-500"
                }
              />{" "}
              Lampiran Foto
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
              className={`px-10 py-3.5 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-xl ${
                activeTab === "laporan"
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-white text-black hover:bg-indigo-600 hover:text-white"
              }`}
            >
              KIRIM SEKARANG
            </button>
          </div>
        </div>

        {/* TIMELINE LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">
              Arsip Informasi
            </h3>
            <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {listTimeline.length} Posts
            </span>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center py-24 opacity-20">
              <Loader2 className="animate-spin mb-4 w-10 h-10 text-indigo-500" />
              <p className="text-[10px] font-black tracking-[0.5em] uppercase">
                Sinkronisasi Data...
              </p>
            </div>
          ) : (
            listTimeline.map((post) => (
              <div
                key={post.id}
                className="group bg-[#1A1D24] rounded-[2.5rem] border border-white/5 p-6 md:p-8 shadow-lg hover:border-indigo-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                      {post.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-sm md:text-base flex items-center gap-2">
                        {post.user}
                        {post.user === "Ketua RT" && (
                          <CheckCircle2 size={14} className="text-blue-400" />
                        )}
                      </h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Warga RT.06
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter block">
                      {post.createdAt?.toDate
                        ? post.createdAt.toDate().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Baru"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-700 uppercase">
                      {post.createdAt?.toDate
                        ? post.createdAt.toDate().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                  {post.content}
                </p>

                {post.image && (
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/5">
                    <img
                      src={post.image}
                      className="w-full h-auto max-h-[500px] object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                      onClick={() => setFullScreenImage(post.image)}
                      alt="post-content"
                    />
                  </div>
                )}
              </div>
            ))
          )}

          {!isFetching && listTimeline.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
              <MessageSquare className="mx-auto mb-4 opacity-50" size={40} />
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Belum ada riwayat informasi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BACK TO TOP */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-6 z-[60] p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 transition-all duration-500 transform ${
          showBackToTop
            ? "translate-y-0 opacity-100 rotate-0"
            : "translate-y-20 opacity-0 pointer-events-none rotate-180"
        } hover:bg-indigo-500 active:scale-90`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </main>
  );
}
