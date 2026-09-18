import React, { useState } from 'react';
import {
  Mail,
  User,
  X,
  ArrowRight,
  BookOpen,
  Crown,
  Lock,
  Check,
  Phone,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAILS, isAdminEmail } from '../../types';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    signIn,
    signUp,
    signInWithGoogle,
    isAuthenticating,
    showToast,
  } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up states
  const [displayName, setDisplayName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  if (!showAuthModal) return null;

  const isDetectedAdminLogin = isAdminEmail(loginEmail.trim().toLowerCase());
  const isDetectedAdminRegister = isAdminEmail(registerEmail.trim().toLowerCase());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email address');
      return;
    }
    const res = await signIn(loginEmail.trim(), loginPassword.trim());
    if (res) {
      setShowAuthModal(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Please enter your name');
      return;
    }
    if (!registerEmail.trim()) {
      showToast('Please enter your email address');
      return;
    }
    const res = await signUp(
      registerEmail.trim(),
      registerPassword.trim() || 'Learn2Code2026!',
      displayName.trim(),
      avatarUrl.trim(),
      whatsappNumber.trim()
    );
    if (res) {
      setShowAuthModal(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res) {
      setShowAuthModal(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="auth-modal"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {tab === 'login' ? 'Sign In to Learn2Code' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Free Community Coding Hub for WhatsApp classrooms
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Student
          </button>
        </div>

        {/* Real Google Sign In button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isAuthenticating}
          className="w-full mb-4 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isAuthenticating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Or with Email &amp; Password</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Informational Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl mb-4 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Automatic Role Detection</span>
          </p>
          <p className="text-[11px] text-slate-500">
            The system automatically detects authorized administrator accounts (<span className="font-semibold text-purple-700">Eunice Ajayi</span> &amp; <span className="font-semibold text-purple-700">Emmanuel Bobi</span>) upon sign-in. All other learners are strictly assigned student privileges.
          </p>
        </div>

        {/* Sign In Form */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* Dynamic System Role Detection Badge */}
              {isDetectedAdminLogin ? (
                <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2 text-purple-900 text-xs animate-in fade-in">
                  <Crown className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold">Instructor Admin Detected:</span>
                    <p className="text-[11px] text-purple-700">
                      System will unlock the Admin Hub and Course Builder upon sign-in.
                    </p>
                  </div>
                </div>
              ) : loginEmail.trim().length > 3 ? (
                <div className="mt-2 p-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-slate-700 text-xs animate-in fade-in">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px]">
                    Detected as <strong>Student Account</strong>. Access to courses, practical tasks, and Code Lab.
                  </span>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full mt-2 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isDetectedAdminLogin
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAuthenticating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isDetectedAdminLogin ? 'Sign In as Administrator' : 'Sign In as Student'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Samuel Adeyemi"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  placeholder="e.g. samuel@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>

              {isDetectedAdminRegister && (
                <div className="mt-2 p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                  <span className="font-bold">Recognized Instructor Email:</span> Admin role will be initialized.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Profile Picture / Avatar
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Not compulsory</span>
              </div>

              {/* Presets or custom URL */}
              <div className="flex items-center gap-2 mb-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatarUrl(avatarUrl === preset ? '' : preset)}
                    className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                      avatarUrl === preset ? 'border-blue-600 scale-105' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={preset} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatarUrl === preset && (
                      <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-auto cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="Or paste an image URL (optional)"
                  className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  WhatsApp Number
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
