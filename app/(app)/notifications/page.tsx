'use client';

import { useNotifications } from '@/lib/notification-context';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead, clearAll } = useNotifications();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} unread of {notifications.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>done_all</span>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="notion-button border border-border text-sm text-muted-foreground hover:text-foreground">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>delete_outline</span>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="card-base overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons-outlined text-muted-foreground/40 block mb-3" style={{ fontSize: 40 }}>notifications_none</span>
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={n.id}
              className={`flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors ${i < notifications.length - 1 ? 'border-b border-border/40' : ''} ${!n.read ? 'bg-muted/10' : ''}`}>
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-foreground/10' : 'bg-muted'}`}>
                <span className={`material-icons-outlined ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontSize: 16 }}>notifications</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                {n.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read ? (
                  <button onClick={() => markAsRead(n.id)} title="Mark as read"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors whitespace-nowrap">
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>done_all</span>
                    Mark read
                  </button>
                ) : (
                  <button onClick={() => markAsUnread(n.id)} title="Mark as unread"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors whitespace-nowrap">
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>undo</span>
                    Unread
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
