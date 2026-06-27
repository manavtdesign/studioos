'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/lib/notification-context';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const ref = useRef<HTMLDivElement>(null);
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, []);

  const filtered = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        title="Notifications"
      >
        {/* Icon responds to theme and read state */}
        <span
          className={`${hasUnread ? 'material-icons' : 'material-icons-outlined'} text-foreground`}
          style={{ fontSize: 20 }}
        >
          notifications
        </span>
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['all', 'unread'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${
                  tab === t ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'All' : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* Notification list — scrollbar inside rounded container */}
          <div className="max-h-80 overflow-y-auto dropdown-scroll">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                {tab === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            ) : (
              filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={() => markAsRead(n.id)}
                  onMarkUnread={() => markAsUnread(n.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onMarkUnread: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 ${
        !notification.read ? 'bg-muted/20' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
      )}
      {notification.read && <span className="w-2 flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${!notification.read ? 'font-medium' : ''}`}>
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{notification.description}</p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); notification.read ? onMarkUnread() : onMarkRead(); }}
        className={`text-xs text-muted-foreground hover:text-foreground transition-opacity flex-shrink-0 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        title={notification.read ? 'Mark unread' : 'Mark read'}
      >
        <span className="material-icons-outlined" style={{ fontSize: 14 }}>
          {notification.read ? 'mark_chat_unread' : 'done_all'}
        </span>
      </button>
    </div>
  );
}
