import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdContainerProps {
  placement?: 'sidebar' | 'content-bottom' | 'result-page' | 'feed';
  compact?: boolean;
}

export const AdContainer: React.FC<AdContainerProps> = ({ placement = 'content-bottom', compact = false }) => {
  return (
    <aside
      id={`sponsored-ad-slot-${placement}`}
      aria-label="Community Partner Advertisement"
      className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 transition-all duration-200 hover:border-slate-300 ${
        compact ? 'text-xs p-3' : 'text-sm'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium tracking-wide uppercase text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Sponsored Community Partner • Non-Intrusive</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Ad</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">
              CloudHost Pro • Free Student Tier Available
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Deploy your HTML, CSS & JavaScript projects with free custom domains and instant HTTPS.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-2 italic">
        Advertisements keep Learn2Code 100% free for all students worldwide without requiring clicks to unlock educational material.
      </p>
    </aside>
  );
};
