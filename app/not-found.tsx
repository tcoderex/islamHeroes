import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-white text-center">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-slate-400 text-sm mb-4">The requested resource could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 text-xs font-bold bg-[#0067c0] hover:bg-[#005fb8] text-white rounded-xl transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
