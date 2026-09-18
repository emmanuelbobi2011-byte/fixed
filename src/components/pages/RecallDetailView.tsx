import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Download,
  FileText,
  CheckCircle2,
  HelpCircle,
  Code2,
  Share2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { AdContainer } from '../common/AdContainer';

interface RecallDetailViewProps {
  recallId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const RecallDetailView: React.FC<RecallDetailViewProps> = ({ recallId, onNavigate }) => {
  const { currentUser, showToast } = useAuth();
  const recall = StorageService.getRecall(recallId) || StorageService.getRecalls()[0];
  const progressList = StorageService.getProgress(currentUser.id);
  const currentProgress = progressList.find(p => p.recall_id === recall.id);
  const isCompleted = currentProgress?.status === 'completed';

  const [activeSlide, setActiveSlide] = useState(0);

  const handleMarkComplete = () => {
    StorageService.updateProgress(currentUser.id, recall.course_id, recall.id, 100);
    showToast('Lesson Recall marked as completed! 25 XP awarded.');
  };

  const handleDownloadMaterial = (fileName: string) => {
    showToast(`Downloading presentation material: ${fileName}`);
  };

  return (
    <div id="recall-detail-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Back button and navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('learn', recall.course_id)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Recalls</span>
        </button>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recall Completed</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Reviewed</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Recall Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Session Companion</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {recall.whatsapp_date}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {recall.title}
        </h1>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
          <span className="font-bold text-slate-900 block mb-0.5">WhatsApp Lecture Room Topic:</span>
          {recall.whatsapp_session_title}
        </div>

        {/* Recap Body */}
        <div className="prose prose-slate prose-sm max-w-none pt-2 text-slate-700 leading-relaxed space-y-4">
          <div className="whitespace-pre-line font-normal text-xs sm:text-sm">
            {recall.body}
          </div>
        </div>

        {/* Key Takeaways Cards */}
        {recall.key_takeaways && recall.key_takeaways.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Core WhatsApp Lesson Takeaways
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recall.key_takeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Materials & Presentations Viewer */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Uploaded Slides & Study Materials
              </h3>
              <p className="text-xs text-slate-500">
                Presentation slide deck used during our WhatsApp voice session
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {recall.materials.length} Attachments
          </span>
        </div>

        {/* Interactive Slides Previewer */}
        {recall.materials.length > 0 && recall.materials[0].slide_previews && (
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Presentation Deck: {recall.materials[0].file_name}</span>
              </span>
              <span className="text-slate-400">
                Slide {activeSlide + 1} of {recall.materials[0].slide_previews.length}
              </span>
            </div>

            <div className="py-8 text-center min-h-[140px] flex flex-col items-center justify-center">
              <p className="text-base sm:text-lg font-bold text-slate-100 max-w-lg">
                {recall.materials[0].slide_previews[activeSlide]}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Learn2Code WhatsApp Classroom Live Deck • Free Open Curriculum
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                {recall.materials[0].slide_previews.map((_, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setActiveSlide(sIdx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSlide === sIdx ? 'bg-blue-500 w-5' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleDownloadMaterial(recall.materials[0].file_name)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {recall.materials.map(mat => (
            <div
              key={mat.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-2.5 truncate mr-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{mat.file_name}</p>
                  <p className="text-[10px] text-slate-400">{mat.size}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadMaterial(mat.file_name)}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition shrink-0 cursor-pointer"
                title="Download Material"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Next Steps: Practical Task or Poll Test */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recall.task_id && (
          <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                Practice What You Learned
              </span>
              <h3 className="font-extrabold text-base text-purple-950 mt-1.5">
                Practical Coding Task
              </h3>
              <p className="text-xs text-purple-900/70 mt-1 leading-relaxed">
                Open the Code Lab, write semantic code according to task specifications, and get instant auto-grading.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('task', recall.task_id)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Code2 className="w-4 h-4" />
              <span>Start Practical Task</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {recall.test_id && (
          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                WhatsApp Poll Style
              </span>
              <h3 className="font-extrabold text-base text-amber-950 mt-1.5">
                Rapid Knowledge Quiz
              </h3>
              <p className="text-xs text-amber-900/70 mt-1 leading-relaxed">
                Take the official quick test with instant score calculation, question feedback, and XP points.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('test', recall.test_id)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Take WhatsApp Quiz</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <AdContainer placement="content-bottom" />
    </div>
  );
};
