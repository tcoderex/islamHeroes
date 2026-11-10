'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Share2,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Globe,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { AppTheme } from '@/lib/theme';
import {
  ContactSettings,
  isMobileDevice,
  getMailtoHref,
  getGmailWebHref,
  getFacebookHref,
  getWhatsAppHref,
  formatWhatsAppDisplay,
  copyToClipboardSafe,
} from '@/lib/contactSettingsTypes';

interface ContactChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ContactSettings;
  isAr: boolean;
  theme?: AppTheme;
  isAdmin?: boolean;
  onOpenAdminContactSettings?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function ContactChoicesModal({
  isOpen,
  onClose,
  settings,
  isAr,
  theme = 'tgis',
  isAdmin = false,
  onOpenAdminContactSettings,
  onShowToast,
}: ContactChoicesModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'gmail' | 'facebook' | 'whatsapp' | null>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRamadan = theme === 'ramadan';
  const subjectText = isAr
    ? 'islamheroes - طلب حذف أو استفسار'
    : 'islamheroes - Inquiry or Removal Request';
  const whatsappGreeting = isAr
    ? 'السلام عليكم، أتواصل معكم بخصوص موقع islamheroes'
    : 'Hello, I am reaching out regarding islamheroes';

  const cleanGmail = settings.gmail.trim();
  const mailtoHref = getMailtoHref(cleanGmail, subjectText);
  const gmailWebHref = getGmailWebHref(cleanGmail, subjectText);
  const primaryGmailHref = isMobile ? mailtoHref : gmailWebHref;

  const facebookHref = getFacebookHref(settings.facebook);
  const whatsappHref = getWhatsAppHref(settings.whatsapp, whatsappGreeting);
  const whatsappDisplay = formatWhatsAppDisplay(settings.whatsapp);

  const handleCopy = async (
    e: React.MouseEvent,
    key: 'gmail' | 'facebook' | 'whatsapp',
    value: string,
    labelAr: string,
    labelEn: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;
    const ok = await copyToClipboardSafe(value);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      onShowToast?.(isAr ? `تم نسخ ${labelAr}` : `Copied ${labelEn}`);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${
            isRamadan
              ? 'bg-[#0b1724] border-amber-500/40 text-amber-50 shadow-[0_20px_60px_rgba(245,158,11,0.18)]'
              : 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_60px_rgba(0,103,192,0.15)]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isRamadan && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          )}

          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
              isRamadan
                ? 'border-amber-500/20 bg-[#0f2130]'
                : 'border-slate-100 bg-slate-50/80'
            }`}
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {isAr ? 'طرق التواصل المباشر' : 'Contact Options'}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                }`}
              >
                {isAr
                  ? 'اختر الوسيلة المناسبة للاستفسار أو طلب حذف شخصية'
                  : 'Choose your preferred channel for inquiries or removal'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isRamadan
                  ? 'border-amber-500/30 text-amber-200/80 hover:bg-white/10'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Choices List */}
          <div className="p-4 sm:p-5 space-y-3">
            {/* CHOICE 1: GMAIL (Mobile-safe mailto + Gmail Web + Copy) */}
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                isRamadan
                  ? 'border-amber-500/25 bg-[#102334]'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <a
                  href={cleanGmail ? primaryGmailHref : '#'}
                  target={cleanGmail && !isMobile ? '_blank' : undefined}
                  rel={cleanGmail && !isMobile ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (!cleanGmail) {
                      e.preventDefault();
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-bold">
                        1
                      </span>
                      <span className="font-bold text-sm">
                        {isAr ? 'البريد الإلكتروني (Gmail)' : 'Gmail'}
                      </span>
                      {cleanGmail && (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-mono truncate mt-0.5 ${
                        isRamadan ? 'text-amber-100/80' : 'text-slate-600'
                      }`}
                      dir="ltr"
                    >
                      {cleanGmail || (isAr ? 'لم يتم تحديد البريد' : 'No email configured')}
                    </p>
                  </div>
                </a>

                {cleanGmail && (
                  <button
                    type="button"
                    onClick={(e) =>
                      handleCopy(e, 'gmail', cleanGmail, 'البريد الإلكتروني', 'email address')
                    }
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      copiedKey === 'gmail'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isRamadan
                          ? 'border-amber-500/25 text-amber-200 hover:bg-white/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isAr ? 'نسخ الإيميل' : 'Copy email'}
                  >
                    {copiedKey === 'gmail' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Dual Mobile App + Web Compose fallback pills so every mobile works */}
              {cleanGmail && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center gap-2">
                  <a
                    href={mailtoHref}
                    className="flex-1 min-w-[125px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>{isAr ? 'تطبيق البريد (للجوال)' : 'Open Mail App'}</span>
                  </a>

                  <a
                    href={gmailWebHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 min-w-[115px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                      isRamadan
                        ? 'border-amber-500/30 bg-[#0b1724] text-amber-200 hover:bg-[#152a3d]'
                        : 'border-red-200 bg-white text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>{isAr ? 'Gmail متصفح' : 'Gmail Web'}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              )}
            </div>

            {/* CHOICE 2: FACEBOOK */}
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                isRamadan
                  ? 'border-amber-500/25 bg-[#102334] hover:border-blue-400/50'
                  : 'border-slate-200 bg-slate-50/70 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                {facebookHref ? (
                  <a
                    href={facebookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#1877F2]/15 border border-[#1877F2]/30 text-[#1877F2] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-[#1877F2]/15 text-[#1877F2] dark:text-blue-400 font-bold">
                          2
                        </span>
                        <span className="font-bold text-sm">
                          {isAr ? 'فيسبوك (Facebook)' : 'Facebook'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#1877F2] opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p
                        className={`text-xs font-mono truncate mt-0.5 ${
                          isRamadan ? 'text-amber-100/75' : 'text-slate-500'
                        }`}
                        dir="ltr"
                      >
                        {facebookHref.replace(/^https?:\/\//i, '')}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 min-w-0 flex-1 opacity-70">
                    <div className="w-11 h-11 rounded-2xl bg-slate-500/15 border border-slate-500/25 text-slate-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-slate-500/15 text-slate-500 font-bold">
                          2
                        </span>
                        <span className="font-bold text-sm">
                          {isAr ? 'فيسبوك (Facebook)' : 'Facebook'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr ? 'لم يتم إضافة رابط فيسبوك بعد' : 'Facebook link not set yet'}
                      </p>
                    </div>
                  </div>
                )}

                {facebookHref && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={facebookHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs transition-all active:scale-95"
                    >
                      {isAr ? 'فتح' : 'Open'}
                    </a>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleCopy(e, 'facebook', facebookHref, 'رابط فيسبوك', 'Facebook link')
                      }
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        copiedKey === 'facebook'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isRamadan
                            ? 'border-amber-500/25 text-amber-200 hover:bg-white/10'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isAr ? 'نسخ رابط فيسبوك' : 'Copy Facebook link'}
                    >
                      {copiedKey === 'facebook' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CHOICE 3: WHATSAPP */}
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                isRamadan
                  ? 'border-amber-500/25 bg-[#102334] hover:border-emerald-400/50'
                  : 'border-slate-200 bg-slate-50/70 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/35 text-[#16a34a] dark:text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-[#25D366]/15 text-[#16a34a] dark:text-[#25D366] font-bold">
                          3
                        </span>
                        <span className="font-bold text-sm">
                          {isAr ? 'واتساب (WhatsApp)' : 'WhatsApp'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#16a34a] opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p
                        className={`text-xs font-mono truncate mt-0.5 ${
                          isRamadan ? 'text-amber-100/80' : 'text-slate-600'
                        }`}
                        dir="ltr"
                      >
                        {whatsappDisplay}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600/60 dark:text-emerald-400/60 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600/70 font-bold">
                          3
                        </span>
                        <span className="font-bold text-sm">
                          {isAr ? 'واتساب (WhatsApp)' : 'WhatsApp'}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                        }`}
                      >
                        {isAr ? 'لم يتم إضافة رقم واتساب بعد' : 'WhatsApp not configured yet'}
                      </p>
                    </div>
                  </div>
                )}

                {whatsappHref ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white shadow-xs transition-all active:scale-95"
                    >
                      {isAr ? 'مراسلة' : 'Chat'}
                    </a>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleCopy(
                          e,
                          'whatsapp',
                          settings.whatsapp.trim() || whatsappHref,
                          'رقم الواتساب',
                          'WhatsApp contact'
                        )
                      }
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        copiedKey === 'whatsapp'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isRamadan
                            ? 'border-amber-500/25 text-amber-200 hover:bg-white/10'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isAr ? 'نسخ رقم واتساب' : 'Copy WhatsApp'}
                    >
                      {copiedKey === 'whatsapp' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  isAdmin &&
                  onOpenAdminContactSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminContactSettings();
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                    >
                      {isAr ? 'إضافة رقم' : 'Add Number'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Footer (Admin Quick Edit + Close) */}
          <div
            className={`px-5 py-3 border-t flex items-center justify-between gap-2 ${
              isRamadan
                ? 'border-amber-500/20 bg-[#0e1c2b]'
                : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            {isAdmin && onOpenAdminContactSettings ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminContactSettings();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isRamadan
                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                    : 'border-blue-200 bg-blue-50 text-[#0067c0] hover:bg-blue-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isAr ? 'تعديل الروابط في الإعدادات' : 'Edit Links in Settings'}</span>
              </button>
            ) : (
              <span
                className={`text-[11px] ${
                  isRamadan ? 'text-amber-200/50' : 'text-slate-400'
                }`}
              >
                {isAr ? 'islamheroes · خدمة التواصل' : 'islamheroes · Direct Support'}
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRamadan
                  ? 'bg-white/10 hover:bg-white/20 text-amber-100'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
