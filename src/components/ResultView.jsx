import { fmt } from '../utils';

export default function ResultView({ navigate, resultData }) {
  if (!resultData) return null;

  const d = resultData;
  const inc = parseFloat(d.income) || 0;
  const pbb = parseFloat(d.pbb) || 0;
  const biz = parseFloat(d.bizTax) || 0;
  const omzet = biz > 0 ? biz / 0.05 : 0;
  const bayar = parseFloat(d.bayar) || 0;
  const isLunas = d.status === 'Lunas';
  const hutang = isLunas ? 0 : Math.max(0, (parseFloat(d.total) || 0) - bayar);

  let cat = 'Miskin (0%)';
  if (inc > 15000000) cat = 'Atas (25%)';
  else if (inc > 7000000) cat = 'Menengah Atas (15%)';
  else if (inc > 3000000) cat = 'Menengah Bawah (10%)';

  let aset = 'Tidak Ada Aset';
  if (pbb === 50000) aset = 'Rumah Standart';
  else if (pbb === 150000) aset = 'Rumah Mewah';
  else if (pbb === 200000) aset = 'Bangunan Bisnis';

  const dateObj = new Date(d.tanggal);
  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const cardBorderClass = isLunas ? 'border-t-emerald-500' : 'border-t-red-500';
  const headerBgClass = isLunas ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30';
  const iconBgClass = isLunas
    ? 'bg-emerald-500/20 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    : 'bg-red-500/20 border-red-400/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
  const statusBadgeClass = isLunas
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'bg-red-500/20 text-red-400 border border-red-500/30';

  return (
    <div className="page-enter min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg relative animate__animated animate__fadeInUp">
        <div className={`glass-panel rounded-3xl overflow-hidden border-t-8 ${cardBorderClass} transition-all duration-500`}>

          {/* Header */}
          <div className={`p-6 text-center border-b border-dashed relative ${headerBgClass}`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-4 shadow-lg text-3xl ${iconBgClass}`}>
              {isLunas ? '🎉' : '⚠️'}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{d.nama}</h2>
            <div className="flex justify-center gap-3 text-xs mt-2 text-slate-400 font-mono mb-2">
              <span className="bg-black/20 px-2 py-1 rounded">ID: {d.id}</span>
              <span className="bg-black/20 px-2 py-1 rounded">{dateStr}</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">
              Served by Officer: <span className="text-indigo-400 font-bold">{d.petugas || '-'}</span>
            </div>
            <div className={`inline-block mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadgeClass}`}>
              {isLunas ? '✅ LUNAS (PAID)' : '❌ BELUM LUNAS'}
            </div>
          </div>

          {/* Detail */}
          <div className="p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pajak Penghasilan (PPH)</p>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">Kategori: {cat}</p>
                <p className="text-[10px] text-slate-500 italic">Income: Rp {fmt(inc)}</p>
              </div>
              <p className="text-white font-mono font-bold">Rp {fmt(d.pph)}</p>
            </div>

            <div className="flex justify-between items-start border-t border-white/5 pt-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pajak Bumi & Bangunan (PBB)</p>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">Tipe Aset: {aset}</p>
              </div>
              <p className="text-white font-mono font-bold">Rp {fmt(pbb)}</p>
            </div>

            <div className="flex justify-between items-start border-t border-white/5 pt-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pajak Bisnis (5%)</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">Omzet Kotor: Rp {fmt(omzet)}</p>
              </div>
              <p className="text-white font-mono font-bold">Rp {fmt(biz)}</p>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Iuran Kesehatan Wajib</span>
                <span className="text-xs text-slate-300 font-mono">Rp 200.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Jaringan & Server</span>
                <span className="text-xs text-slate-300 font-mono">Rp 100.000</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 mt-2 pt-2">
                <span className="text-[10px] text-indigo-400 uppercase font-bold">Total Layanan</span>
                <span className="text-sm text-white font-mono font-bold">Rp 300.000</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Total Tagihan</span>
                <span className="text-white font-bold font-mono">Rp {fmt(d.total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400 font-bold">Uang Diterima</span>
                <span className="text-emerald-400 font-bold font-mono">Rp {fmt(bayar)}</span>
              </div>
              <div className="border-t border-dashed border-white/20 pt-2 flex justify-between items-center">
                <span className="text-red-400 font-bold uppercase text-xs tracking-widest">Sisa Hutang</span>
                <span className="text-red-500 font-black text-xl font-mono">Rp {fmt(hutang)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => navigate('view-warga')}
              className="w-full py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition text-xs uppercase tracking-widest"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Cek Warga Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
