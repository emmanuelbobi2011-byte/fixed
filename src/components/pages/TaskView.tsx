import React, { useState } from 'react';
import {
  CheckSquare,
  Code2,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { Task, Submission } from '../../types';
import { AdContainer } from '../common/AdContainer';

interface TaskViewProps {
  taskId?: string;
  onNavigate: (view: string, id?: string) => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ taskId, onNavigate }) => {
  const { currentUser, showToast } = useAuth();
  const allTasks = StorageService.getTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>(taskId || allTasks[0]?.id || 'task_html_01');
  const [isGrading, setIsGrading] = useState(false);

  const activeTask = allTasks.find(t => t.id === selectedTaskId) || allTasks[0];
  const submissions = StorageService.getSubmissions(currentUser.id, activeTask?.id);
  const latestSubmission: Submission | undefined = submissions[0];

  const handleOpenInCodeLab = () => {
    onNavigate('code-lab', activeTask.id);
  };

  const handleAutoGradeFromTask = () => {
    setIsGrading(true);

    // Get current project or create from starter code
    const projects = StorageService.getProjects(currentUser.id);
    let project = projects.find(p => p.task_id === activeTask.id);
    if (!project) {
      project = {
        id: `proj_${Date.now()}`,
        user_id: currentUser.id,
        task_id: activeTask.id,
        name: `${activeTask.title} Solution`,
        files: {
          'index.html': activeTask.starter_code?.html || '<h1>Developer Profile</h1>',
          'style.css': activeTask.starter_code?.css || 'body { font-family: sans-serif; }',
          'script.js': activeTask.starter_code?.js || 'console.log("Ready");',
        },
        active_file: 'index.html',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      StorageService.saveProject(project);
    }

    setTimeout(() => {
      const gradeResult = StorageService.gradeTaskSolution(activeTask, project!.files);

      const submission: Submission = {
        id: `sub_${Date.now()}`,
        task_id: activeTask.id,
        user_id: currentUser.id,
        project_id: project!.id,
        project_files: project!.files,
        status: 'graded',
        score: gradeResult.score,
        max_score: gradeResult.maxScore,
        passed: gradeResult.passed,
        feedback: gradeResult.feedback,
        auto_grade_results: gradeResult.results,
        submitted_at: new Date().toISOString(),
        graded_at: new Date().toISOString(),
      };

      StorageService.saveSubmission(submission);
      if (gradeResult.passed) {
        StorageService.updateProgress(currentUser.id, activeTask.course_id, activeTask.recall_id, 100);
      }

      setIsGrading(false);
      showToast(gradeResult.passed ? '🎉 Assignment passed! Points awarded.' : 'Submitted. Review requirements feedback.');
    }, 1000);
  };

  return (
    <div id="practical-tasks-view" className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Practical Homework
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Hands-on Coding Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete the coding challenge in the interactive Code Lab and verify automated checks.
          </p>
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {allTasks.map(t => {
          const isSelected = t.id === selectedTaskId;
          const sub = StorageService.getSubmissions(currentUser.id, t.id)[0];

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTaskId(t.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{t.title}</span>
              {sub?.passed && (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Task Main Card */}
      {activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2 Cols Left: Requirements, Instructions, Launcher */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeTask.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Course Module: {activeTask.course_id.replace('course_', '').toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{activeTask.points} Total Points</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assignment Instructions
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeTask.instructions}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Automated Grading Checks ({activeTask.requirements.length})
                </h3>
                <div className="space-y-2">
                  {activeTask.requirements.map((req, idx) => {
                    const checkResult = latestSubmission?.auto_grade_results?.find(r => r.check_id === req.id);
                    const isPassed = checkResult?.passed;

                    return (
                      <div
                        key={req.id}
                        className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 text-xs ${
                          isPassed
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 text-[10px] font-bold flex items-center justify-center text-slate-500">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{req.description}</p>
                            {req.hint && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Hint: {req.hint}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0 text-slate-500">
                          {req.target}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleOpenInCodeLab}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Open & Code in Code Lab</span>
                </button>

                <button
                  type="button"
                  disabled={isGrading}
                  onClick={handleAutoGradeFromTask}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  {isGrading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Grading Submission...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-purple-600" />
                      <span>Run Checks & Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 1 Col Right: Submission State & Grading Status */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Submission Status
              </h3>

              {latestSubmission ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${
                    latestSubmission.passed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{latestSubmission.passed ? 'PASSED & APPROVED' : 'NEEDS REVISION'}</span>
                      <span className="text-sm">{latestSubmission.score} / {latestSubmission.max_score} pts</span>
                    </div>
                    <p className="text-xs mt-2 leading-relaxed">
                      {latestSubmission.feedback}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>Submitted: {new Date(latestSubmission.submitted_at).toLocaleString()}</p>
                    <p>Status: Automatic Rule Verification Complete</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                  <p>You haven't submitted this task yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Open Code Lab to write your solution, then click "Submit for Task Auto-Grading"!
                  </p>
                </div>
              )}
            </div>

            <AdContainer placement="content-bottom" />
          </div>
        </div>
      )}
    </div>
  );
};
