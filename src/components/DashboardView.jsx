import { useState, useEffect } from 'react';
import { API_URL, fmt, formatCurrencyInput, parseLocaleNumber, calcTax } from '../utils';

// Komponen Toast sederhana (fixed overlay di tengah atas)
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'error' ? 'bg-red-600/90' :
    type === 'success' ? 'bg-emerald-600/90' :
    'bg-indigo-600/90';

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] min-w-[320px] max-w-[90vw] animate-in fade-in zoom-in duration-300">
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-6 backdrop-blur-md`}>
        <span className="font-medium text-base">{message}</span>
        <button
          onClick={onClose}
          className="text-white/90 hover:text-white text-2xl leading-none font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function DashboardView({ navigate, petugas, role }) {
  // Warga list state
  const [mergedWargaData, setMergedWargaData] = useState([]);
  const [filteredWarga, setFilteredWarga] = useState([]);
  const [wargaLoading, setWargaLoading] = useState(true);
  const [searchWarga, setSearchWarga] = useState('');

  // Selected warga state
  const [selectedID, setSelectedID] = useState('');
  const [selectedNama, setSelectedNama] = useState('');
  const [labelSelected, setLabelSelected] = useState('-');
  const [rawDebt, setRawDebt] = useState(0);
  const [debtDisplay, setDebtDisplay] = useState('Rp 0');

  // Tax inputs state
  const [income, setIncome] = useState('');
  const [propValue, setPropValue] = useState('0');
  const [hasBiz, setHasBiz] = useState(false);
  const [bizRevenue, setBizRevenue] = useState('');
  const [bayar, setBayar] = useState('');

  // Calc results
  const [taxCalc, setTaxCalc] = useState({
    inc: 0, pph: 0, cls: 'Miskin (0%)', pbb: 0, biz: 0, util: 300000, hutang: 0, total: 300000
  });
  const [isPaid, setIsPaid] = useState(false);

  // Pending users (admin panel)
  const [pendingUsers, setPendingUsers] = useState([]);

  // Tax table
  const [taxData, setTaxData] = useState([]);
  const [searchTable, setSearchTable] = useState('');
  const [filteredTax, setFilteredTax] = useState([]);

  // Submit loading
  const [submitLoading, setSubmitLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadUsers();
    if (role === 'admin') loadPendingUsers();
  }, []);

  useEffect(() => {
    const result = calcTax({
      income,
      propValue,
      bizRevenue: hasBiz ? bizRevenue : '0',
      rawDebt
    });
    setTaxCalc(result);

    const bayarNum = parseLocaleNumber(bayar);
    setIsPaid(bayarNum === result.total && result.total > 0);
  }, [income, propValue, hasBiz, bizRevenue, rawDebt, bayar]);

  useEffect(() => {
    if (!searchWarga) {
      setFilteredWarga(mergedWargaData);
    } else {
      const q = searchWarga.toLowerCase();
      setFilteredWarga(
        mergedWargaData.filter(w =>
          w.nama.toLowerCase().includes(q) || w.id.includes(q)
        )
      );
    }
  }, [searchWarga, mergedWargaData]);

  useEffect(() => {
    if (!searchTable) {
      setFilteredTax(taxData);
    } else {
      const q = searchTable.toLowerCase();
      setFilteredTax(
        taxData.filter(t =>
          String(t.nama).toLowerCase().includes(q) || String(t.id).includes(q)
        )
      );
    }
  }, [searchTable, taxData]);

  async function loadUsers() {
    setWargaLoading(true);
    try {
      const [usersRes, taxRes] = await Promise.all([
        fetch(`${API_URL}?action=getUsers&t=${Date.now()}`).then(r => r.json()),
        fetch(`${API_URL}?action=getTaxReport&t=${Date.now()}`).then(r => r.json()),
      ]);

      setTaxData(taxRes);
      setFilteredTax(taxRes);

      const merged = [];
      if (Array.isArray(usersRes)) {
        usersRes.forEach(user => {
          const nama = user[0];
          const id = String(user[1]);
          const taxInfo = taxRes.find(t => String(t.id) === id);
          merged.push({ nama, id, status: taxInfo ? taxInfo.status : 'Belum Bayar' });
        });
      }
      setMergedWargaData(merged);
      setFilteredWarga(merged);
    } catch {
      showToast('Gagal memuat data server.', 'error');
    }
    setWargaLoading(false);
  }

  async function loadPendingUsers() {
    try {
      const data = await fetch(`${API_URL}?action=getPendingUsers`).then(r => r.json());
      setPendingUsers(data);
    } catch {}
  }

  async function approve(row) {
    if (!confirm('Terima user ini?')) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'approveOfficer', row })
      }).then(r => r.json());
      showToast(res.message, res.success ? 'success' : 'error');
      loadPendingUsers();
    } catch {
      showToast('Gagal approve user', 'error');
    }
  }

  async function selectWarga(id, nama) {
    setSelectedID(id);
    setSelectedNama(nama);
    setLabelSelected(`${nama} (${id})`);
    setSearchWarga(nama);
    setDebtDisplay('Loading...');
    setRawDebt(0);
    try {
      const res = await fetch(`${API_URL}?action=getDebt&id=${id}`).then(r => r.json());
      const hutang = res.debt || 0;
      setRawDebt(hutang);
      setDebtDisplay('Rp ' + fmt(hutang));
    } catch {
      setDebtDisplay('Error');
      showToast('Gagal memuat hutang warga', 'error');
    }
  }

  async function regWarga() {
    const n = document.getElementById('regName')?.value;
    const i = document.getElementById('regID')?.value;
    if (!n || !i) return showToast('Isi nama dan ID warga!', 'error');

    setRegLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'registerWarga', name: n, id: i })
      }).then(r => r.json());
      showToast(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        document.getElementById('regName').value = '';
        document.getElementById('regID').value = '';
        loadUsers();
      }
    } catch {
      showToast('Gagal koneksi server', 'error');
    }
    setRegLoading(false);
  }

  function payFull() {
    setBayar(fmt(taxCalc.total));
  }

  function checkBayarInput(val) {
    const formatted = formatCurrencyInput(val);
    const num = parseLocaleNumber(formatted);
    if (num > taxCalc.total) {
      setBayar(fmt(taxCalc.total));
      showToast('Nominal tidak boleh melebihi total tagihan!', 'error');
    } else {
      setBayar(formatted);
    }
  }

  async function submitData() {
    if (!selectedID || !selectedNama) {
      return showToast('Pilih warga dari tabel terlebih dahulu!', 'error');
    }
    setSubmitLoading(true);
    const bayarNum = parseLocaleNumber(bayar);

    const payload = {
      action: 'simpanTransaksi',
      petugas,
      namaWarga: selectedNama,
      idWarga: selectedID,
      income: taxCalc.inc,
      taxPPH: taxCalc.pph,
      taxPBB: taxCalc.pbb,
      taxBiz: taxCalc.biz,
      utilitas: taxCalc.util,
      hutangLama: taxCalc.hutang,
      jmlBayar: bayarNum,
      totalFinal: taxCalc.total,
      statusBayar: isPaid ? 'Lunas' : 'Belum Lunas',
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(r => r.json());
      showToast(res.message, res.success ? 'success' : 'error');

      // Reset form
      setIncome('');
      setBizRevenue('');
      setPropValue('0');
      setBayar('');
      setHasBiz(false);
      setSearchWarga('');
      setSelectedNama('');
      setSelectedID('');
      setLabelSelected('-');
      setDebtDisplay('Rp 0');
      setRawDebt(0);
      setIsPaid(false);
      loadUsers();
    } catch {
      showToast('Gagal menyimpan transaksi', 'error');
    }
    setSubmitLoading(false);
  }

  function getStatusClass(status) {
    if (status === 'Lunas') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (status === 'Belum Lunas') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    return 'bg-slate-700 text-slate-400';
  }

  function getStatusIcon(status) {
    if (status === 'Lunas') return <i className="fa-solid fa-check ml-1"></i>;
    if (status === 'Belum Lunas') return <i className="fa-solid fa-xmark ml-1"></i>;
    return <i className="fa-solid fa-user ml-1"></i>;
  }

  return (
    <div className="page-enter min-h-screen relative">
      {/* Toast Popup Overlay */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-30 glass-panel border-x-0 border-t-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-building-columns text-sm"></i>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest">DASHBOARD</h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Officer: <span className="text-indigo-400">{petugas}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('view-landing')}
              className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 hover:text-white transition-all border border-white/10"
            >
              <i className="fa-solid fa-house mr-2"></i> HOME
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('petugas');
                localStorage.removeItem('role');
                navigate('view-landing');
                showToast('Berhasil Logout', 'success');
              }}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {role === 'admin' && (
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className="font-bold text-purple-400 text-sm uppercase tracking-wider">
                  <i className="fa-solid fa-crown mr-2"></i> Approval
                </h3>
                <button
                  onClick={loadPendingUsers}
                  className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500 hover:text-white transition"
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {pendingUsers.length === 0 ? (
                  <p className="text-xs text-gray-400">Tidak ada request.</p>
                ) : (
                  pendingUsers.map((p, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-purple-500/20 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-white">{p.nama}</div>
                        <div className="text-xs text-purple-300">@{p.username}</div>
                      </div>
                      <button
                        onClick={() => approve(p.row)}
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition"
                      >
                        ✓ ACC
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Warga Baru Panel */}
          <div className="relative group overflow-hidden glass-panel rounded-[2rem] p-6 transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-125"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-6">
                <i className="fa-solid fa-user-plus text-lg"></i>
              </div>
              <h3 className="text-xl font-bold text-white">Warga Baru</h3>
              <p className="text-slate-400 text-xs mb-6">Registrasi penduduk ke database.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Nama Lengkap</label>
                  <input type="text" id="regName" className="input-premium" placeholder="Sesuai KTP" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Nomor ID</label>
                  <input type="number" id="regID" className="input-premium" placeholder="Ex: 12003" />
                </div>
                <button
                  onClick={regWarga}
                  disabled={regLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-700 hover:bg-white hover:text-black text-white font-bold transition-all shadow-lg disabled:opacity-70"
                >
                  {regLoading
                    ? <><span className="spinner"></span>Loading...</>
                    : <><i className="fa-solid fa-plus mr-1"></i> Simpan Data</>}
                </button>
              </div>
            </div>
          </div>

          {/* Laporan Pajak */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Laporan Pajak</h3>
              <button onClick={loadUsers} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600 transition">
                <i className="fa-solid fa-rotate"></i>
              </button>
            </div>
            <div className="p-3">
              <input
                type="text"
                value={searchTable}
                onChange={e => setSearchTable(e.target.value)}
                placeholder="Cari laporan..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 mb-3"
              />
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-2 pl-4 text-left">Nama</th>
                    <th className="p-2 text-left font-mono">ID</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTax.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">Belum ada data transaksi.</td></tr>
                  ) : (
                    filteredTax.map((row, i) => {
                      const isLunas = row.status === 'Lunas';
                      return (
                        <tr key={i} className={`transition-colors border-b ${isLunas ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/10' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/10'}`}>
                          <td className="p-3 pl-4 text-white font-bold">{row.nama}</td>
                          <td className="p-3 text-slate-400 font-mono text-xs">{row.id}</td>
                          <td className="p-3 text-right font-mono text-slate-200">Rp {fmt(row.total)}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-black/20 ${isLunas ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isLunas ? <><i className="fa-solid fa-check-circle mr-1"></i>Lunas</> : <><i className="fa-solid fa-circle-xmark mr-1"></i>Belum</>}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Main Panel */}
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black text-white">Input Pajak</h2>
                <p className="text-slate-400 text-sm">Formulir transaksi perpajakan resmi.</p>
              </div>
              <div className="hidden md:block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                FORM: TAX-01
              </div>
            </div>

            <div className="space-y-8">
              {/* Warga Picker */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase ml-2 mb-2 block">Cari & Pilih Wajib Pajak</label>
                <div className="relative group mb-3">
                  <input
                    type="text"
                    value={searchWarga}
                    onChange={e => setSearchWarga(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Ketik Nama atau ID warga..."
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30">
                  <div className="grid grid-cols-12 gap-2 bg-white/5 p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-5">Nama Warga</div>
                    <div className="col-span-3 text-center">ID</div>
                    <div className="col-span-4 text-center">Status Terakhir</div>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {wargaLoading ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        <span className="spinner w-3 h-3"></span> Memuat Data...
                      </div>
                    ) : filteredWarga.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">Data warga kosong.</div>
                    ) : (
                      filteredWarga.map((w, i) => (
                        <div
                          key={i}
                          onClick={() => selectWarga(w.id, w.nama)}
                          className="grid grid-cols-12 gap-2 p-3 border-b border-white/5 hover:bg-white/10 cursor-pointer transition-colors group items-center"
                        >
                          <div className="col-span-5 font-bold text-sm text-slate-200 group-hover:text-white truncate">{w.nama}</div>
                          <div className="col-span-3 text-center font-mono text-xs text-slate-500">{w.id}</div>
                          <div className="col-span-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide block w-full ${getStatusClass(w.status)}`}>
                              {w.status} {getStatusIcon(w.status)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-slate-400">Terpilih: </span>
                    <span className="font-bold text-white">{labelSelected}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Hutang Lama:</span>
                    <span className="text-right text-red-400 font-mono font-bold text-sm">{debtDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Income & Properti */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    <i className="fa-solid fa-wallet mr-1"></i> Income Warga
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none z-10">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={income}
                      onChange={e => setIncome(formatCurrencyInput(e.target.value))}
                      className="input-premium pl-14 pr-5 text-lg font-mono tracking-wide text-right"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded">
                      {taxCalc.cls}
                    </span>
                    <span className="text-xs font-bold text-indigo-400">
                      PPH: {fmt(taxCalc.pph)}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    <i className="fa-solid fa-house mr-1"></i> Aset Properti
                  </label>
                  <div className="relative">
                    <select
                      value={propValue}
                      onChange={e => setPropValue(e.target.value)}
                      className="input-premium cursor-pointer appearance-none text-slate-200"
                    >
                      <option value="0">Tidak Ada Aset</option>
                      <option value="50000">Rumah Standart (50k)</option>
                      <option value="150000">Rumah Mewah (150k)</option>
                      <option value="200000">Bangunan Bisnis (200k)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="fa-solid fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                  <div className="text-right mt-2 px-1">
                    <span className="text-xs font-medium text-slate-500">PBB: <span className="text-slate-200 font-bold">Rp {fmt(taxCalc.pbb)}</span></span>
                  </div>
                </div>
              </div>

              {/* Bisnis */}
              <div
                className="border border-white/10 bg-white/5 rounded-2xl p-4 transition-all hover:bg-white/10 cursor-pointer"
                onClick={() => setHasBiz(v => !v)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                      <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Kepemilikan Bisnis</h4>
                      <p className="text-xs text-slate-500">Centang jika warga memiliki usaha aktif</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasBiz}
                    onChange={e => { e.stopPropagation(); setHasBiz(e.target.checked); }}
                    onClick={e => e.stopPropagation()}
                    className="w-5 h-5 accent-yellow-500 cursor-pointer rounded bg-slate-700 border-none"
                  />
                </div>

                {hasBiz && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate__animated animate__fadeIn" onClick={e => e.stopPropagation()}>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Total Omzet Kotor</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={bizRevenue}
                            onChange={e => setBizRevenue(formatCurrencyInput(e.target.value))}
                            className="input-premium pl-8 py-2 text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="text-right pb-2">
                        <p className="text-[10px] text-slate-500 uppercase">Pajak (5%)</p>
                        <p className="font-bold text-yellow-500">Rp {fmt(taxCalc.biz)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total & Submit */}
              <div className="mt-8 relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-900 to-indigo-950 p-8 shadow-2xl border border-indigo-500/30 group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/40 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.3em] mb-2">Total Wajib Bayar</p>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] font-mono">
                      Rp {fmt(taxCalc.total)}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">(Termasuk Hutang & Utilitas)</p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-6 max-w-sm mx-auto">
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 block text-center">
                      Jumlah Uang Diterima (Harus Pas)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={bayar}
                        onChange={e => checkBayarInput(e.target.value)}
                        className="w-full bg-slate-800 border border-emerald-500/30 rounded-lg py-3 pl-12 pr-16 text-emerald-300 font-mono font-bold text-center text-xl focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                        placeholder="0"
                      />
                      <button
                        onClick={payFull}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-2 py-1 rounded transition-colors uppercase font-bold tracking-wider"
                      >
                        FULL
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-2 italic">*Tidak boleh lebih dari total tagihan</p>
                  </div>

                  <div className="flex justify-center">
                    <div className={`inline-flex backdrop-blur-md rounded-xl p-1 border transition-all duration-500 ${isPaid ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="text-white text-sm font-bold px-8 py-2 text-center min-w-[200px]">
                        {isPaid ? '✅ LUNAS (PAID)' : '❌ TAGIHAN (UNPAID)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={submitData}
                disabled={submitLoading}
                className="w-full py-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] transition-all transform active:scale-95 border border-indigo-400/50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitLoading
                  ? <><span className="spinner"></span>Menyimpan...</>
                  : <><i className="fa-solid fa-paper-plane mr-2"></i>Submit Transaksi</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}