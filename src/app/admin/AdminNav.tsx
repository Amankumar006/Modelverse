'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Models', href: '/admin/review' },
  { name: 'News', href: '/admin/news' },
  { name: 'Curators', href: '/admin/curators' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-daylight-card border-r border-daylight-muted/20 p-6 min-h-screen sticky top-0">
        <div className="font-bold text-xl text-daylight-text mb-8">Modelverse Admin</div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-daylight-accent",
                  isActive
                    ? "bg-daylight-accent-soft text-daylight-accent-contrast"
                    : "text-daylight-text hover:bg-daylight-muted/10 hover:text-daylight-text"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-daylight-card border-t border-daylight-muted/20 flex justify-around p-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex-1 text-center py-3 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-daylight-accent",
                isActive
                  ? "text-daylight-accent bg-daylight-accent-soft/50"
                  : "text-daylight-muted hover:text-daylight-text"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
