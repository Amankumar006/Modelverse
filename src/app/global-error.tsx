'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#141414] text-[#E4E4E7] font-sans antialiased m-0 p-0 flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-[#1C1C1E] border border-[#27272A] text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-[#F4F4F5]">Application Error</h2>
          <p className="text-[#A1A1AA] mb-6 text-sm leading-relaxed">
            An unexpected global error occurred. Please refresh or try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#141414] font-semibold text-sm transition-colors duration-200"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
