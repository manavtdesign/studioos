'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { DesignerProvider } from '@/lib/designer-context';
import { NotificationProvider } from '@/lib/notification-context';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from '@/components/UserMenu';

const topNav = [
  { label: 'Dashboard', iconFilled: 'space_dashboard', iconOutlined: 'space_dashboard', href: '/dashboard' },
  { label: 'Projects', iconFilled: 'folder', iconOutlined: 'folder_open', href: '/projects' },
];

const crmChildren = [
  { label: 'Leads', href: '/crm/leads' },
  { label: 'Clients', href: '/crm/clients' },
];

const bottomNav = [
  { label: 'Vendor Library', iconFilled: 'store', iconOutlined: 'store', href: '/procurement' },
  { label: 'Tasks', iconFilled: 'task_alt', iconOutlined: 'task_alt', href: '/tasks' },
  { label: 'Finance', iconFilled: 'account_balance_wallet', iconOutlined: 'account_balance_wallet', href: '/finance' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-14 h-7 rounded-full bg-muted" />;

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-[#333]' : 'bg-[#e0e0e0]'}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-1'}`}
      >
        <span className="material-icons-outlined" style={{ fontSize: 13, color: isDark ? '#444' : '#f59e0b' }}>
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </span>
    </button>
  );
}

interface NavItemProps {
  href: string;
  iconFilled: string;
  iconOutlined: string;
  label: string;
  active: boolean;
}

function NavItem({ href, iconFilled, iconOutlined, label, active }: NavItemProps) {
  return (
    <Link href={href} className={`sidebar-item ${active ? 'active' : ''}`}>
      {active ? (
        <span className="material-icons nav-icon" style={{ fontSize: 18 }}>{iconFilled}</span>
      ) : (
        <span className="material-icons-outlined nav-icon" style={{ fontSize: 18 }}>{iconOutlined}</span>
      )}
      <span className="nav-label">{label}</span>
    </Link>
  );
}

function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCrmActive = pathname.startsWith('/crm');
  const [crmOpen, setCrmOpen] = useState(isCrmActive);

  useEffect(() => {
    if (isCrmActive) setCrmOpen(true);
  }, [isCrmActive]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Permanent Sidebar */}
      <aside className="flex flex-col w-52 bg-card border-r border-border flex-shrink-0">
        <div className="h-14 flex items-center px-4">
          <span className="text-sm font-semibold text-foreground tracking-tight">Design Studio HQ</span>
        </div>

        <nav className="flex-1 px-2.5 pb-4 space-y-0.5 overflow-y-auto">
          {topNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}

          {/* CRM — single icon parent + children */}
          <div>
            <button
              onClick={() => setCrmOpen(!crmOpen)}
              className={`sidebar-item w-full ${isCrmActive ? 'active' : ''}`}
            >
              {isCrmActive ? (
                <span className="material-icons nav-icon" style={{ fontSize: 18 }}>people</span>
              ) : (
                <span className="material-icons-outlined nav-icon" style={{ fontSize: 18 }}>people</span>
              )}
              <span className="nav-label flex-1 text-left">CRM</span>
              <span className={`material-icons-outlined nav-icon transition-transform duration-150 ${crmOpen ? 'rotate-180' : ''}`} style={{ fontSize: 14 }}>
                expand_more
              </span>
            </button>

            {crmOpen && (
              <div className="ml-5 pl-2.5 border-l border-border mt-0.5 space-y-0.5">
                {crmChildren.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center px-2 py-1.5 rounded text-sm transition-colors ${
                      pathname.startsWith(child.href)
                        ? 'text-foreground font-medium bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        <header className="h-14 bg-background flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="search-input flex-1 max-w-md">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>search</span>
            <input
              type="text"
              placeholder="Search projects, clients, vendors and more"
              className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            <ThemeToggle />
            <NotificationCenter />
            <UserMenu />
          </div>
        </header>

        <div className="px-6 pb-6">{children}</div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DesignerProvider>
      <NotificationProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </NotificationProvider>
    </DesignerProvider>
  );
}
