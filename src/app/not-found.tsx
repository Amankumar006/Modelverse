import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414] text-[#E4E4E7] font-sans px-4">
      <div className="max-w-md w-full liquid-glass rounded-2xl p-8 text-center flex flex-col items-center animate-fade-rise">
        <div className="text-[#10B981] font-display text-5xl mb-4">404</div>
        <h2 className="text-3xl mb-4 font-display text-[#F4F4F5] tracking-tight">Page Not Found</h2>
        <p className="text-[#D4D4D8] mb-8 text-base leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-6 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#141414] font-semibold transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
