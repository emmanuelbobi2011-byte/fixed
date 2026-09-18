import React, { useState } from 'react';
import { Database, Copy, Check, Shield, Server, X, Sparkles } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'config'>('schema');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('l2c_sb_url') || 'https://xyzcompany.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('l2c_sb_key') || 'sbp_mock_anon_key_for_learn2code');
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const sqlContent = StorageService.getSupabaseSchemaSql();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('l2c_sb_url', supabaseUrl);
    localStorage.setItem('l2c_sb_key', supabaseKey);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  return (
    <div
      id="supabase-plan-a-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="supabase-plan-a-modal"
        className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Specification Plan A
              </span>
              <span className="text-xs text-slate-400">Cloudflare Pages + Supabase</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Supabase PostgreSQL & Row Level Security (RLS)
            </h2>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'schema' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            PostgreSQL Schema & RLS SQL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'config' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection Configuration
          </button>
        </div>

        {activeTab === 'schema' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-500">
              <span className="font-mono">schema.sql + rls.sql (Ready for Supabase SQL Editor)</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Schema SQL'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed">
              <pre className="whitespace-pre">{sqlContent}</pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
              <p className="font-semibold text-sm mb-1">Local & Cloud Hybrid Mode Active</p>
              <p className="leading-relaxed">
                By default, Learn2Code runs seamlessly in full client-side simulated persistence. If you or your backend partner provision an external Supabase project, input your project credentials below.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SUPABASE_URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  {savedStatus && 'Configuration updated in browser memory!'}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Save Connection Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
