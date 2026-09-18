import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { AuthModal } from './components/common/AuthModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { HomeView } from './components/pages/HomeView';
import { LearnView } from './components/pages/LearnView';
import { RecallDetailView } from './components/pages/RecallDetailView';
import { TaskView } from './components/pages/TaskView';
import { TestView } from './components/pages/TestView';
import { CodeLabView } from './components/pages/CodeLabView';
import { ProfileView } from './components/pages/ProfileView';
import { NotificationsView } from './components/pages/NotificationsView';
import { AdminDashboardView } from './components/pages/AdminDashboardView';
import { VSCodeEditorView } from './components/pages/VSCodeEditorView';
import { MessageCircle, Database, ShieldCheck, Heart, Code2 } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { toastMessage } = useAuth();
  
  // Check if opened as standalone VS Code window or direct link (?standalone=vscode or ?tab=vscode)
  const isDirectVSCode = typeof window !== 'undefined' && 
    (window.location.search.includes('standalone=vscode') || window.location.search.includes('view=vscode'));

  const [currentView, setCurrentView] = useState<string>(isDirectVSCode ? 'vscode' : 'home');
  const [activeParamId, setActiveParamId] = useState<string | undefined>(undefined);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    StorageService.initCloudSync();
  }, []);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setActiveParamId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in standalone window mode, render the full-bleed VS Code interface
  if (currentView === 'vscode' && isDirectVSCode) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] p-2 md:p-4 text-[#cccccc]">
        <VSCodeEditorView
          standalone={true}
          onBackToMain={() => {
            window.location.href = window.location.pathname;
          }}
        />
        {toastMessage && (
          <div
            id="global-toast-banner"
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'learn':
        return <LearnView onNavigate={handleNavigate} selectedCourseId={activeParamId} />;
      case 'recall':
        return <RecallDetailView recallId={activeParamId || 'recall_01'} onNavigate={handleNavigate} />;
      case 'task':
        return <TaskView taskId={activeParamId} onNavigate={handleNavigate} />;
      case 'test':
        return <TestView testId={activeParamId} onNavigate={handleNavigate} />;
      case 'code-lab':
        return <CodeLabView taskId={activeParamId} onNavigate={handleNavigate} />;
      case 'vscode':
        return (
          <VSCodeEditorView
            onBackToMain={() => handleNavigate('home')}
          />
        );
      case 'profile':
        return <ProfileView onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsView onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboardView onNavigate={handleNavigate} />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
      {/* Global Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main App Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderView()}

          {/* Footer with compliant advertising and community disclaimer */}
          <footer className="mt-12 pt-8 border-t border-slate-200/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700">LEARN2CODE</span>
              <span>•</span>
              <span>Free Community Coding Education Companion</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Plan A Architecture</span>
              </button>

              <a
                href="https://chat.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Room</span>
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      {/* Modals */}
      <AuthModal />
      <SupabaseModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          id="global-toast-banner"
          className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppLayout />
    </AuthProvider>
  );
}
