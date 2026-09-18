import React, { useState } from 'react';
import {
  User,
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  HelpCircle,
  Clock,
  Shield,
  Edit3,
  Camera,
  MessageCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { AdContainer } from '../common/AdContainer';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
];

interface ProfileViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, updateProfile, showToast, isOnline } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser.display_name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
  const [isEditing, setIsEditing] = useState(false);

  const progressList = StorageService.getProgress(currentUser.id);
  const submissions = StorageService.getSubmissions(currentUser.id);
  const testAttempts = StorageService.getTestAttempts(currentUser.id);

  const completedRecalls = progressList.filter(p => p.status === 'completed').length;
  const passedTasks = submissions.filter(s => s.passed).length;
  const avgTestScore = testAttempts.length
    ? Math.round(testAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / testAttempts.length)
    : 0;

  const userInitials = (displayName || currentUser.username || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
    });
    setIsEditing(false);
    showToast('Profile updated successfully');
  };

  return (
    <div id="student-profile-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              {avatarUrl?.trim() ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-slate-100 shadow-md">
                  {userInitials}
                </div>
              )}
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-300'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser.display_name}
                </h1>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{currentUser.username}</p>
              <p className="text-xs text-slate-600 mt-2 max-w-md">{currentUser.bio || 'Passionate code student.'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Edit form drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Goals</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Choose Avatar Preset</label>
              <div className="flex items-center gap-3">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-12 h-12 rounded-2xl overflow-hidden ring-2 transition cursor-pointer ${
                      avatarUrl === preset ? 'ring-blue-600 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span className="text-xs font-bold">Streak</span>
          </div>
          <p className="text-xl font-black text-slate-900">{currentUser.streak_days} Days</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Consecutive attendance</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Zap className="w-4 h-4 fill-blue-600" />
            <span className="text-xs font-bold">Experience</span>
          </div>
          <p className="text-xl font-black text-slate-900">{currentUser.xp_points} XP</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total earned points</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold">Recalls Cleared</span>
          </div>
          <p className="text-xl font-black text-slate-900">{completedRecalls}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">WhatsApp reviews done</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">Quiz Average</span>
          </div>
          <p className="text-xl font-black text-slate-900">{avgTestScore}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{testAttempts.length} tests taken</p>
        </div>
      </div>

      {/* Two Columns: Recent Submissions & Quiz Attempts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Submissions */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Practical Task Submissions</span>
            <span className="text-xs font-semibold text-slate-400">{submissions.length} Total</span>
          </h3>

          {submissions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No tasks submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => onNavigate?.('task', sub.task_id)}
                  className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs transition-colors ${
                    onNavigate ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{sub.task_id.replace('task_', '').toUpperCase()}</span>
                    <span className={sub.passed ? 'text-emerald-600' : 'text-amber-600'}>
                      {sub.score} / {sub.max_score} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{sub.feedback}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                    {onNavigate && <span className="text-blue-600 font-semibold">View Task &rarr;</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Attempts */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Quiz & Test Records</span>
            <span className="text-xs font-semibold text-slate-400">{testAttempts.length} Taken</span>
          </h3>

          {testAttempts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No quizzes completed yet.</p>
          ) : (
            <div className="space-y-3">
              {testAttempts.map(att => (
                <div
                  key={att.id}
                  onClick={() => onNavigate?.('test', att.test_id)}
                  className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs transition-colors ${
                    onNavigate ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{att.test_id.replace('test_', '').toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {att.percentage}% {att.passed ? 'PASSED' : 'RETRY'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Earned: {att.score} of {att.total_points} points
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{new Date(att.submitted_at).toLocaleDateString()}</span>
                    {onNavigate && <span className="text-blue-600 font-semibold">Open Quiz &rarr;</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdContainer placement="content-bottom" />
    </div>
  );
};
