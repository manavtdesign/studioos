'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface LogoutDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function LogoutDialog({ onConfirm, onCancel }: LogoutDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 20 }}>logout</span>
            </div>
            <h3 className="font-semibold">Log Out</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to log out?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onCancel} className="notion-button border border-border text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="notion-button bg-foreground text-background hover:bg-foreground/90 text-sm">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    setOpen(false);
    // Mock logout - in real app would clear session
  };

  return (
    <>
      {showLogoutDialog && <LogoutDialog onConfirm={handleLogout} onCancel={() => setShowLogoutDialog(false)} />}

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          title="Account"
        >
          <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>person</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="font-medium text-sm">Ellie Sanders</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>settings</span>
                Settings
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  setShowLogoutDialog(true);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>logout</span>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
