import React from 'react';
import {
  Bell,
  CheckCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckSquare,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';

interface NotificationsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { currentUser, showToast } = useAuth();
  const notifications = StorageService.getNotifications(currentUser.id);

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead(currentUser.id);
    showToast('All notifications marked as read');
  };

  const handleNotificationClick = (notif: any) => {
    StorageService.markNotificationRead(notif.id);
    if (notif.link_target) {
      onNavigate(notif.link_target.view, notif.link_target.id);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
      case 'announcement':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-purple-600" />;
      case 'test':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'recall':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div id="notifications-center-view" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Activity & Community Alerts
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Notifications
          </h1>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl transition cursor-pointer flex items-start gap-4 hover:bg-slate-50 ${
                !n.read_at ? 'bg-blue-50/40 font-medium' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getCategoryIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>

                {n.link_target && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 hover:underline">
                    <span>Open destination</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>

              {!n.read_at && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
