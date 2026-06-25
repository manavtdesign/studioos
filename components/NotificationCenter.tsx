'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/lib/notification-context';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
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

  const filtered = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 hover:bg-muted rounded-lg relative"
        title="Notifications"
      >
        {hasUnread ? (
          <span className="material-icons" style={{ fontSize: 20, color: '#333333' }}>notifications</span>
        ) : (
          <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 20, fontVariationSettings: '"wght" 200' }}>notifications</span>
        )}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-medium text-sm">Notifications</h3>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-2 text-sm transition-colors ${tab === 'all' ? 'text-foreground font-medium border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            <button
              onClick={() => setTab('unread')}
              className={`flex-1 py-2 text-sm transition-colors ${tab === 'unread' ? 'text-foreground font-medium border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markAsRead(notification.id)}
                  onMarkUnread={() => markAsUnread(notification.id)}
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
  const [showAction, setShowAction] = useState(false);

  return (
    <div
      className="relative px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      <div className="flex items-start gap-3">
        {!notification.read && (
          <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
        )}
        <div className={`flex-1 min-w-0 ${notification.read ? 'ml-5' : ''}`}>
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
        </div>
      </div>

      {/* Mark Read/Unread action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          notification.read ? onMarkUnread() : onMarkRead();
        }}
        className={`absolute bottom-2 right-3 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 ${showAction ? 'opacity-100' : 'opacity-0'}`}
      >
        {notification.read ? 'Mark Unread' : 'Mark Read'}
      </button>
    </div>
  );
}
