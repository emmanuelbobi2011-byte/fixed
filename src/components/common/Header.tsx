import React, { useState } from 'react';
import { BookOpen, Bell, Flame, Zap, LogOut, ChevronDown, Crown, MessageCircle, Code2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { currentUser, firebaseUser, isAdmin, logout, setShowAuthModal, presenceList } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = StorageService.getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read_at).length;
  const onlineCount = presenceList.length;

  const userInitials = (currentUser.display_name || currentUser.username || 'ST')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const goTo = (view: string) => {
    setShowNotifications(false);
    setShowProfileMenu(false);
    onNavigate(view);
  };

  return (
    <header
      id="app-global-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => goTo('home')}
          className="flex items-center gap-2 text-left shrink-0 cursor-pointer"
          aria-label="Go to home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
              LEARN<span className="text-blue-600">2</span>CODE
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-0.5">
              Free Community Coding Hub
            </p>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-2">
          {onlineCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} Online
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-medium text-blue-700">
            <MessageCircle className="w-3 h-3" /> WhatsApp Classroom
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" /> {currentUser.streak_days}d
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-blue-600 font-bold">
              <Zap className="w-3.5 h-3.5 fill-blue-500" /> {currentUser.xp_points} XP
            </span>
          </div>

          <button
            type="button"
            onClick={() => goTo('vscode')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === 'vscode' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            aria-label="Open VS Code"
          >
            <Code2 className="w-4 h-4 text-blue-300" />
            <span className="hidden sm:inline">VS Code</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => goTo('admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" /> Admin Hub
            </button>
          )}

          {!firebaseUser && (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(value => !value)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between">
                  <strong className="text-xs text-slate-800">Community Alerts</strong>
                  <span className="text-[11px] text-slate-400">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-5 text-center text-xs text-slate-400">No notifications at this time</p>
                  ) : notifications.map(notification => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        StorageService.markNotificationRead(notification.id);
                        setShowNotifications(false);
                        if (notification.link_target) onNavigate(notification.link_target.view, notification.link_target.id);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-800">{notification.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notification.body}</p>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => goTo('notifications')} className="w-full text-center text-xs font-semibold text-blue-600 p-2 cursor-pointer">
                  View all notifications
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(value => !value)}
              className="flex items-center gap-1 p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Open profile menu"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {userInitials}
              </span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="p-3 border-b border-slate-100">
                  <p className="font-bold text-sm text-slate-800 truncate">{currentUser.display_name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email || `@${currentUser.username}`}</p>
                </div>
                <button type="button" onClick={() => goTo('profile')} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">My Student Profile</button>
                {isAdmin && <button type="button" onClick={() => goTo('admin')} className="w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer">Admin Management Hub</button>}
                <button type="button" onClick={() => { setShowProfileMenu(false); setShowAuthModal(true); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">Switch Account / Sign In</button>
                <button type="button" onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
