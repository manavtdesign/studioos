'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DesignerProvider } from '@/lib/designer-context';
import { SettingsProvider } from '@/lib/settings-context';
import { CrmProvider } from '@/lib/crm-context';
import { ProjectsProvider } from '@/lib/projects-context';
import { NotificationProvider } from '@/lib/notification-context';
import { ActivityProvider } from '@/lib/activity-context';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from '@/components/UserMenu';
import { GlobalSearch } from '@/components/GlobalSearch';

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/projects', icon: 'folder', label: 'Projects' },
  { href: '/products', icon: 'bookmark', label: 'Products Library' },
  { href: '/contacts', icon: 'recent_actors', label: 'Contacts' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
];

function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

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

        {/* Search Button */}
        <div className="px-2 pt-1 pb-2 flex-shrink-0">
          <button
            onClick={() => setShowSearch(true)}
            className="sidebar-item sidebar-item-hover w-full"
          >
            <span className="material-icons-outlined nav-icon" style={{ fontSize: 18 }}>search</span>
            <span className="nav-label" style={{ fontSize: 15 }}>Search</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-hover'}`}>
                <span className="material-icons-outlined nav-icon" style={{ fontSize: 18 }}>{item.icon}</span>
                <span className="nav-label" style={{ fontSize: 15 }}>{item.label}</span>
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

      {/* Global Search Side Panel */}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
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
              <ActivityProvider>
                <AppLayoutInner>{children}</AppLayoutInner>
              </ActivityProvider>
            </NotificationProvider>
          </ProjectsProvider>
        </CrmProvider>
      </DesignerProvider>
    </SettingsProvider>
  );
}
