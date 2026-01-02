'use client'

import { useState } from 'react'
import {
  Wallet,
  TrendingDown,
  ChevronDown,
  MessageSquare,
  Send,
  Calendar,
  User,
  Zap,
  MapPin,
  Clock,
  ChevronRight,
  Users,
  ShieldCheck,
  Bell,
  Home,
  PieChart,
  Settings,
  Info
} from 'lucide-react'

/* ================= DATA TERINTEGRASI ================= */
const pengurus = [
  { jabatan: 'Ketua RT', nama: 'Pak Agus', deskripsi: 'Penanggung Jawab', icon: <ShieldCheck className="text-indigo-600" size={20} /> },
  { jabatan: 'Wakil Ketua', nama: 'Pak Agus', deskripsi: 'Operasional', icon: <User className="text-blue-500" size={20} /> },
  { jabatan: 'Sekretaris', nama: 'Pak Agus', deskripsi: 'Administrasi', icon: <MessageSquare className="text-emerald-500" size={20} /> },
  { jabatan: 'Bendahara', nama: 'Pak Agus', deskripsi: 'Keuangan', icon: <Wallet className="text-amber-500" size={20} /> },
]

const bulananData: Record<string, any> = {
  '2026-01': {
    saldo: 5000000,
    totalKeluar: 3200000,
    pengeluaran: [
      { id: 1, tanggal: '05 Jan', judul: 'Kebersihan Lingkungan', total: 1200000, kategori: 'Fasilitas', color: 'bg-blue-500', detail: [{ item: 'Upah petugas kebersihan', harga: 1200000 }] },
      { id: 2, tanggal: '17 Jan', judul: 'Lomba Catur Warga', total: 2000000, kategori: 'Sosial', color: 'bg-purple-500', detail: [{ item: 'Hadiah & Konsumsi', harga: 2000000 }] },
    ],
    acara: [
      { id: 101, judul: 'Kerja Bakti Masal', tgl: '12 Jan 2026', jam: '07:00', lokasi: 'Lapangan Utama RT.06', status: 'Selesai', desc: 'Fokus pada pembersihan selokan utama dan perampingan dahan pohon.' },
      { id: 102, judul: 'Rapat Bulanan', tgl: '25 Jan 2026', jam: '19:30', lokasi: 'Balai Warga / Rumah Pak RT', status: 'Selesai', desc: 'Pembahasan iuran keamanan dan rencana aspal jalan.' }
    ]
  },
  '2026-02': {
    saldo: 7500000,
    totalKeluar: 1500000,
    pengeluaran: [
      { id: 3, tanggal: '02 Feb', judul: 'Perbaikan Lampu Jalan', total: 1500000, kategori: 'Perbaikan', color: 'bg-orange-500', detail: [{ item: 'LED Philips 10 unit', harga: 1500000 }] },
    ],
    acara: [
      { id: 103, judul: 'Senam Sehat Minggu Pagi', tgl: '08 Feb 2026', jam: '06:00', lokasi: 'Fasum Blok A', status: 'Akan Datang', desc: 'Instruktur profesional & tersedia doorprize menarik.' },
      { id: 104, judul: 'Fogging DBD', tgl: '15 Feb 2026', jam: '08:00', lokasi: 'Seluruh Area RT.06', status: 'Akan Datang', desc: 'Mohon menutup wadah air terbuka dan makanan di meja.' }
    ]
  }
}

/* ================= MAIN PAGE ================= */
export default function PortalRT() {
  const [bulan, setBulan] = useState('2026-01')
  const [openDetail, setOpenDetail] = useState<number | null>(null)
  const [activeAcara, setActiveAcara] = useState<number | null>(null)
  const [nama, setNama] = useState('')
  const [pesan, setPesan] = useState('')
  const [listAspirasi, setListAspirasi] = useState([
    { user: 'Bpk. Budi', pesan: 'Terima kasih atas transparansi laporannya, sangat membantu!', waktu: '2 jam yang lalu' },
    { user: 'Ibu Sari', pesan: 'Mohon info untuk jadwal fogging apakah bisa dipercepat?', waktu: '5 jam yang lalu' },
  ])

  const current = bulananData[bulan]

  const handleKirimAspirasi = () => {
    if(!nama || !pesan) return alert('Mohon lengkapi nama dan pesan aspirasi Anda.');
    setListAspirasi([{ user: nama, pesan, waktu: 'Baru saja' }, ...listAspirasi])
    setNama(''); setPesan('');
  }

  return (
    <main className="min-h-screen bg-[#FDFEFF] text-slate-900 pb-28 md:pb-12 font-sans selection:bg-indigo-100">
      
      {/* --- HEADER --- */}
      <header className="relative bg-[#0F172A] pt-12 pb-28 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-fuchsia-600/10 blur-[100px] rounded-full -ml-24 -mb-24"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Portal Warga Digital</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                RT.06 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">RESIDENCE</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">Mandiri • Aman • Harmonis</p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
                <Calendar size={18} />
              </div>
              <select 
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="bg-transparent text-white font-semibold py-2 pr-8 outline-none cursor-pointer text-sm"
              >
                <option value="2026-01" className="text-slate-900">Januari 2026</option>
                <option value="2026-02" className="text-slate-900">Februari 2026</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-16 relative z-20">
        
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
          <StatCard title="Total Saldo Kas" value={current.saldo} icon={<Wallet size={22} />} variant="emerald" isPositive={true} />
          <StatCard title="Pengeluaran Bulan Ini" value={current.totalKeluar} icon={<TrendingDown size={22} />} variant="rose" isPositive={false} />
        </div>

        {/* PENGURUS */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Struktur Pengurus</h2>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 md:grid md:grid-cols-4">
            {pengurus.map((p, idx) => (
              <div key={idx} className="min-w-[240px] md:min-w-0 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{p.jabatan}</h4>
                  <p className="font-bold text-slate-800 text-sm truncate">{p.nama}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-12">
            {/* AGENDA */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-600" /> Agenda Mendatang
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.acara.map((ac: any) => (
                  <div 
                    key={ac.id}
                    onClick={() => setActiveAcara(activeAcara === ac.id ? null : ac.id)}
                    className={`cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all shadow-sm group ${
                      activeAcara === ac.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-50 text-slate-800 hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        activeAcara === ac.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ac.status}
                      </span>
                      <ChevronRight size={16} className={`transition-transform ${activeAcara === ac.id ? 'rotate-90' : ''}`} />
                    </div>
                    <h4 className="font-bold text-lg mb-4 leading-tight">{ac.judul}</h4>
                    <div className={`space-y-2.5 text-xs font-medium ${activeAcara === ac.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="shrink-0 opacity-70" /> {ac.tgl}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock size={14} className="shrink-0 opacity-70" /> {ac.jam} WIB
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin size={14} className={`shrink-0 ${activeAcara === ac.id ? 'text-white' : 'text-rose-500'}`} /> 
                        <span className="leading-tight">{ac.lokasi}</span>
                      </div>
                    </div>
                    {activeAcara === ac.id && (
                      <div className="mt-4 pt-4 border-t border-white/20 animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs leading-relaxed italic opacity-90">"{ac.desc}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* TRANSAKSI */}
            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800">Laporan Kas Keluar</h2>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Info size={16} />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {current.pengeluaran.map((item: any) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenDetail(openDetail === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105`}>
                          <Zap size={18} fill="currentColor" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm md:text-base leading-none mb-1.5">{item.judul}</h4>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.tanggal} • {item.kategori}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-rose-500 text-sm md:text-base">-Rp{item.total.toLocaleString('id-ID')}</span>
                        <ChevronDown className={`text-slate-300 transition-transform ${openDetail === item.id ? 'rotate-180 text-indigo-600' : ''}`} size={18} />
                      </div>
                    </button>
                    {openDetail === item.id && (
                      <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-1">
                        {item.detail.map((d: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs py-2 font-medium border-b border-white last:border-0">
                            <span className="text-slate-500">{d.item}</span>
                            <span className="text-slate-800">Rp{d.harga.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ASPIRASI */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xl font-bold mb-2">Suara Warga</h3>
              <p className="text-slate-400 text-xs mb-6">Saran Anda adalah prioritas kami.</p>
              
              <div className="space-y-4 relative z-10">
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap / No Rumah"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                />
                <textarea
                  rows={3}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Ketik aspirasi Anda..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                />
                <button 
                  onClick={handleKirimAspirasi}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/40 transition-all active:scale-95"
                >
                  Kirim Pesan <Send size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Pesan Terbaru</h4>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />)}
                </div>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {listAspirasi.map((a, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-4 animate-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner uppercase">
                      {a.user.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <h5 className="font-bold text-slate-800 text-xs truncate">{a.user}</h5>
                        <span className="text-[9px] font-medium text-slate-400 shrink-0">{a.waktu}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                        <p className="text-slate-600 text-xs leading-relaxed">"{a.pesan}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex justify-between items-center md:hidden z-[100] shadow-2xl">
        <button className="text-indigo-600"><Home size={24} /></button>
        <button className="text-slate-300"><PieChart size={24} /></button>
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white -mt-12 shadow-2xl shadow-indigo-300 border-4 border-white active:scale-90 transition-transform">
          <Zap size={24} fill="currentColor" />
        </div>
        <button className="text-slate-300"><Bell size={24} /></button>
        <button className="text-slate-300"><Settings size={24} /></button>
      </nav>

    </main>
  )
}

/* ================== REUSABLE STAT CARD ================== */
function StatCard({ title, value, icon, variant, isPositive }: any) {
  const styles: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  }
  
  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group hover:border-indigo-100 transition-all">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className={`text-2xl md:text-4xl font-black tracking-tighter ${isPositive ? 'text-slate-900' : 'text-rose-600'}`}>
          Rp{value.toLocaleString('id-ID')}
        </p>
      </div>
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${styles[variant]}`}>
        {icon}
      </div>
    </div>
  )
}