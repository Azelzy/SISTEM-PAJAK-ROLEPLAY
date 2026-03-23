import { useState, useEffect } from 'react';
import IntroOverlay from './components/IntroOverlay';
import LandingView from './components/LandingView';
import WargaView from './components/WargaView';
import ResultView from './components/ResultView';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import DashboardView from './components/DashboardView';
import OTPModal from './components/OTPModal';
import { API_URL, showToast } from './utils';

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [currentView, setCurrentView] = useState('view-landing');
  const [resultData, setResultData] = useState(null);

  // Auth state
  const [petugas, setPetugas] = useState('');
  const [role, setRole] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tempAuthData, setTempAuthData] = useState({});

  // OTP Modal state
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Load toastify script dynamically
  useEffect(() => {
    if (!window.Toastify) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  function navigate(viewId, data) {
    if (viewId === 'view-result' && data) setResultData(data);
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function checkAuthAndNavigate() {
    const storedPetugas = localStorage.getItem('petugas');
    const storedRole = localStorage.getItem('role');
    if (storedPetugas) {
      setPetugas(storedPetugas);
      setRole(storedRole || '');
      navigate('view-dashboard');
      showToast(`Selamat datang kembali, ${storedPetugas} 👋`);
    } else {
      navigate('view-login-admin');
    }
  }

  async function processAuth(type, captchaResult) {
    let data = {};

    if (type === 'login') {
      data.email = document.getElementById('loginEmail').value;
      data.username = document.getElementById('loginUser').value;
      data.password = document.getElementById('loginPass').value;
      if (!data.email || !data.username || !data.password) return showToast('Isi semua form login!', 'error');
    } else {
      data.email = document.getElementById('regEmail').value;
      data.fullname = document.getElementById('regFullname').value;
      data.username = document.getElementById('regUserNew').value;
      data.password = document.getElementById('regPassNew').value;
      const passConf = document.getElementById('regPassConf').value;
      const captchaAns = parseInt(document.getElementById('captchaAns').value);

      if (data.password !== passConf) return showToast('Password tidak sama!', 'error');
      if (captchaAns !== captchaResult) return showToast('Captcha salah!', 'error');
      if (!data.email || !data.username) return showToast('Isi data lengkap!', 'error');
    }

    const authPayload = { ...data, type };
    setTempAuthData(authPayload);
    setAuthLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'requestOTP', email: data.email, type }),
      }).then(r => r.json());

      setAuthLoading(false);
      if (res.success) {
        setOtpEmail(data.email);
        setOtpVisible(true);
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      setAuthLoading(false);
      showToast('Gagal koneksi server', 'error');
    }
  }

  async function submitOTP() {
    const otp = document.getElementById('otpCode').value;
    if (!otp) return showToast('Masukkan Kode!', 'error');

    setOtpLoading(true);
    const actionType = tempAuthData.type === 'login' ? 'verifyLogin' : 'verifySignup';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ ...tempAuthData, otp, action: actionType }),
      }).then(r => r.json());

      setOtpLoading(false);
      if (res.success) {
        closeOTP();
        if (tempAuthData.type === 'login') {
          localStorage.setItem('petugas', res.petugas);
          localStorage.setItem('role', res.role);
          setPetugas(res.petugas);
          setRole(res.role);
          navigate('view-dashboard');
          showToast(`Selamat datang, ${res.petugas}! 👋`);
        } else {
          showToast(res.message);
          navigate('view-login-admin');
        }
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      setOtpLoading(false);
      showToast('Gagal verifikasi', 'error');
    }
  }

  function closeOTP() {
    setOtpVisible(false);
    const el = document.getElementById('otpCode');
    if (el) el.value = '';
  }

  const viewProps = { navigate };

  return (
    <>
      <div className="bg-mesh"></div>

      <IntroOverlay visible={introVisible} />

      <OTPModal
        visible={otpVisible}
        emailTarget={otpEmail}
        onSubmit={submitOTP}
        onClose={closeOTP}
        loading={otpLoading}
      />

      <div className="relative w-full min-h-screen">
        {currentView === 'view-landing' && (
          <LandingView navigate={navigate} checkAuthAndNavigate={checkAuthAndNavigate} />
        )}
        {currentView === 'view-warga' && (
          <WargaView navigate={navigate} />
        )}
        {currentView === 'view-result' && (
          <ResultView navigate={navigate} resultData={resultData} />
        )}
        {currentView === 'view-login-admin' && (
          <LoginView navigate={navigate} onProcessAuth={processAuth} loading={authLoading} />
        )}
        {currentView === 'view-signup' && (
          <SignupView navigate={navigate} onProcessAuth={processAuth} loading={authLoading} />
        )}
        {currentView === 'view-dashboard' && (
          <DashboardView navigate={navigate} petugas={petugas} role={role} />
        )}
      </div>
    </>
  );
}
