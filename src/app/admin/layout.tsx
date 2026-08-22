import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from './AdminNav'; // We will create this client component
import { requireCurator } from '@/utils/supabase/require-curator';

export const metadata: Metadata = {
  title: "Admin | Modelverse",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single choke point for the whole /admin area: must be an authenticated
  // user WITH a curator_profiles row. Middleware only checks authentication;
  // this also enforces the curator role before any admin page renders.
  try {
    await requireCurator();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-daylight-bg flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-daylight-card border-b border-daylight-muted/20">
        <div className="font-bold text-lg text-daylight-text">Modelverse Admin</div>
        {/* We'll just put the nav links inline for mobile or rely on AdminNav client component */}
      </header>
      
      {/* Sidebar (Desktop) / Mobile Nav */}
      <AdminNav />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
