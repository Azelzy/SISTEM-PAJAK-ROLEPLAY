export default function LoginView({ navigate, onProcessAuth, loading }) {
  return (
    <div className="page-enter min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel rounded-[2rem] p-8 relative">
        <button
          onClick={() => navigate('view-landing')}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="mb-10">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mb-5 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <i className="fa-solid fa-user-shield text-xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Login Petugas</h2>
          <p className="text-slate-400 text-sm">Otorisasi biometrik diperlukan.</p>
        </div>

        <div className="space-y-4">
          <input type="email" id="loginEmail" className="input-premium" placeholder="Email Dinas" />
          <input type="text" id="loginUser" className="input-premium" placeholder="Username" />
          <input type="password" id="loginPass" className="input-premium" placeholder="Password" />
          <button
            onClick={() => onProcessAuth('login')}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all border-t border-indigo-400/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><span className="spinner"></span>Loading...</> : 'Akses Dashboard'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('view-signup')}
            className="text-xs font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
          >
            Registrasi Petugas Baru
          </button>
        </div>
      </div>
    </div>
  );
}
