import React, { useState } from 'react';
import {
  X,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  FileCode,
  MessageCircle,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Code2,
} from 'lucide-react';
import {
  UserProfile,
  Course,
  LessonRecall,
  Task,
  Test,
  StudentProgress,
  TestAttempt,
  Submission,
} from '../../types';
import { StorageService } from '../../services/storage';

interface StudentProgressModalProps {
  student: UserProfile;
  isOnline: boolean;
  courses: Course[];
  recalls: LessonRecall[];
  tasks: Task[];
  tests: Test[];
  allProgress: StudentProgress[];
  allAttempts: TestAttempt[];
  allSubmissions: Submission[];
  onClose: () => void;
  onRefresh: () => void;
}

export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  student,
  isOnline,
  courses,
  recalls,
  tasks,
  tests,
  allProgress,
  allAttempts,
  allSubmissions,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'quizzes' | 'assignments' | 'feedback'>('curriculum');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('index.html');
  const [feedbackTitle, setFeedbackTitle] = useState('Teacher Feedback & Encouragement');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Student specific data
  const studentProgress = allProgress.filter(p => p.user_id === student.id);
  const studentAttempts = allAttempts.filter(a => a.user_id === student.id);
  const studentSubmissions = allSubmissions.filter(s => s.user_id === student.id);

  // Stats
  const completedRecallsCount = studentProgress.filter(p => p.status === 'completed').length;
  const totalRecallsCount = recalls.length || 1;
  const completionPercent = Math.round((completedRecallsCount / totalRecallsCount) * 100);

  const passedTestsCount = studentAttempts.filter(a => a.passed).length;
  const avgQuizScore = studentAttempts.length
    ? Math.round(studentAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / studentAttempts.length)
    : 0;

  const passedSubmissionsCount = studentSubmissions.filter(s => s.passed).length;

  const initials = (student.display_name || student.username || 'ST')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleToggleLessonComplete = (courseId: string, recallId: string, currentlyCompleted: boolean) => {
    if (currentlyCompleted) {
      // Reset lesson progress
      StorageService.updateProgress(student.id, courseId, recallId, 0);
    } else {
      // Mark lesson complete
      StorageService.updateProgress(student.id, courseId, recallId, 100);
    }
    onRefresh();
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBody.trim()) return;

    StorageService.addNotification({
      user_id: student.id,
      title: feedbackTitle.trim() || 'Teacher Note',
      body: feedbackBody.trim(),
      type: 'grade',
      read_at: null,
      link_target: { view: 'home' },
    });

    setFeedbackSent(true);
    setFeedbackBody('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  return (
    <div
      id="student-progress-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              {student.avatar_url?.trim() ? (
                <img
                  src={student.avatar_url}
                  alt={student.display_name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-base flex items-center justify-center ring-2 ring-purple-400">
                  {initials}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-slate-900 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
                title={isOnline ? 'Active Online Now' : 'Offline'}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">{student.display_name}</h3>
                <span className="text-xs text-purple-300 font-mono">@{student.username}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isOnline ? 'Online Now' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{student.email}</span>
                {student.whatsapp_number && (
                  <>
                    <span>•</span>
                    <a
                      href={`https://wa.me/${student.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{student.whatsapp_number}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Key Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-purple-600 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Lessons Completed</span>
            </div>
            <p className="text-lg font-black text-slate-900">
              {completedRecallsCount} / {totalRecallsCount}
              <span className="text-xs font-semibold text-slate-500 ml-1.5">({completionPercent}%)</span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-[11px] font-bold">Daily Streak</span>
            </div>
            <p className="text-lg font-black text-slate-900">
              {student.streak_days || 1} <span className="text-xs font-semibold text-slate-500">Days</span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
              <Zap className="w-3.5 h-3.5 fill-blue-500" />
              <span className="text-[11px] font-bold">Total XP Earned</span>
            </div>
            <p className="text-lg font-black text-slate-900">
              {student.xp_points || 0} <span className="text-xs font-semibold text-slate-500">XP</span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Quiz Average</span>
            </div>
            <p className="text-lg font-black text-slate-900">
              {avgQuizScore}%
              <span className="text-xs font-semibold text-slate-500 ml-1.5">({passedTestsCount} passed)</span>
            </p>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 overflow-x-auto bg-white">
          {[
            { id: 'curriculum', label: 'Curriculum & Lessons', badge: `${completedRecallsCount}/${totalRecallsCount}` },
            { id: 'quizzes', label: 'Quizzes & Tests', badge: `${studentAttempts.length}` },
            { id: 'assignments', label: 'Code Lab Projects', badge: `${studentSubmissions.length}` },
            { id: 'feedback', label: 'Teacher Feedback Note' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* ========================================== */}
          {/* TAB 1: CURRICULUM & LESSONS */}
          {/* ========================================== */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Curriculum Progress by Course</h4>
                  <p className="text-xs text-slate-500">
                    Review each lesson recall. You can manually toggle completion for WhatsApp attendees.
                  </p>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No courses created in curriculum yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map(course => {
                    const courseRecalls = recalls.filter(r => r.course_id === course.id);
                    const courseCompletedRecalls = courseRecalls.filter(r =>
                      studentProgress.some(p => p.recall_id === r.id && p.status === 'completed')
                    );
                    const coursePercent = courseRecalls.length
                      ? Math.round((courseCompletedRecalls.length / courseRecalls.length) * 100)
                      : 0;
                    const isExpanded = expandedCourseId === course.id;

                    return (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
                      >
                        {/* Course Header Bar */}
                        <div
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                  {course.course_type || 'COURSE'}
                                </span>
                                <h5 className="font-bold text-sm text-slate-900 truncate">{course.title}</h5>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {courseCompletedRecalls.length} of {courseRecalls.length} lessons completed
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Course Progress Pill */}
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-black text-slate-900">{coursePercent}%</span>
                              <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    coursePercent === 100 ? 'bg-emerald-500' : 'bg-purple-600'
                                  }`}
                                  style={{ width: `${coursePercent}%` }}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-slate-700 transition"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Lessons List */}
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-2">
                            {courseRecalls.length === 0 ? (
                              <p className="text-xs text-slate-400 py-3 text-center">No lessons added to this course yet.</p>
                            ) : (
                              courseRecalls.map((recall, idx) => {
                                const prog = studentProgress.find(p => p.recall_id === recall.id);
                                const isCompleted = prog?.status === 'completed';

                                return (
                                  <div
                                    key={recall.id}
                                    className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                        isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="font-mono text-[10px]">{idx + 1}</span>}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{recall.title}</p>
                                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                          {recall.whatsapp_session_title && (
                                            <span>Session: {recall.whatsapp_session_title}</span>
                                          )}
                                          {isCompleted && prog?.completed_at && (
                                            <>
                                              <span>•</span>
                                              <span className="text-emerald-700 font-medium">
                                                Finished on {new Date(prog.completed_at).toLocaleDateString()}
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Teacher Action: Manual Completion Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLessonComplete(course.id, recall.id, !!isCompleted)}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                                        isCompleted
                                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      }`}
                                      title={isCompleted ? 'Reset this lesson for student' : 'Mark as completed for student'}
                                    >
                                      {isCompleted ? (
                                        <>
                                          <RotateCcw className="w-3 h-3" />
                                          <span>Reset</span>
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Mark Done</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: QUIZZES & TESTS */}
          {/* ========================================== */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Quiz & Assessment History</h4>
                  <p className="text-xs text-slate-500">Record of all tests attempted by this student</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  {studentAttempts.length} Attempts Recorded
                </span>
              </div>

              {studentAttempts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm text-slate-600">No quiz attempts yet</p>
                  <p className="text-xs text-slate-400 mt-1">This student has not submitted any interactive quizzes.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentAttempts.map((attempt, index) => {
                    const test = tests.find(t => t.id === attempt.test_id);
                    const isPass = attempt.passed;

                    return (
                      <div
                        key={attempt.id || index}
                        className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isPass ? 'Passed' : 'Failed'}
                            </span>
                            <h5 className="font-bold text-sm text-slate-900 truncate">
                              {test?.title || `Quiz Attempt #${index + 1}`}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span>Score: <strong className="text-slate-800">{attempt.score} / {attempt.total_points}</strong> ({attempt.percentage}%)</span>
                            <span>•</span>
                            <span>{new Date(attempt.submitted_at).toLocaleDateString()} at {new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xl font-black ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {attempt.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: CODE LAB ASSIGNMENTS */}
          {/* ========================================== */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Practical Code Lab Submissions</h4>
                  <p className="text-xs text-slate-500">Auto-graded assignments and submitted code files</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  {studentSubmissions.length} Submissions
                </span>
              </div>

              {studentSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <FileCode className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm text-slate-600">No project submissions yet</p>
                  <p className="text-xs text-slate-400 mt-1">This student has not turned in any Code Lab tasks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSubmissions.map(sub => {
                    const task = tasks.find(t => t.id === sub.task_id);
                    const isSelected = selectedSubmission?.id === sub.id;

                    return (
                      <div
                        key={sub.id}
                        className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {sub.passed ? 'Auto-Grade Passed' : 'Needs Correction'}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900 truncate">
                                {task?.title || 'Assignment Submission'}
                              </h5>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span>Points Awarded: <strong className="text-slate-800">{sub.score} / {sub.max_score} XP</strong></span>
                              <span>•</span>
                              <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(isSelected ? null : sub);
                              if (sub.project_files) {
                                setSelectedCodeFile(Object.keys(sub.project_files)[0] || 'index.html');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Hide Code' : 'Inspect Code'}</span>
                          </button>
                        </div>

                        {/* Code Inspection Viewer */}
                        {isSelected && sub.project_files && (
                          <div className="border-t border-slate-100 bg-slate-900 p-4 text-slate-100">
                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                              <div className="flex items-center gap-1.5 overflow-x-auto">
                                {Object.keys(sub.project_files).map(filename => (
                                  <button
                                    key={filename}
                                    type="button"
                                    onClick={() => setSelectedCodeFile(filename)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                                      selectedCodeFile === filename
                                        ? 'bg-purple-600 text-white font-bold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    {filename}
                                  </button>
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-400">Student Submission Code</span>
                            </div>

                            <pre className="font-mono text-xs p-3 rounded-xl bg-slate-950 overflow-x-auto max-h-64 border border-slate-800 text-emerald-400">
                              <code>{sub.project_files[selectedCodeFile] || '// Empty file'}</code>
                            </pre>

                            {/* Auto Grade Breakdown */}
                            {sub.auto_grade_results && sub.auto_grade_results.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                  Evaluation Checks:
                                </p>
                                <div className="space-y-1">
                                  {sub.auto_grade_results.map((res, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      {res.passed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      ) : (
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                      )}
                                      <span className={res.passed ? 'text-slate-300' : 'text-rose-300 font-medium'}>
                                        {res.message}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: TEACHER FEEDBACK NOTE */}
          {/* ========================================== */}
          {activeTab === 'feedback' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Send Direct Feedback to {student.display_name}</h4>
                <p className="text-xs text-slate-500">
                  This sends a personalized commendation or advice notification to the student's learning account.
                </p>
              </div>

              {feedbackSent && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Feedback note delivered! {student.display_name} will see it on their notifications feed.</span>
                </div>
              )}

              <form onSubmit={handleSendFeedback} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={feedbackTitle}
                    onChange={e => setFeedbackTitle(e.target.value)}
                    placeholder="e.g. Great job on the HTML practical task!"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message for Student</label>
                  <textarea
                    rows={4}
                    value={feedbackBody}
                    onChange={e => setFeedbackBody(e.target.value)}
                    placeholder={`Hi ${student.display_name}, you are making solid progress. Remember to practice the CSS quiz before tomorrow's WhatsApp session...`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Note to Student</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Account created on {new Date(student.created_at || Date.now()).toLocaleDateString()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Close Progress Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
