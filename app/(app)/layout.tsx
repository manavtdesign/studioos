'use client';

import { ReactNode, useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { DesignerProvider } from '@/lib/designer-context';
import { NotificationProvider } from '@/lib/notification-context';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from '@/components/UserMenu';
import { mockProjects } from '@/lib/projects-data';
import { mockClients } from '@/lib/crm-data';

const USER_NAME = 'Ellie Sanders';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <span className="material-icons-outlined" style={{ fontSize: 18 }}>
        {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

const topNav = [
  { href: '/dashboard', iconFilled: 'dashboard', iconOutlined: 'dashboard', label: 'Dashboard' },
  { href: '/projects', iconFilled: 'folder', iconOutlined: 'folder_open', label: 'Projects' },
];
const crmChildren = [
  { href: '/crm/leads', label: 'Leads' },
  { href: '/crm/clients', label: 'Clients' },
];
const bottomNav = [
  { href: '/procurement', iconFilled: 'store', iconOutlined: 'store', label: 'Vendor Library' },
  { href: '/tasks', iconFilled: 'task_alt', iconOutlined: 'task_alt', label: 'Tasks' },
  { href: '/finance', iconFilled: 'receipt_long', iconOutlined: 'receipt_long', label: 'Finance' },
];

interface NavItemProps { href: string; iconFilled: string; iconOutlined: string; label: string; active: boolean }

function NavItem({ href, iconFilled, iconOutlined, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`sidebar-item ${active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
    >
      <span className={`nav-icon ${active ? 'material-icons' : 'material-icons-outlined'}`}>{active ? iconFilled : iconOutlined}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

// ── Global Search ────────────────────────────────────────────────────────────

type SearchResult = { type: string; label: string; sub?: string; href: string };

const hardcodedTasks: SearchResult[] = [
  { type: 'Tasks', label: 'Kitchen Layout Review', sub: 'Hampton Residence', href: '/tasks' },
  { type: 'Tasks', label: 'Material Board Presentation', sub: 'Darling Point Apartment', href: '/tasks' },
  { type: 'Tasks', label: 'Site Measure', sub: 'Vaucluse House', href: '/tasks' },
];

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', key); };
  }, []);

  const results = useMemo((): { group: string; items: SearchResult[] }[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const projectResults: SearchResult[] = mockProjects
      .filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ type: 'Projects', label: p.name, sub: p.address, href: `/projects/${p.id}` }));

    const clientResults: SearchResult[] = mockClients
      .filter(c => c.primaryContact.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({ type: 'Clients', label: c.primaryContact, sub: c.company, href: `/crm/clients/${c.id}` }));

    const taskResults: SearchResult[] = hardcodedTasks
      .filter(t => t.label.toLowerCase().includes(q))
      .slice(0, 3);

    const grouped: { group: string; items: SearchResult[] }[] = [];
    if (projectResults.length) grouped.push({ group: 'Projects', items: projectResults });
    if (clientResults.length) grouped.push({ group: 'Clients', items: clientResults });
    if (taskResults.length) grouped.push({ group: 'Tasks', items: taskResults });
    return grouped;
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      window.location.href = results[0].items[0].href;
    }
  };

  function Highlight({ text }: { text: string }) {
    const q = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1 || !query) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-foreground/10 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div className="relative w-56" ref={ref}>
      <div className="relative">
        <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted/40 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
        />
      </div>
      {open && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-xl z-[60] overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
          ) : (
            <div className="max-h-72 overflow-y-auto dropdown-scroll">
              {results.map(({ group, items }) => (
                <div key={group}>
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/30">
                    {group}
                  </p>
                  {items.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground leading-tight">
                          <Highlight text={item.label} />
                        </p>
                        {item.sub && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.sub}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Layout ──────────────────────────────────────────────────────────────

function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCrmActive = pathname.startsWith('/crm');

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <span className="text-background text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">StudioOS</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {/* Top nav */}
          {topNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}

          {/* CRM — static section heading */}
          <div className="pt-4 pb-1 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">CRM</p>
          </div>
          {crmChildren.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`sidebar-item pl-4 ${isActive(child.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <span className={`nav-icon ${isActive(child.href) ? 'material-icons' : 'material-icons-outlined'}`}>
                {child.href === '/crm/leads' ? 'person_add' : 'people'}
              </span>
              <span className="nav-label">{child.label}</span>
            </Link>
          ))}

          <div className="pt-2" />

          {/* Bottom nav */}
          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 px-4 flex items-center justify-end gap-2">
          <GlobalSearch />
          <ThemeToggle />
          <NotificationCenter />
          <UserMenu />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 pb-6 pt-5">
            {children}
          </div>
        </div>
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
