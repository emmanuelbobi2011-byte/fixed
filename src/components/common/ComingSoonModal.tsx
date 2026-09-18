import React from 'react';
import { Sparkles, Shield, Mail, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ComingSoonModal: React.FC = () => {
  const { showComingSoonModal, setShowComingSoonModal, comingSoonTitle, loginAs } = useAuth();

  if (!showComingSoonModal) return null;

  return (
    <div
      id="coming-soon-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="coming-soon-modal"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <button
          type="button"
          onClick={() => setShowComingSoonModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              In Development
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {comingSoonTitle} Coming Soon!
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          We are finalizing OAuth consent and security review for Google Sign-In and social logins. In the meantime, you can seamlessly sign in using your email address, or switch between demo student and admin modes below!
        </p>

        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 mb-6 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Planned Supported Providers:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Google One-Tap</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span>GitHub OAuth</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Discord SSO</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>WhatsApp OTP</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              setShowComingSoonModal(false);
              loginAs('student');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continue as Student (Alex)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowComingSoonModal(false);
              loginAs('admin');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            <span>Switch to Admin (Dave - Post Courses)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
