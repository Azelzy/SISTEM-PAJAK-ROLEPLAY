export default function LandingView({ navigate, checkAuthAndNavigate }) {
  return (
    <div className="page-enter min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl glass-panel rounded-[2.5rem] p-8 md:p-12 overflow-hidden animate__animated animate__fadeInUp">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Official JKC:RP Website
          </div>

          <div className="mb-12 relative text-center mx-auto z-10 animate__animated animate__fadeInDown">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-blue-600/40 blur-[70px] rounded-full -z-10"></div>
            <img
              src="/J-TAX.png"
              alt="Logo J-TAX Official"
              className="w-64 md:w-80 mx-auto hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 leading-none mt-2">
            Jakarta City Tax
          </h1>
          <p className="text-lg text-slate-400 font-light tracking-wide">
            Sistem Manajemen Pajak & Pendapatan Kota
          </p>
        </div>

        {/* Grid container for the two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative px-0 md:px-12">
          {/* Publik Area Card */}
          <div
            onClick={() => navigate('view-warga')}
            className="group cursor-pointer relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            
            <div className="flex flex-col items-center text-center relative z-10 flex-grow">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border border-white/5 flex items-center justify-center text-3xl text-indigo-400 mb-6 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg">
                <i className="fa-solid fa-users-viewfinder"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Publik Area</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Layanan mandiri untuk pengecekan status pajak dan tagihan warga.
              </p>
            </div>

            <span className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all text-center h-12 flex items-center justify-center mt-auto">
              Akses Data
            </span>
          </div>

          {/* Portal Petugas Card */}
          <div
            onClick={checkAuthAndNavigate}
            className="group cursor-pointer relative bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border border-indigo-500/20 hover:border-indigo-400/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_30px_rgba(0,0,0,0.2)] flex flex-col"
          >
            <div className="absolute top-4 right-4 text-indigo-500/10 text-6xl group-hover:rotate-12 transition-transform duration-500">
              <i className="fa-solid fa-fingerprint"></i>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10 flex-grow">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl text-white mb-6 group-hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-300">
                <i className="fa-solid fa-shield-cat"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Portal Petugas</h3>
              <p className="text-sm text-indigo-200/60 leading-relaxed mb-8">
                Login terenkripsi khusus pegawai pemerintah kota.
              </p>
            </div>

            <span className="w-full py-3 rounded-xl bg-indigo-600 text-xs font-bold text-white uppercase tracking-widest group-hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/50 text-center h-12 flex items-center justify-center mt-auto">
              Secure Login <i className="fa-solid fa-lock ml-2"></i>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-center gap-8 text-[15px] text-slate-500 font-mono uppercase tracking-wider border-t border-white/5 pt-6">
          <div className="flex items-center gap-2">
            © Jakarta City Roleplay (JKC:RP). All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}