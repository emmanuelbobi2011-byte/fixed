import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  ArrowRight,
  Layers,
  CheckCircle,
  FileText,
  Clock,
  MessageCircle,
  Play,
  Download,
  Filter,
  Crown,
  Video,
  Image as ImageIcon,
  Sparkles,
  Code2,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService, useStorageSync } from '../../services/storage';
import { Course, LessonRecall } from '../../types';
import { AdContainer } from '../common/AdContainer';

interface LearnViewProps {
  onNavigate: (view: string, id?: string) => void;
  selectedCourseId?: string;
}

export const LearnView: React.FC<LearnViewProps> = ({ onNavigate, selectedCourseId }) => {
  const syncVersion = useStorageSync(['courses', 'recalls']);
  const { currentUser, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [activeCourseId, setActiveCourseId] = useState<string>(selectedCourseId || courses[0]?.id || '');
  const [filterType, setFilterType] = useState<'all' | 'html' | 'css' | 'js'>('all');

  useEffect(() => {
    const updated = StorageService.getCourses();
    setCourses(updated);
    if ((!activeCourseId || !updated.find(c => c.id === activeCourseId)) && updated.length > 0) {
      setActiveCourseId(updated[0].id);
    }
  }, [syncVersion]);

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];
  const recalls = activeCourse ? StorageService.getRecalls(activeCourse.id) : [];
  const userProgress = StorageService.getProgress(currentUser.id);
  const tasks = activeCourse ? StorageService.getTasks(activeCourse.id) : [];
  const tests = activeCourse ? StorageService.getTests(activeCourse.id) : [];

  const filteredCourses = courses.filter(c => {
    if (filterType === 'all') return true;
    return (c.course_type || 'html') === filterType;
  });

  return (
    <div id="learn-courses-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              WhatsApp-Linked Curriculum
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Courses & WhatsApp Recalls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review live WhatsApp voice lectures, download slide decks, and access practical tasks.
          </p>
        </div>

        {/* If Admin, allow quick post course */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>+ Course & Quiz Builder</span>
          </button>
        )}
      </div>

      {/* Course Type Filter Tabs */}
      {courses.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {(['all', 'html', 'css', 'js'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'All Tracks' : type}
            </button>
          ))}
        </div>
      )}

      {/* Courses Cards Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Courses Available Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {isAdmin
              ? 'You are signed in as an administrator. Create your first course with media, teacher code examples, and quizzes using the Course Builder form!'
              : 'Your instructors (Emmanuel & Eunice) will publish live classroom courses, slides, and Code Lab assignments here soon.'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Course</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCourses.map(course => {
            const isSelected = course.id === (activeCourse?.id || '');
            const courseRecalls = StorageService.getRecalls(course.id);
            const completedCount = courseRecalls.filter(r =>
              userProgress.some(p => p.recall_id === r.id && p.status === 'completed')
            ).length;
            const pct = courseRecalls.length
              ? Math.round((completedCount / courseRecalls.length) * 100)
              : 0;

            return (
              <div
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={`group relative rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3.5 bg-slate-100 flex items-center justify-center">
                    {course.image_url?.trim() ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white">
                        {course.course_type || 'HTML'}
                      </span>
                      {course.media_type && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/90 text-white">
                          {course.media_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {course.description}
                  </p>
                </div>

                {/* Progress Bar inside card */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                    <span>{courseRecalls.length} Recalls</span>
                    <span className="font-bold text-blue-600">{pct}% Complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Course's Recalls & Interactive Learning Section */}
      {activeCourse && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {(activeCourse.course_type || 'html').toUpperCase()} Track
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Media: {activeCourse.media_type || 'Picture'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {activeCourse.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeCourse.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {tasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('task', tasks[0].id)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open Code Lab</span>
                </button>
              )}
              {tests.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('test', tests[0].id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Media Player / Viewer */}
          {Boolean(activeCourse.media_url?.trim()) && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
              {activeCourse.media_type === 'video' ? (
                activeCourse.media_url.includes('youtube') || activeCourse.media_url.includes('embed') ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={activeCourse.media_url}
                      title={activeCourse.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={activeCourse.media_url}
                    controls
                    className="w-full aspect-video object-contain"
                  />
                )
              ) : activeCourse.media_type === 'presentation' ? (
                <div className="p-8 text-center bg-slate-800 text-white space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-blue-400" />
                  <div>
                    <h4 className="font-bold text-sm">Presentation Slide Deck Available</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Download or review the slides prepared by your instructor
                    </p>
                  </div>
                  <a
                    href={activeCourse.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open Presentation Deck</span>
                  </a>
                </div>
              ) : (
                <div className="max-h-96 overflow-hidden flex items-center justify-center bg-slate-950">
                  <img
                    src={activeCourse.media_url}
                    alt={activeCourse.title}
                    className="max-h-96 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Teacher Code Example for Student */}
          {activeCourse.code_example && (
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-xs text-white">
                    {activeCourse.code_example_title || 'Teacher Code Example & Notes'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  {(activeCourse.course_type || 'HTML').toUpperCase()} Snippet
                </span>
              </div>

              {activeCourse.code_example_explanation && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                  <strong className="text-emerald-400 block mb-0.5">Instructor Guidance:</strong>
                  {activeCourse.code_example_explanation}
                </p>
              )}

              <pre className="p-3.5 rounded-xl bg-black/50 text-[11px] font-mono overflow-x-auto text-emerald-300 border border-slate-800">
                <code>{activeCourse.code_example}</code>
              </pre>
            </div>
          )}

          {/* Recalls List */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-900">
              WhatsApp Lesson Recalls ({recalls.length})
            </h3>

            {recalls.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No lesson recalls have been added for this course yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recalls.map((recall, index) => {
                  const isCompleted = userProgress.some(
                    p => p.recall_id === recall.id && p.status === 'completed'
                  );

                  return (
                    <div
                      key={recall.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : `0${index + 1}`}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {recall.whatsapp_date}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                Completed
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">{recall.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {recall.whatsapp_session_title}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('recall', recall.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer self-end md:self-center shrink-0"
                      >
                        <span>Open Recall & Slides</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
