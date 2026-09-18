import React from 'react';
import {
  Home,
  BookOpen,
  CheckSquare,
  Code2,
  HelpCircle,
  User,
  Bell,
  Crown,
  Database,
  MessageCircle,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenSupabaseModal }) => {
  const { isAdmin, presenceList } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home / Dashboard', icon: Home },
    { id: 'learn', label: 'Courses & Recalls', icon: BookOpen },
    { id: 'task', label: 'Practical Tasks', icon: CheckSquare },
    { id: 'test', label: 'Quizzes & Tests', icon: HelpCircle },
    { id: 'code-lab', label: 'Code Lab (IDE)', icon: Code2 },
    { id: 'vscode', label: 'VS Code (Web Beta)', icon: Code2, badge: 'Android' },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <aside
      id="app-desktop-sidebar"
      className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200/80 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
    >
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          Community Learning
        </p>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'learn' && currentView === 'recall');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Section (Only shown for detected Admins) */}
      {isAdmin && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-wider text-purple-700 uppercase mb-2 flex items-center justify-between">
            <span>Instructor / Admin</span>
            <Crown className="w-3 h-3 text-purple-500" />
          </p>

          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-50 bg-purple-50/50'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Admin Management</span>
          </button>
        </div>
      )}

      {/* Architecture & WhatsApp Hub card */}
      <div className="mt-auto pt-4 space-y-3">
        {/* Supabase Plan A Schema Helper */}
        <button
          type="button"
          onClick={onOpenSupabaseModal}
          className="w-full text-left p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 hover:bg-emerald-100/70 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Plan A • Supabase Ready</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1 leading-snug">
            View PostgreSQL schemas, RLS rules, and migration queries.
          </p>
        </button>

        {/* WhatsApp Teaching Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2 text-xs font-bold mb-1">
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>WhatsApp Classroom</span>
          </div>
          <p className="text-[11px] text-emerald-100 leading-relaxed mb-2.5">
            Lectures & Q&A run live on WhatsApp. Check recalls here after class!
          </p>
          <a
            href="https://chat.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white text-emerald-800 px-3 py-1 rounded-lg hover:bg-emerald-50 transition"
          >
            <span>Open Group</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
