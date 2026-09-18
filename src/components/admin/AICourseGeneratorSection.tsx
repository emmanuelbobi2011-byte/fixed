import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  X,
  BookOpen,
  CheckSquare,
  HelpCircle,
  Code2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  GeminiCourseDraft,
  GeminiCourseService,
  TECH_PICTURE_PRESETS,
} from '../../services/geminiCourseService';
import { CourseType } from '../../types';

interface AICourseGeneratorSectionProps {
  onApplyDraftToForm: (draft: GeminiCourseDraft) => void;
  onDirectPublish: (draft: GeminiCourseDraft) => void;
  showToast: (msg: string) => void;
}

export const AICourseGeneratorSection: React.FC<AICourseGeneratorSectionProps> = ({
  onApplyDraftToForm,
  onDirectPublish,
  showToast,
}) => {
  // Generator Form States
  const [apiKey, setApiKey] = useState(() => GeminiCourseService.getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [topic, setTopic] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('html');
  const [targetLevel, setTargetLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [isGenerating, setIsGenerating] = useState(false);

  // Staged Draft & Permission Modal
  const [stagedDraft, setStagedDraft] = useState<GeminiCourseDraft | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPicUrl, setSelectedPicUrl] = useState('');

  // Quick Topic Suggestions
  const quickTopics = [
    { label: 'Flexbox Responsive Navbar', type: 'css' as CourseType, topic: 'Responsive Flexbox Navigation Bar with Mobile Hamburger Menu' },
    { label: 'JavaScript Fetch API & Async', type: 'js' as CourseType, topic: 'Fetching Remote REST APIs with async/await and Error Handling' },
    { label: 'HTML5 Semantic Forms & Validation', type: 'html' as CourseType, topic: 'HTML5 Semantic Elements, Form Inputs, and Browser Validation' },
    { label: 'CSS Grid Modern Gallery', type: 'css' as CourseType, topic: 'Responsive CSS Grid Photo Gallery with Hover Zoom Transitions' },
    { label: 'JS DOM Events & State', type: 'js' as CourseType, topic: 'JavaScript DOM Event Listeners, Query Selectors, and Click Counters' },
  ];

  // Save API key when updated
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    GeminiCourseService.setStoredApiKey(key);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Please enter a course topic or click one of the quick suggestions.');
      return;
    }

    setIsGenerating(true);
    try {
      const draft = await GeminiCourseService.generateCourse({
        topic: topic.trim(),
        courseType: courseType,
        targetLevel: targetLevel,
        additionalNotes: additionalNotes.trim(),
        apiKey: apiKey.trim(),
        model: selectedModel,
      });

      setStagedDraft(draft);
      setSelectedPicUrl(draft.image_url);
      // Open the Permission Gatekeeper Modal - "Must ask my permission"
      setShowPermissionModal(true);
      showToast('Draft generated! Please review and grant your permission to publish.');
    } catch (err: any) {
      console.error('Course generation error:', err);
      showToast(err.message || 'Failed to generate course. Please verify your Gemini API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  // When admin grants explicit permission:
  const handleApproveAndPublish = () => {
    if (!stagedDraft) return;
    const finalDraft: GeminiCourseDraft = {
      ...stagedDraft,
      image_url: selectedPicUrl || stagedDraft.image_url,
    };
    onDirectPublish(finalDraft);
    setShowPermissionModal(false);
    setStagedDraft(null);
    setTopic('');
  };

  // When admin wants to populate the form and tweak first:
  const handleEditInForm = () => {
    if (!stagedDraft) return;
    const finalDraft: GeminiCourseDraft = {
      ...stagedDraft,
      image_url: selectedPicUrl || stagedDraft.image_url,
    };
    onApplyDraftToForm(finalDraft);
    setShowPermissionModal(false);
    showToast('Course details loaded into the editor below. You can make manual tweaks and publish when ready.');
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white border border-purple-800/40 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Title with Admin & Gemini Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-900/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Admin Only
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Permission Guard Active
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
                Gemini AI Auto-Course Creator
              </h2>
              <p className="text-xs text-purple-200/80">
                Input your API key and topic. Gemini generates the full syllabus, Code Lab task, pictures (POCs), and quiz questions with mandatory approval before publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-700/50 text-xs text-purple-200 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{selectedModel}</span>
            </div>
          </div>
        </div>

        {/* Main Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Row 1: Gemini API Key & Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-purple-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  Gemini API Key (Saved securely in your browser)
                </span>
                {apiKey ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Key Stored
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 font-medium">Input your key to start</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => handleSaveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-purple-700/50 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white cursor-pointer"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Gemini Model Version
              </label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-purple-700/50 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (3.6 Series - Recommended)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-flash-latest">Gemini Flash Latest</option>
              </select>
            </div>
          </div>

          {/* Row 2: Topic and Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-purple-200 mb-1">
                What course should Gemini create? <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Building a Responsive Flexbox Navigation Bar with Dropdown"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-purple-700/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Course Category
              </label>
              <select
                value={courseType}
                onChange={e => setCourseType(e.target.value as CourseType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-purple-700/50 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="js">JavaScript (JS)</option>
                <option value="fullstack">Fullstack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Student Difficulty Level
              </label>
              <select
                value={targetLevel}
                onChange={e => setTargetLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-purple-700/50 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                <option value="Beginner">Beginner (Foundation)</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced (Mastery)</option>
              </select>
            </div>
          </div>

          {/* Quick Topic Chips */}
          <div>
            <span className="text-[11px] font-semibold text-purple-300 block mb-1.5">
              Quick Suggestions (Tap to load):
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((qt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(qt.topic);
                    setCourseType(qt.type);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-purple-200 hover:text-white transition cursor-pointer"
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Instructor Notes */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              Custom Instructor Directives / Special Requests (Optional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Include mobile touch friendly considerations and 2 specific quiz traps"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-purple-700/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Safety Policy:</strong> The course will <strong>never auto-post</strong> directly. A permission review dialog will prompt you to inspect, modify, and confirm before publication.
              </span>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition shadow-lg shadow-purple-900/40 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Curriculum & Questions with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Complete Course & Questions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE PERMISSION GATEKEEPER MODAL — "MUST ASK MY PERMISSION"             */}
      {/* ========================================================================= */}
      {showPermissionModal && stagedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-purple-700/60 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 border-b border-purple-800/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Permission Required
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">
                      Status: Staged AI Draft
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                    Review Course & Grant Permission to Publish
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close and keep draft"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200 flex-1">
              {/* Mandatory Permission Banner */}
              <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-700/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Administrator Review Gatekeeper
                  </h4>
                  <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                    Gemini AI has finished building this comprehensive curriculum including the cover photo (POC), Code Lab starter snippet, auto-graded requirements, and a multiple-choice quiz. <strong>Nothing will be published to students until you explicitly approve below.</strong>
                  </p>
                </div>
              </div>

              {/* 1. Cover Photo (POC) & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                {/* Photo Preview & Switcher */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Course Cover Photo (POC)
                    </span>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 relative group">
                    <img
                      src={selectedPicUrl || stagedDraft.image_url}
                      alt={stagedDraft.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold text-white">
                      Selected Photo
                    </div>
                  </div>

                  {/* Thumbnail Switcher */}
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Select alternative tech photo (POC):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TECH_PICTURE_PRESETS.slice(0, 4).map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setSelectedPicUrl(preset.url)}
                        className={`aspect-video rounded-lg overflow-hidden border transition cursor-pointer relative ${
                          selectedPicUrl === preset.url
                            ? 'border-purple-500 ring-2 ring-purple-500/50'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                        title={preset.title}
                      >
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Metadata */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 font-mono font-bold text-[10px] uppercase">
                      {stagedDraft.course_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono font-bold text-[10px]">
                      Level: {stagedDraft.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {stagedDraft.title}
                    </h3>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {stagedDraft.description}
                    </p>
                  </div>

                  {/* Lesson Recall Recap */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>WhatsApp Recall: {stagedDraft.lesson_recall.whatsapp_session_title}</span>
                    </div>
                    <p className="text-slate-400 line-clamp-2">
                      {stagedDraft.lesson_recall.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Practical Task & Code Lab Sandbox Preview */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    Practical Task: {stagedDraft.task.title} (+{stagedDraft.task.points} XP)
                  </span>
                </div>
                <p className="text-slate-300">
                  {stagedDraft.task.instructions}
                </p>

                {/* Requirements Checklist */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Auto-Grading Criteria ({stagedDraft.task.requirements.length} checks):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stagedDraft.task.requirements.map(req => (
                      <div
                        key={req.id}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-[11px]"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{req.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starter Code Snippet preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Starter Code: {stagedDraft.code_example_title}
                  </span>
                  <pre className="p-3 rounded-xl bg-[#1e1e1e] text-slate-300 font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
                    {stagedDraft.code_example}
                  </pre>
                </div>
              </div>

              {/* 3. Generated Quiz Question Preview */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Automated Quiz Question &amp; Scoring Key
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="font-bold text-white text-xs mb-2.5">
                    Q: {stagedDraft.quiz.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stagedDraft.quiz.options.map(opt => {
                      const isCorrect = opt.id === stagedDraft.quiz.correct_option;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect
                              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-bold'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-purple-400">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {stagedDraft.quiz.explanation && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300">
                      <strong>Explanation:</strong> {stagedDraft.quiz.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Explicit Permission Action Buttons */}
            <div className="px-6 py-4 bg-slate-950 border-t border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowPermissionModal(false);
                  setStagedDraft(null);
                  showToast('AI draft discarded.');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                ✕ Discard Draft
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleEditInForm}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold transition cursor-pointer"
                  title="Populate the admin form so you can make manual adjustments before publishing"
                >
                  Keep in Form &amp; Edit First
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndPublish}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center justify-center gap-1.5"
                  title="Grant permission and immediately publish this course live to the student platform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>✓ Grant Permission &amp; Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
