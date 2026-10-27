'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, X, AlertCircle } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAr: boolean;
  isAdmin?: boolean;
}

export default function AdminPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  isAr,
  isAdmin = false,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setPassword('');
    setError(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0001') {
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(true);
      inputRef.current?.select();
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,103,192,0.15)] p-5 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isAdmin ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#0067c0]'
              }`}
            >
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isAdmin
                  ? isAr
                    ? 'تعطيل وضع الإدارة'
                    : 'Disable Admin Mode'
                  : isAr
                    ? 'تفعيل وضع الإدارة'
                    : 'Admin Authentication'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAdmin
                  ? isAr
                    ? 'أدخل كلمة المرور 0001 للتعطيل'
                    : 'Enter passcode 0001 to disable'
                  : isAr
                    ? 'أدخل كلمة المرور 0001 للمتابعة'
                    : 'Enter passcode 0001 to activate'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              {isAr ? 'رمز المرور' : 'Password / PIN'}
            </label>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-center text-lg font-mono tracking-widest outline-none transition-all ${
                error
                  ? 'border-rose-400 ring-3 ring-rose-100 text-rose-700'
                  : 'border-slate-200 focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15'
              }`}
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isAr ? 'كلمة المرور غير صحيحة' : 'Incorrect passcode. Try again.'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98]'
                  : 'bg-[#0067c0] hover:bg-[#005fb8] active:scale-[0.98]'
              }`}
            >
              {isAdmin
                ? isAr
                  ? 'تعطيل الإدارة'
                  : 'Disable Admin'
                : isAr
                  ? 'تأكيد'
                  : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
