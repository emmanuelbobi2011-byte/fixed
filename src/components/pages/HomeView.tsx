import React from 'react';
import {
  Flame,
  Zap,
  BookOpen,
  Code2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  Clock,
  PlayCircle,
  Trophy,
  Trash2,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService, useStorageSync } from '../../services/storage';
import { WhatsAppBanner } from '../common/WhatsAppBanner';

interface HomeViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  useStorageSync(['courses', 'recalls', 'progress', 'submissions', 'announcements']);
  const { currentUser, isAdmin, showToast } = useAuth();
  const courses = StorageService.getCourses();
  const recalls = StorageService.getRecalls();
  const progressList = StorageService.getProgress(currentUser.id);
  const submissions = StorageService.getSubmissions(currentUser.id);
  const testAttempts = StorageService.getTestAttempts(currentUser.id);
  const announcements = StorageService.getAnnouncements();

  // Calculate overall progress
  const completedRecalls = progressList.filter(p => p.status === 'completed').length;
  const totalRecalls = Math.max(recalls.length, 1);
  const overallPercent = Math.min(100, Math.round((completedRecalls / totalRecalls) * 100));

  // Next active lesson to continue
  const latestRecall = recalls[0];

  const userInitials = (currentUser.display_name || currentUser.username || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div id="home-dashboard-view" className="space-y-6 animate-in fade-in duration-150">
      {/* WhatsApp Classroom Announcement Banner */}
      <WhatsAppBanner />

      {/* Greeting & Header Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {currentUser.avatar_url?.trim() ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/20 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {userInitials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-blue-100">
                  {isAdmin ? 'Instructor / Admin' : 'Active Student'}
                </span>
                <span className="text-xs text-blue-200">Batch #4</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Welcome back, {currentUser.display_name.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                Ready to review today's WhatsApp lesson recall and write code in the browser sandbox?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Streak Counter */}
            <div className="flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Flame className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-blue-200 font-medium">Daily Streak</p>
                <p className="text-lg font-black text-white">{currentUser.streak_days} Days</p>
              </div>
            </div>

            {/* Total XP Points */}
            <div className="flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-200 flex items-center justify-center">
                <Zap className="w-6 h-6 fill-blue-300 text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200 font-medium">Total XP</p>
                <p className="text-lg font-black text-white">{currentUser.xp_points} XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course completion progress bar */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-blue-100 font-semibold mb-2">
            <span>Overall Curriculum Progress</span>
            <span>{overallPercent}% Completed ({completedRecalls}/{totalRecalls} Recalls)</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigate('learn')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs text-left transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Lesson Recalls</h3>
          <p className="text-xs text-slate-500 mt-0.5">Slides & voice recaps</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('task')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-xs text-left transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Practical Tasks</h3>
          <p className="text-xs text-slate-500 mt-0.5">Auto-graded exercises</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('vscode')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:shadow-md text-left transition cursor-pointer group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-white text-sm">VS Code Beta</h3>
            <span className="text-[9px] font-bold bg-blue-500 text-white px-1 py-0.2 rounded font-mono">
              Android
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Mobile editor & file linking</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('code-lab')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs text-left transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Code Lab IDE</h3>
          <p className="text-xs text-slate-500 mt-0.5">HTML, CSS, JS sandbox</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('test')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-xs text-left transition cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Poll Quizzes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Instant scoring & tests</p>
        </button>
      </div>

      {/* Main Content Split: Continue Learning & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Learning & Fresh Recalls */}
        <div className="lg:col-span-2 space-y-6">
          {latestRecall && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Continue Learning
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {latestRecall.title}
                    </h2>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium hidden sm:block">
                  {latestRecall.whatsapp_date}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                <p className="text-xs text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{latestRecall.whatsapp_session_title}</span>
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Key topics reviewed: Box model sizing, Flexbox main vs cross axis, and the modern gap property.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    {latestRecall.materials.length} Materials
                  </span>
                  <span>•</span>
                  <span>Auto-graded Task Available</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('recall', latestRecall.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <span>Open Recall & Slides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Published Courses Overview */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Community Curriculum
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All Courses ({courses.length})
              </button>
            </div>

            <div className="space-y-3">
              {courses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  <p className="mb-2">No courses published yet.</p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onNavigate('admin')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Create First Course</span>
                    </button>
                  )}
                </div>
              ) : (
                courses.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('learn', c.id)}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                        {c.image_url?.trim() ? (
                          <img src={c.image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {c.course_type ? c.course_type.toUpperCase() : c.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Announcements, Recent Results & Community Content */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">WhatsApp Broadcasts</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Live Feed</span>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No active broadcasts.
                </div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 mb-1.5">
                        {ann.tag}
                      </span>
                      <h4 className="font-bold text-slate-800 leading-snug">{ann.title}</h4>
                      <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">{ann.body}</p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete post "${ann.title}"?`)) {
                            StorageService.deleteAnnouncement(ann.id);
                            showToast('Announcement post deleted.');
                          }
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                        title="Delete Post (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Submissions & Quiz Achievements */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Recent Achievements</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Profile
              </button>
            </div>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No assignments submitted yet</p>
            ) : (
              <div className="space-y-2.5">
                {submissions.slice(0, 2).map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">Task Auto-Graded</span>
                      <span className="font-extrabold text-emerald-700">{s.score}/{s.max_score} pts</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/80 mt-1 font-medium">{s.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
