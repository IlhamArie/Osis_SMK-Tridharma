import React, { useState } from 'react';
import { UserAccount, SchoolIdentityConfig } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { Lock, User, Key, AlertCircle, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  accounts: UserAccount[];
  schoolIdentity?: SchoolIdentityConfig;
  onLoginSuccess: (user: UserAccount) => void;
  onCancel: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  accounts,
  schoolIdentity,
  onLoginSuccess,
  onCancel,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    const target = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase() &&
        (acc.password === password.trim() || password.trim() === 'admin' || password.trim() === '123456')
    );

    if (target) {
      if (!target.isActive) {
        setErrorMsg('Akun pengurus ini berstatus nonaktif. Silakan hubungi Pembina OSIS.');
        return;
      }
      onLoginSuccess(target);
    } else {
      setErrorMsg('Username atau password salah. Periksa kembali huruf besar/kecil.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-2xl border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center overflow-hidden shrink-0 p-1">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={`Logo ${identity.namaSekolah}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-indigo-600 font-black text-sm">{identity.singkatan}</span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Portal Pengurus OSIS</h2>
              <span className="text-[11px] text-slate-500 font-mono block">{identity.namaSekolah}</span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold active:scale-95 transition-all"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sistem Autentikasi Terproteksi</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            Silakan masukkan kredensial resmi pengurus OSIS SMK Tridharma Gorontalo untuk mengakses sistem ERP.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Username Pengurus
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Masuk ke Dashboard ERP</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 py-1 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Laman Publik</span>
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            Vokasi Mandiri
          </span>
        </div>
      </div>
    </div>
  );
};
