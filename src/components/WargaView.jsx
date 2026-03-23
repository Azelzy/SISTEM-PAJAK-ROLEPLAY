import { useState } from 'react';
import { API_URL, showToast } from '../utils';

export default function WargaView({ navigate }) {
  const [cekID, setCekID] = useState('');
  const [loading, setLoading] = useState(false);

  async function cekWarga() {
    if (!cekID) return showToast('Masukkan ID!', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=cekWarga&id=${cekID}&t=${Date.now()}`);
      const data = await res.json();
      setLoading(false);
      if (data.found) {
        navigate('view-result', data.data);
      } else {
        showToast('Data warga tidak ditemukan!', 'error');
      }
    } catch {
      setLoading(false);
      showToast('Gagal terhubung ke server.', 'error');
    }
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl relative overflow-hidden">
        <button
          onClick={() => navigate('view-landing')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition z-20"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 h-40 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center text-4xl text-indigo-500 border-4 border-indigo-500/30 shadow-2xl translate-y-12 relative z-10">
            <i className="fa-solid fa-magnifying-glass-dollar"></i>
          </div>
        </div>

        <div className="pt-16 pb-10 px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Tracking Pajak</h2>
          <p className="text-slate-400 text-sm mb-8">Masukkan data kependudukan untuk validasi.</p>
          <div className="space-y-6">
            <div className="relative text-left">
              <label className="text-[10px] font-bold text-indigo-400 ml-1 uppercase tracking-widest mb-2 block">Nomor ID (KTP)</label>
              <input
                type="number"
                value={cekID}
                onChange={e => setCekID(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cekWarga()}
                className="input-premium text-center text-2xl tracking-[0.2em] font-mono h-16"
                placeholder="00000"
              />
            </div>
            <button
              onClick={cekWarga}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-1 border border-indigo-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <><span className="spinner"></span>Loading...</> : <><i className="fa-solid fa-search mr-2"></i>Lacak Database</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
