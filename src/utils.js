export const API_URL = "https://script.google.com/macros/s/AKfycbwG1pcOpcNoitNy0oIBjLq1MotsvGXKjtTlZpy_ndzBQ8sZYR1ZP1z5PbJIzE9U8e_G/exec";

export function fmt(n) {
  return new Intl.NumberFormat('id-ID').format(n);
}

export function formatCurrencyInput(value) {
  const raw = value.replace(/\D/g, '');
  if (!raw) return '';
  return new Intl.NumberFormat('id-ID').format(raw);
}

export function parseLocaleNumber(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/\./g, '')) || 0;
}

export function showToast(msg, type = 'info') {
  const bg = type === 'error'
    ? 'linear-gradient(to right, #ef4444, #b91c1c)'
    : 'linear-gradient(to right, #4f46e5, #06b6d4)';

  if (typeof window !== 'undefined' && window.Toastify) {
    window.Toastify({
      text: msg,
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: {
        background: bg,
        borderRadius: '12px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        fontWeight: '600',
        fontSize: '14px',
        padding: '12px 24px',
        color: 'white',
      },
    }).showToast();
  }
}

export function calcTax({ income, propValue, bizRevenue, rawDebt }) {
  const inc = parseLocaleNumber(income);
  let pph = 0, cls = 'Miskin (0%)';
  if (inc > 15000000) { pph = inc * 0.25; cls = 'Atas (25%)'; }
  else if (inc > 7000000) { pph = inc * 0.15; cls = 'Menengah Atas (15%)'; }
  else if (inc > 3000000) { pph = inc * 0.10; cls = 'Menengah Bawah (10%)'; }

  const pbb = parseFloat(propValue) || 0;
  const rev = parseLocaleNumber(bizRevenue);
  const biz = rev * 0.05;
  const hutang = parseFloat(rawDebt) || 0;
  const total = pph + pbb + biz + 300000 + hutang;

  return { inc, pph, cls, pbb, biz, util: 300000, hutang, total };
}
