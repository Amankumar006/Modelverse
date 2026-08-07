'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414] text-[#E4E4E7] font-sans px-4">
      <div className="max-w-md w-full liquid-glass rounded-2xl p-8 text-center flex flex-col items-center animate-fade-rise">
        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-6 text-red-500">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h2 className="text-3xl mb-4 font-display text-[#F4F4F5] tracking-tight">Something went wrong</h2>
        <p className="text-[#D4D4D8] mb-8 text-base">
          An unexpected error has occurred. We&apos;ve logged the issue and are looking into it.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#141414] font-semibold transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
