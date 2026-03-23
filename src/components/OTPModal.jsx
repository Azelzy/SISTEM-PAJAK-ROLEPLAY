export default function OTPModal({ visible, emailTarget, onSubmit, onClose, loading }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate__animated animate__zoomIn">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Verifikasi Email</h3>
        <p className="text-sm text-slate-400 mb-6">
          Kode OTP telah dikirim ke: <br />
          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{emailTarget}</span>
        </p>

        <input
          type="number"
          id="otpCode"
          className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] bg-black/30 text-white border-2 border-slate-600 rounded-xl mb-6 focus:border-blue-500 outline-none transition-colors"
          placeholder="000000"
        />

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <><span className="spinner"></span>Loading...</> : 'Verifikasi'}
        </button>
        <button
          onClick={onClose}
          className="mt-4 text-xs text-slate-500 font-bold uppercase hover:text-white transition-colors block w-full"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
