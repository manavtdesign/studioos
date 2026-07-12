'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DesignerProvider } from '@/lib/designer-context';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { CrmProvider } from '@/lib/crm-context';
import { ProjectsProvider } from '@/lib/projects-context';

// ── Nav items ─────────────────────────────────────────────────────────────────
const topNav = [
  { href: '/dashboard', iconFilled: 'dashboard', iconOutlined: 'dashboard', label: 'Dashboard' },
  { href: '/projects', iconFilled: 'folder', iconOutlined: 'folder_open', label: 'Projects' },
];
const crmChildren = [
  { href: '/crm/leads', icon: 'person_add', label: 'Leads' },
  { href: '/crm/clients', icon: 'people', label: 'Clients' },
];
const librariesChildren = [
  { href: '/products', icon: 'inventory_2', label: 'Products' },
  { href: '/vendors', icon: 'store', label: 'Vendors' },
];
const bottomNav = [
  { href: '/tasks', icon: 'task_alt', label: 'Tasks' },
  { href: '/finance', icon: 'receipt_long', label: 'Finance' },
];

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

// ── Main Layout ───────────────────────────────────────────────────────────────
function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
    const active = isActive(href);
    return (
      <Link href={href}
        className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-hover text-muted-foreground'}`}>
        <span className={`${active ? 'material-icons' : 'material-icons-outlined'} nav-icon`} style={{ fontSize: 17 }}>{icon}</span>
        <span className="nav-label text-[13px]">{label}</span>
      </Link>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-border/60 sidebar-bg">
        {/* Logo — no border beneath */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="StudioOS" width={175} height={76}
              style={{ width: 140, height: 'auto' }} priority />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {topNav.map((item) => (
            <NavItem key={item.href} href={item.href} icon={isActive(item.href) ? item.iconFilled : item.iconOutlined} label={item.label} />
          ))}

          {/* CRM heading */}
          <div className="pt-4 pb-0.5 px-2.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#333333' }}>CRM</span>
          </div>
          <div className="flex items-start gap-0 pl-3">
            <div className="flex flex-col flex-1 space-y-0.5">
              {crmChildren.map((child) => {
                const active = isActive(child.href);
                return (
                  <Link key={child.href} href={child.href}
                    className={`sidebar-item pl-2 ${active ? 'sidebar-item-active' : 'sidebar-item-hover text-muted-foreground'}`}>
                    <span className={`${active ? 'material-icons' : 'material-icons-outlined'} nav-icon`} style={{ fontSize: 15 }}>{child.icon}</span>
                    <span className="nav-label text-[13px]">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Libraries heading */}
          <div className="pt-4 pb-0.5 px-2.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#333333' }}>Libraries</span>
          </div>
          <div className="flex items-start gap-0 pl-3">
            <div className="flex flex-col flex-1 space-y-0.5">
              {librariesChildren.map((child) => {
                const active = isActive(child.href);
                return (
                  <Link key={child.label} href={child.href}
                    className={`sidebar-item pl-2 ${active ? 'sidebar-item-active' : 'sidebar-item-hover text-muted-foreground'}`}>
                    <span className={`${active ? 'material-icons' : 'material-icons-outlined'} nav-icon`} style={{ fontSize: 15 }}>{child.icon}</span>
                    <span className="nav-label text-[13px]">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom nav heading */}
          <div className="pt-4 pb-0.5 px-2.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#333333' }}>Manage</span>
          </div>
          <div className="flex items-start gap-0 pl-3">
            <div className="flex flex-col flex-1 space-y-0.5">
              {bottomNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`sidebar-item pl-2 ${active ? 'sidebar-item-active' : 'sidebar-item-hover text-muted-foreground'}`}>
                    <span className={`${active ? 'material-icons' : 'material-icons-outlined'} nav-icon`} style={{ fontSize: 15 }}>{item.icon}</span>
                    <span className="nav-label text-[13px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Settings button at bottom */}
        <SidebarSettingsButton />
      </aside>

      {/* Main — no header bar, content moves up */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="px-6 pb-6 pt-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sidebar Settings Button (avatar + settings) ───────────────────────────────
function SidebarSettingsButton() {
  const { settings } = useSettings();
  const fullName = `${settings.firstName} ${settings.lastName}`.trim();
  const initials = getInitials(fullName);
  const pathname = usePathname();
  const active = pathname === '/settings';

  return (
    <div className="px-2 py-2 border-t border-border/30">
      <Link
        href="/settings"
        className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-hover text-muted-foreground'}`}
      >
        <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-semibold text-foreground select-none">{initials}</span>
        </div>
        <span className="nav-label text-[13px]">Settings</span>
      </Link>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <DesignerProvider>
        <CrmProvider>
          <ProjectsProvider>
            <AppLayoutInner>{children}</AppLayoutInner>
          </ProjectsProvider>
        </CrmProvider>
      </DesignerProvider>
    </SettingsProvider>
  );
}
