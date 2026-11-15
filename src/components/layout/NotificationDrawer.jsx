import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';

export default function NotificationDrawer({ open, onClose }) {
  const { activeMembership } = useDemoSession();
  const { state, markNotificationRead, markAllNotificationsRead } = useDemoAppState();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  if (!open || !activeMembership) return null;

  const roleNotifications = state.notifications.filter(
    (n) => n.roleKey === activeMembership.roleKey
  );
  const unreadCount = roleNotifications.filter((n) => !n.read).length;
  const displayed =
    filter === 'unread' ? roleNotifications.filter((n) => !n.read) : roleNotifications;

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);
    onClose();
    if (item.targetPath) {
      navigate(item.targetPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Notifications">
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-bold text-[#172554]">
                Notifications
              </h2>
              <p className="text-xs text-[#64748B] tabular-nums">
                {activeMembership.roleLabel} · {unreadCount} unread
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#172554] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-2.5 bg-[#F8FAFC]">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`min-h-[32px] rounded-md px-3 text-xs font-medium cursor-pointer ${
                filter === 'all' ? 'bg-[#172554] text-white' : 'text-[#64748B]'
              }`}
            >
              All ({roleNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`min-h-[32px] rounded-md px-3 text-xs font-medium cursor-pointer ${
                filter === 'unread' ? 'bg-[#172554] text-white' : 'text-[#64748B]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsRead(activeMembership.roleKey)}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-5 py-2">
          {displayed.length === 0 ? (
            <div className="py-12 text-center space-y-1.5">
              <p className="text-sm font-semibold text-[#172554]">No notifications</p>
              <p className="text-xs text-[#64748B]">
                {filter === 'unread'
                  ? 'You have read all alerts for this role.'
                  : 'Notifications from submissions, reviews, and approvals appear here.'}
              </p>
            </div>
          ) : (
            displayed.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNotificationClick(item)}
                className={`w-full py-4 text-left transition-colors cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 ${
                  !item.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#172554] leading-snug">
                    {item.title}
                  </p>
                  {!item.read && (
                    <span className="text-[11px] font-semibold text-[#2563EB] shrink-0">
                      Unread
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{item.body}</p>
                <p className="mt-1.5 font-mono text-[11px] text-[#64748B]">{item.time}</p>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
