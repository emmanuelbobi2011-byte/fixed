import React, { useState } from 'react';
import {
  BookOpen,
  Bell,
  Flame,
  Zap,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  Check,
  Crown,
  ExternalLink,
  MessageCircle,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { currentUser, firebaseUser, isAdmin, switchUser, profiles, logout, setShowAuthModal, presenceList } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = StorageService.getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read_at).length;
  const onlineCount = presenceList.length;

  const handleNotificationClick = (notifId: string, linkTarget?: { view: string; id?: string }) => {
    StorageService.markNotificationRead(notifId);
    setShowNotifications(false);
    if (linkTarget) {
      onNavigate(linkTarget.view, linkTarget.id);
    }
  };

  const userInitials = (currentUser.display_name || currentUser.username || 'ST')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-[#edf1ec] px-3 pt-3 pb-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#f5f5f5] border border-slate-200 rounded-full px-3 py-2 w-full shadow-sm">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200">
              <div className="w-3 h-3 rounded-md bg-slate-800/90" />
            </div>
            <span className="text-base font-semibold text-slate-800 tracking-tight truncate">7k.onrender.com</span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#f5f5f5] border border-slate-200 shadow-sm text-slate-800 text-2xl font-medium cursor-pointer"
            aria-label="Add"
          >
            +
          </button>

          <button
            type="button"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#f5f5f5] border border-slate-200 shadow-sm text-slate-700 cursor-pointer"
            aria-label="Menu"
          >
            <span className="flex flex-col items-center justify-center gap-[4px]">
              <span className="block w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="block w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="block w-1.5 h-1.5 rounded-full bg-slate-700" />
            </span>
          </button>
        </div>
      </header>

      <header
        id="app-global-header"
        className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    LEARN<span className="text-blue-600">2</span>CODE
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                    WhatsApp
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                  Free Community Coding Hub
                </p>
              </div>
            </button>

            {onlineCount > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 text-xs font-medium text-slate-600 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{onlineCount} Online</span>
              </div>
            )}

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 text-[11px] font-medium text-blue-700 border border-blue-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Cloud Sync Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1 text-amber-600 font-bold" title="Daily Learning Streak">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{currentUser.streak_days}d</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 text-blue-600 font-bold" title="Experience Points">
                <Zap className="w-3.5 h-3.5 fill-blue-500" />
                <span>{currentUser.xp_points} XP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('vscode')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1.5 shadow-xs ${
                currentView === 'vscode'
                  ? 'bg-slate-900 text-white ring-2 ring-blue-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title="Open VS Code Web Editor for Android & Browser"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">VS Code Beta</span>
              <span className="text-[9px] bg-blue-500 text-white font-mono px-1 rounded font-bold">
                Android
              </span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1.5 shadow-xs ${
                  currentView === 'admin'
                    ? 'bg-purple-700 text-white ring-2 ring-purple-300'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
                title="Open Admin Management Hub"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Hub</span>
              </button>
            )}

            {!firebaseUser && (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer shadow-xs"
              >
                <span>Sign In / Register</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="header-notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Community Alerts
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications at this time
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleNotificationClick(n.id, n.link_target)}
                          className={`w-full text-left p-3 hover:bg-slate-50 transition cursor-pointer flex gap-2.5 ${
                            !n.read_at ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                {Boolean(currentUser.avatar_url?.trim()) ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.display_name}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
                    {userInitials}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div
                  id="header-profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-800 truncate">{currentUser.display_name}</p>
                      {firebaseUser ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Firebase Live
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email || `@${currentUser.username}`}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currentUser.xp_points} XP
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      My Student Profile
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Admin Management Hub</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowAuthModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      Switch Account / Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1.5 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
