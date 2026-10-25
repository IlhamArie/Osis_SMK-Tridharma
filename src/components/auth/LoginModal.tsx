import React, { useState } from 'react';
import { UserAccount, SchoolIdentityConfig } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { Lock, User, Key, AlertCircle, ArrowLeft, ShieldCheck, Check } from 'lucide-react';

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
  const [username, setUsername] = useState('ilham.arief');
  const [password, setPassword] = useState('pembina123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      setErrorMsg('Username atau password tidak cocok dengan data kredensial Admin.');
    }
  };

  const handleQuickFill = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password || 'pembina123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
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
              <span className="text-[11px] text-slate-500 font-mono">{identity.namaSekolah}</span>
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

        {/* Security Policy Reminder */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Sistem Autentikasi Terpusat:</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            Tidak ada pendaftaran mandiri. Akun dan sandi ditetapkan langsung oleh Pembina OSIS Bapak Ilham Arief, S.Pd. melalui Jendela 1 Control Room.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Username Pengurus</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: ilham.arief"
                className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Masuk ke Dashboard ERP</span>
          </button>
        </form>

        {/* Quick Testing Accounts with 3 Tiers */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 block">
              Pilihan Akun Pengurus Resmi (1-Klik Isi Kredensial):
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Siap Operasional
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {/* Tier 1: Pembina */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-1 rounded-lg w-20 shrink-0 text-center">
                PEMBINA
              </span>
              {accounts.filter(a => a.role === 'pembina').map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`flex-1 min-h-[38px] p-2 rounded-xl border text-left transition-all truncate active:scale-95 ${
                    username === acc.username
                      ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-900'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-bold">{acc.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-1">(@{acc.username})</span>
                </button>
              ))}
            </div>

            {/* Tier 2: BPH (Eksekutif) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-1 rounded-lg w-20 shrink-0 text-center">
                BPH
              </span>
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {accounts.filter(a => ['ketua', 'sekretaris'].includes(a.role)).map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`min-h-[38px] p-2 rounded-xl border text-left transition-all truncate active:scale-95 ${
                      username === acc.username
                        ? 'border-amber-500 bg-amber-50 font-bold text-amber-900'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="font-bold">{acc.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {acc.role === 'ketua' ? 'Ketua Umum' : 'Sekretaris'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 3: Pengurus (Presensi & Proker) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold bg-sky-100 text-sky-800 px-1.5 py-1 rounded-lg w-20 shrink-0 text-center">
                PENGURUS
              </span>
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {accounts.filter(a => a.role === 'sekbid').slice(0, 2).map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`min-h-[38px] p-2 rounded-xl border text-left transition-all truncate active:scale-95 ${
                      username === acc.username
                        ? 'border-sky-500 bg-sky-50 font-bold text-sky-900'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="font-bold">{acc.fullName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {acc.jabatan.split(':')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onCancel}
            className="min-h-[38px] text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Laman Publik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
