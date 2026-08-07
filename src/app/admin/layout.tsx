import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if they are a curator
  // Note: we use the standard authenticated client here, which respects RLS.
  // We do NOT use the service role key. The authenticated user can only read their own row
  // due to the RLS policy "users can read own curator profile".
  const { data: profile, error } = await supabase
    .from('curator_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-center shadow-sm">
          <div className="text-amber-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You are signed in as <strong className="text-gray-900 dark:text-white">{user.email}</strong>, but you do not have curator access.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, contact an administrator to be invited to the curation team.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 flex justify-between items-center">
        <div className="font-bold text-lg">Modelverse Admin</div>
        <div className="text-sm text-gray-500">
          Curator: {user.email} ({profile.role})
        </div>
      </header>
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}
