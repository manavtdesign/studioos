'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DesignerProvider } from '@/lib/designer-context';
import { SettingsProvider } from '@/lib/settings-context';
import { CrmProvider } from '@/lib/crm-context';
import { ProjectsProvider } from '@/lib/projects-context';
import { NotificationProvider } from '@/lib/notification-context';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from '@/components/UserMenu';

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/projects', icon: 'folder', label: 'Projects' },
  { href: '/products', icon: 'bookmark', label: 'Products Library' },
  { href: '/contacts', icon: 'recent_actors', label: 'Contacts' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
];

function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="StudioOS" width={175} height={76}
              style={{ width: 140, height: 'auto' }} priority />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-hover'}`}>
                <span className={`${active ? 'material-icons' : 'material-icons-outlined'} nav-icon`} style={{ fontSize: 17 }}>{item.icon}</span>
                <span className="nav-label text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Menu Bar */}
        <header className="h-14 flex-shrink-0 px-6 flex items-center justify-end gap-2.5">
          <NotificationCenter />
          <UserMenu />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 pb-6 pt-2">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <DesignerProvider>
        <CrmProvider>
          <ProjectsProvider>
            <NotificationProvider>
              <AppLayoutInner>{children}</AppLayoutInner>
            </NotificationProvider>
          </ProjectsProvider>
        </CrmProvider>
      </DesignerProvider>
    </SettingsProvider>
  );
}
