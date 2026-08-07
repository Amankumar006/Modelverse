'use client'

import { useState, Suspense, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlError = searchParams.get('error')
  
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  
  const [error, setError] = useState<string | null>(
    urlError === 'auth-callback-failed' ? 'The magic link was invalid or has expired. Please try again.' : null
  )
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0) return
    
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setError(error.message)
      if (error.message.toLowerCase().includes('rate limit')) {
        setCooldown(60)
      }
    } else {
      setStep('otp')
      setCooldown(60)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Curator Login</h1>
        
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-2 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Sending code...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                6-digit code
              </label>
              <p className="text-xs text-gray-500 mb-2">We sent a code to {email}</p>
              <input
                id="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-center tracking-widest text-lg"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full py-2 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setToken('')
                setError(null)
              }}
              className="w-full py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
