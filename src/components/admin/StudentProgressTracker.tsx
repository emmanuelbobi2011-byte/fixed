import React, { useState } from 'react';
import {
  Users,
  Search,
  BookOpen,
  Flame,
  Zap,
  Award,
  FileCode,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Eye,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  PresenceState,
  Course,
  LessonRecall,
  Task,
  Test,
  StudentProgress,
  TestAttempt,
  Submission,
} from '../../types';
import { StudentProgressModal } from './StudentProgressModal';

interface StudentProgressTrackerProps {
  students: UserProfile[];
  presenceList: PresenceState[];
  courses: Course[];
  recalls: LessonRecall[];
  tasks: Task[];
  tests: Test[];
  allProgress: StudentProgress[];
  allAttempts: TestAttempt[];
  allSubmissions: Submission[];
  currentUserId: string;
  onRefresh: () => void;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({
  students,
  presenceList,
  courses,
  recalls,
  tasks,
  tests,
  allProgress,
  allAttempts,
  allSubmissions,
  currentUserId,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed' | 'zero'>('all');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const totalCurriculumLessons = recalls.length || 1;

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.display_name?.toLowerCase().includes(q) ||
      student.username?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q) ||
      student.whatsapp_number?.includes(q);

    if (!matchesSearch) return false;

    // Filter mode
    const studentCompletedRecalls = allProgress.filter(
      p => p.user_id === student.id && p.status === 'completed'
    ).length;
    const studentAttempts = allAttempts.filter(a => a.user_id === student.id).length;
    const studentSubs = allSubmissions.filter(s => s.user_id === student.id).length;
    const hasActivity = studentCompletedRecalls > 0 || studentAttempts > 0 || studentSubs > 0;

    if (filterMode === 'active') return hasActivity;
    if (filterMode === 'completed') return studentCompletedRecalls >= totalCurriculumLessons;
    if (filterMode === 'zero') return !hasActivity;

    return true;
  });

  // Calculate high-level cohort metrics
  const studentsWithProgress = students.filter(s =>
    allProgress.some(p => p.user_id === s.id && p.status === 'completed')
  ).length;

  const totalLessonsFinishedAcrossCohort = allProgress.filter(p => p.status === 'completed').length;
  const cohortAvgQuiz = allAttempts.length
    ? Math.round(allAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / allAttempts.length)
    : 0;

  return (
    <div id="student-progress-tracker" className="space-y-6">
      {/* Header & Cohort Quick Highlights */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-lg text-slate-900">
                Student Learning Progress & Classroom Roster
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Live tracking of students' lesson completion, quiz scorecards, and practical code projects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{presenceList.length} Connected Live</span>
            </span>
          </div>
        </div>

        {/* Cohort Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/80">
            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-purple-950 mt-1">{students.length}</p>
            <p className="text-[11px] text-purple-600/80 mt-0.5">Students in database</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Active Learners</p>
            <p className="text-2xl font-black text-blue-950 mt-1">{studentsWithProgress}</p>
            <p className="text-[11px] text-blue-600/80 mt-0.5">Completed ≥1 lesson recall</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Lessons Finished</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{totalLessonsFinishedAcrossCohort}</p>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Total across all students</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Cohort Quiz Avg</p>
            <p className="text-2xl font-black text-amber-950 mt-1">{cohortAvgQuiz}%</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">{allAttempts.length} quiz submissions</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name, @username, email, or WhatsApp..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Students', count: students.length },
              { id: 'active', label: 'In Progress', count: studentsWithProgress },
              { id: 'completed', label: '100% Complete' },
              { id: 'zero', label: 'Needs Attention' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  filterMode === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterMode === tab.id ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Progress Roster List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No students matched your search</p>
            <p className="text-xs text-slate-400">Try clearing the search query or adjusting your filters.</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const presence = presenceList.find(pr => pr.user_id === student.id);
            const isOnline = !!presence || student.id === currentUserId;

            // Compute student stats
            const studentProgress = allProgress.filter(p => p.user_id === student.id);
            const completedRecalls = studentProgress.filter(p => p.status === 'completed').length;
            const progressPercent = Math.min(100, Math.round((completedRecalls / totalCurriculumLessons) * 100));

            const studentAttempts = allAttempts.filter(a => a.user_id === student.id);
            const passedTests = studentAttempts.filter(a => a.passed).length;
            const avgQuiz = studentAttempts.length
              ? Math.round(studentAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / studentAttempts.length)
              : 0;

            const studentSubs = allSubmissions.filter(s => s.user_id === student.id);
            const passedSubs = studentSubs.filter(s => s.passed).length;

            const initials = (student.display_name || student.username || 'ST')
              .split(' ')
              .map(p => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={student.id}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Student Identity */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    {student.avatar_url?.trim() ? (
                      <img
                        src={student.avatar_url}
                        alt={student.display_name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center ring-2 ring-slate-100 shadow-inner">
                        {initials}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={isOnline ? 'Online Now' : 'Offline'}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {student.display_name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">@{student.username}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        {student.streak_days || 1} day streak
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-blue-600 font-bold">
                        <Zap className="w-3.5 h-3.5 fill-blue-500" />
                        {student.xp_points || 0} XP
                      </span>
                      {student.whatsapp_number && (
                        <>
                          <span>•</span>
                          <a
                            href={`https://wa.me/${student.whatsapp_number.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                            title="Chat with student on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{student.whatsapp_number}</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Progress Bar & Detailed Statistics */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  {/* Lesson Progress */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">Lessons</span>
                      <span className="font-extrabold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPercent === 100
                            ? 'bg-emerald-500'
                            : progressPercent > 0
                            ? 'bg-purple-600'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {completedRecalls} / {totalCurriculumLessons} done
                    </p>
                  </div>

                  {/* Quizzes Taken */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">Quizzes</span>
                      <span className="font-extrabold text-slate-900">
                        {studentAttempts.length > 0 ? `${avgQuiz}%` : '—'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {studentAttempts.length > 0
                        ? `${passedTests} of ${studentAttempts.length} passed`
                        : 'No quizzes yet'}
                    </p>
                  </div>

                  {/* Code Lab Submissions */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">Code Lab</span>
                      <span className="font-extrabold text-slate-900">{studentSubs.length}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {studentSubs.length > 0
                        ? `${passedSubs} passed checks`
                        : 'No code submitted'}
                    </p>
                  </div>
                </div>

                {/* Right: Inspect Button */}
                <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(student)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Student Progress</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Progress Detail Modal */}
      {selectedStudent && (
        <StudentProgressModal
          student={selectedStudent}
          isOnline={
            presenceList.some(pr => pr.user_id === selectedStudent.id) ||
            selectedStudent.id === currentUserId
          }
          courses={courses}
          recalls={recalls}
          tasks={tasks}
          tests={tests}
          allProgress={allProgress}
          allAttempts={allAttempts}
          allSubmissions={allSubmissions}
          onClose={() => setSelectedStudent(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
