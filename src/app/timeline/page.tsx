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

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
      {/* FULLSCREEN IMAGE OVERLAY */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <img
            src={fullScreenImage}
            className="max-w-full max-h-full object-contain rounded-lg"
            alt="Full view"
          />
          <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white">
            <X size={24} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0F1115]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2.5 bg-white/5 active:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
              Timeline RT.06
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold tracking-tight opacity-80">
                WARGA LIVE
              </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* INPUT BOX */}
        <div
          className={`rounded-3xl p-5 border transition-all duration-500 shadow-2xl ${
            activeTab === "laporan"
              ? "bg-[#2A1A1A] border-rose-900/30"
              : "bg-[#1A1D24] border-white/5"
          }`}
        >
          {/* TAB SWITCHER */}
          <div className="flex gap-1.5 mb-6 bg-black/30 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-500"
              }`}
            >
              <MessageSquare size={14} /> INFO
            </button>
            <button
              onClick={() => setActiveTab("laporan")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                activeTab === "laporan"
                  ? "bg-rose-600 text-white shadow-lg"
                  : "text-slate-500"
              }`}
            >
              <ShieldAlert size={14} /> LAPOR
            </button>
          </div>

          {/* NAME INPUT */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  posterName || "anon"
                }`}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            </div>
            <input
              value={posterName}
              onChange={(e) => setPosterName(e.target.value)}
              placeholder="Nama Anda..."
              className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 flex-1 text-sm font-bold outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* CONTENT INPUT */}
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-transparent border-none text-[15px] font-medium min-h-[100px] focus:ring-0 placeholder:text-slate-700 resize-none break-words"
            placeholder={
              activeTab === "timeline"
                ? "Tulis informasi atau kabar warga..."
                : "Ada kendala di lingkungan? Laporkan di sini..."
            }
          />

          {/* IMAGE PREVIEW */}
          {selectedImage && (
            <div className="relative w-20 h-20 mb-4 animate-in zoom-in-95">
              <img
                src={selectedImage}
                className="w-full h-full object-cover rounded-xl border border-white/10"
                alt="preview"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 rounded-full p-1 shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* BOTTOM ACTIONS */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors"
            >
              <ImageIcon
                size={18}
                className={
                  activeTab === "laporan" ? "text-rose-500" : "text-indigo-500"
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
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] tracking-wider transition-all active:scale-95 shadow-lg ${
                activeTab === "laporan"
                  ? "bg-rose-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              KIRIM
            </button>
          </div>
        </div>

        {/* FEED LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase whitespace-nowrap">
              Feed Terkini
            </span>
            <div className="h-[1px] w-full bg-white/5"></div>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center py-20 opacity-20">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            listTimeline.map((post) => (
              <div
                key={post.id}
                className="bg-[#1A1D24] rounded-3xl border border-white/5 p-5 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center font-black text-white shadow-lg">
                      {post.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-white flex items-center gap-1.5 uppercase tracking-tight">
                        {post.user}
                        {post.user.toLowerCase().includes("rt") && (
                          <CheckCircle2 size={14} className="text-blue-400" />
                        )}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Warga RT.06
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                      {post.createdAt?.toDate
                        ? post.createdAt
                            .toDate()
                            .toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })
                        : "Baru"}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 text-[14px] leading-relaxed mb-4 break-words">
                  {post.content}
                </p>

                {post.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/5">
                    <img
                      src={post.image}
                      className="w-full h-auto max-h-[400px] object-cover"
                      onClick={() => setFullScreenImage(post.image)}
                      alt="post-content"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* FLOATING ACTION */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-[60] p-3.5 rounded-2xl bg-indigo-600 text-white shadow-2xl transition-all duration-500 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        } active:scale-90`}
      >
        <ArrowUp size={22} strokeWidth={3} />
      </button>
    </main>
  );
}
