import { useEffect, useState } from 'react';

export default function SignupView({ navigate, onProcessAuth, loading }) {
  const [captchaQ, setCaptchaQ] = useState('? + ? = ?');
  const [captchaResult, setCaptchaResult] = useState(0);

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaResult(a + b);
    setCaptchaQ(`${a} + ${b} = ?`);
    const el = document.getElementById('captchaAns');
    if (el) el.value = '';
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  function handleSignup() {
    onProcessAuth('signup', captchaResult);
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel rounded-[2rem] p-8 relative border-t-4 border-t-emerald-500">
        <button
          onClick={() => navigate('view-login-admin')}
          className="absolute top-4 left-4 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
        </button>

        <h2 className="text-2xl font-bold text-white mt-8 text-center mb-1">Registrasi</h2>
        <p className="text-[10px] text-center text-emerald-400 uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
          Menunggu Approval Menteri
        </p>

        <div className="space-y-3">
          <input type="text" id="regFullname" className="input-premium" placeholder="Nama Lengkap" />
          <input type="email" id="regEmail" className="input-premium" placeholder="Email Aktif" />
          <input type="text" id="regUserNew" className="input-premium" placeholder="Username Desired" />
          <div className="grid grid-cols-2 gap-3">
            <input type="password" id="regPassNew" className="input-premium" placeholder="Password" />
            <input type="password" id="regPassConf" className="input-premium" placeholder="Confirm" />
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-white/10 mt-2">
            <span className="text-xs font-bold text-slate-400">
              Human Check: <span className="text-white text-sm ml-1 font-mono">{captchaQ}</span>
            </span>
            <input
              type="number"
              id="captchaAns"
              className="w-16 p-1 text-center border border-white/20 rounded bg-slate-700 text-white font-bold text-sm focus:bg-slate-600 outline-none"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 mt-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><span className="spinner"></span>Loading...</> : 'Request Access OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
