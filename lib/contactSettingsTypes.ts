export interface ContactSettings {
  gmail: string;
  facebook: string;
  whatsapp: string;
  updatedAt: number;
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  gmail: 'tcoderex@gmail.com',
  facebook: 'https://www.facebook.com/share/1CLdpBtDRf/',
  whatsapp: '',
  updatedAt: 0,
};

/**
 * Detects mobile/touch user agents cleanly in the browser.
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|HarmonyOS/i.test(ua)) {
    return true;
  }
  // iPadOS 13+ reports Macintosh with touch points
  if (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}

/**
 * Builds standard mailto: URI using RFC 6068 percent-encoding (%20 instead of +)
 * so mobile Mail, Gmail, Samsung Email, and Outlook apps open with clean text.
 */
export function getMailtoHref(email: string, subject?: string, body?: string): string {
  const cleanEmail = email.trim();
  if (!cleanEmail) return '';
  const queryParts: string[] = [];
  if (subject) queryParts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) queryParts.push(`body=${encodeURIComponent(body)}`);
  return queryParts.length > 0 ? `mailto:${cleanEmail}?${queryParts.join('&')}` : `mailto:${cleanEmail}`;
}

/**
 * Builds Gmail Web compose URL (ideal for desktop browsers).
 */
export function getGmailWebHref(email: string, subject?: string, body?: string): string {
  const cleanEmail = email.trim();
  if (!cleanEmail) return '';
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: cleanEmail,
  });
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Normalizes a Facebook link or username into a clean HTTPS URL.
 */
export function getFacebookHref(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^(www\.)?(facebook\.com|fb\.com|m\.facebook\.com)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return `https://www.facebook.com/${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Normalizes a WhatsApp phone number or URL into a valid https://wa.me/... link.
 */
export function getWhatsAppHref(raw: string, prefillText?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  // Already a full WhatsApp URL
  if (/^https?:\/\//i.test(trimmed)) {
    if (prefillText && !trimmed.includes('text=') && !trimmed.includes('chat.whatsapp.com')) {
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}text=${encodeURIComponent(prefillText)}`;
    }
    return trimmed;
  }

  // Domain without protocol
  if (/^(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(trimmed)) {
    const withProtocol = `https://${trimmed}`;
    if (prefillText && !withProtocol.includes('text=') && !withProtocol.includes('chat.whatsapp.com')) {
      const separator = withProtocol.includes('?') ? '&' : '?';
      return `${withProtocol}${separator}text=${encodeURIComponent(prefillText)}`;
    }
    return withProtocol;
  }

  // Phone number input -> strip non-digits and leading 00
  let digits = trimmed.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (!digits || digits.length < 5) return '';

  const base = `https://wa.me/${digits}`;
  return prefillText ? `${base}?text=${encodeURIComponent(prefillText)}` : base;
}

/**
 * Friendly display formatting for WhatsApp number or link.
 */
export function formatWhatsAppDisplay(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\//i, '');
  }
  return trimmed;
}

/**
 * Reliable clipboard copy helper that works on both modern and older mobile browsers.
 */
export async function copyToClipboardSafe(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  } catch {
    // ignore
  }
  return false;
}
