import React, { useState } from 'react';
import { MessageCircle, Radio, Clock, ChevronRight, X } from 'lucide-react';

export const WhatsAppBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      id="whatsapp-community-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 shadow-sm mb-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                <Radio className="w-3 h-3 animate-pulse text-emerald-300" />
                Live Teaching Hub
              </span>
              <span className="text-xs text-emerald-100 font-medium">Batch #4 Active</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              WhatsApp is your Primary Classroom
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5 max-w-xl leading-relaxed">
              Live lectures and voice rooms happen on WhatsApp. Use this platform after class for lesson recalls, slide decks, Code Lab tasks, and quiz testing!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 text-xs font-medium text-emerald-100 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Next Live: Sat 7:00 PM UTC</span>
          </div>

          <a
            href="https://chat.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-xs cursor-pointer"
          >
            <span>Open WhatsApp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
