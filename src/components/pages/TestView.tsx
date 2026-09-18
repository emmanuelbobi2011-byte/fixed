import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Check,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { Test, TestAttempt, TestAnswer } from '../../types';
import { AdContainer } from '../common/AdContainer';

interface TestViewProps {
  testId?: string;
  onNavigate: (view: string, id?: string) => void;
}

export const TestView: React.FC<TestViewProps> = ({ testId, onNavigate }) => {
  const { currentUser, showToast } = useAuth();
  const allTests = StorageService.getTests();
  const [selectedTestId, setSelectedTestId] = useState<string>(testId || allTests[0]?.id || 'test_html_01');
  const activeTest = allTests.find(t => t.id === selectedTestId) || allTests[0];

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(activeTest?.time_limit_seconds || 240);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, selectedAnswers]);

  // Reset when test changes
  useEffect(() => {
    setSelectedAnswers({});
    setTimeLeft(activeTest?.time_limit_seconds || 240);
    setIsSubmitted(false);
    setCurrentAttempt(null);
  }, [selectedTestId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted || !activeTest) return;

    let earnedPoints = 0;
    let totalPossible = 0;

    const answers: TestAnswer[] = activeTest.questions.map(q => {
      totalPossible += q.points;
      const chosenOptionId = selectedAnswers[q.id];
      const chosenOpt = q.options.find(o => o.id === chosenOptionId);
      const isCorrect = !!chosenOpt?.is_correct;
      const pts = isCorrect ? q.points : 0;
      earnedPoints += pts;

      return {
        id: `ans_${Date.now()}_${q.id}`,
        attempt_id: `att_${Date.now()}`,
        question_id: q.id,
        selected_option_id: chosenOptionId || '',
        is_correct: isCorrect,
        points_awarded: pts,
      };
    });

    const percentage = Math.round((earnedPoints / Math.max(totalPossible, 1)) * 100);
    const passed = percentage >= activeTest.pass_score;

    const attempt: TestAttempt = {
      id: `att_${Date.now()}`,
      test_id: activeTest.id,
      user_id: currentUser.id,
      score: earnedPoints,
      total_points: totalPossible,
      percentage,
      passed,
      answers,
      started_at: new Date(Date.now() - (activeTest.time_limit_seconds - timeLeft) * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
    };

    StorageService.saveTestAttempt(attempt);
    if (passed) {
      StorageService.updateProgress(currentUser.id, activeTest.course_id, activeTest.recall_id, 100);
      StorageService.awardXP(currentUser.id, activeTest.xp_reward || 30, `Passed quiz: ${activeTest.title}`);
    }

    setCurrentAttempt(attempt);
    setIsSubmitted(true);
    showToast(passed ? `🎉 You passed! +${activeTest.xp_reward || 30} XP awarded to your profile.` : 'Quiz completed. Check explanations below.');
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setTimeLeft(activeTest?.time_limit_seconds || 240);
    setIsSubmitted(false);
    setCurrentAttempt(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = activeTest?.questions.length || 0;

  return (
    <div id="quiz-tests-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Header & Test Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              WhatsApp Poll Style Testing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Knowledge Quizzes & Tests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test your comprehension of WhatsApp session topics with automated scoring and instant feedback.
          </p>
        </div>

        {/* Timer Badge */}
        {!isSubmitted && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold ${
            timeLeft < 60
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Time Left: {formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Test Tabs */}
      {allTests.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allTests.map(t => {
            const isSelected = t.id === selectedTestId;
            const userAttempts = StorageService.getTestAttempts(currentUser.id).filter(a => a.test_id === t.id);
            const hasPassed = userAttempts.some(a => a.passed);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTestId(t.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{t.title}</span>
                {hasPassed && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 shadow-xs">
          <HelpCircle className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-80" />
          <h3 className="font-bold text-slate-800 text-sm">No Quizzes Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Instructors can post automated multi-choice quizzes linked to courses from the Admin Hub.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('learn')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
          >
            Browse Courses
          </button>
        </div>
      )}

      {activeTest && (
        <>
          {/* Result Card if submitted */}
          {isSubmitted && currentAttempt && (
            <div
              id="quiz-official-result-card"
              className={`rounded-3xl p-6 sm:p-7 border shadow-sm ${
                currentAttempt.passed
                  ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300 text-emerald-950'
                  : 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ${
                    currentAttempt.passed ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {currentAttempt.percentage}%
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                      {currentAttempt.passed ? 'Official Status: Passed' : 'Official Status: Did Not Pass'}
                    </span>
                    <h2 className="text-xl font-bold mt-1">
                      {currentAttempt.passed ? 'Congratulations! Quiz Cleared' : 'Needs Practice'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">Points Awarded</p>
                    <p className="text-lg font-black">{currentAttempt.score} / {currentAttempt.total_points} XP</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm mt-3 leading-relaxed">
                {currentAttempt.passed
                  ? `Great mastery! Passing requirement was ${activeTest.pass_score}%. Review question explanations below to solidify your understanding.`
                  : `You scored ${currentAttempt.percentage}%. The pass mark is ${activeTest.pass_score}%. Take your time and retry!`}
              </p>
            </div>
          )}

          {/* Test Questions (WhatsApp Poll Style) */}
          <div className="space-y-5">
            {activeTest.questions.map((question, qIdx) => {
              const selectedOptionId = selectedAnswers[question.id];
              const isAnswered = !!selectedOptionId;

              return (
                <div
                  key={question.id}
                  className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {question.question_text}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      {question.points} pts
                    </span>
                  </div>

                  {/* Poll-style Options List */}
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedOptionId === option.id;

                      // If submitted, show correct/incorrect indicators
                      let optionBorder = 'border-slate-200 hover:border-slate-300 bg-slate-50/50';
                      if (isSelected) {
                        optionBorder = 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500';
                      }

                      if (isSubmitted) {
                        if (option.is_correct) {
                          optionBorder = 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-900 font-semibold';
                        } else if (isSelected && !option.is_correct) {
                          optionBorder = 'border-rose-400 bg-rose-50/80 text-rose-900';
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(question.id, option.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${optionBorder}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                            }`}>
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-800">{option.option_text}</span>
                          </div>

                          {/* Status icon if submitted */}
                          {isSubmitted && (
                            <div className="shrink-0">
                              {option.is_correct ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-rose-500" />
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback if submitted */}
                  {isSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 mt-2">
                      <span className="font-bold text-slate-800 block mb-0.5">Teacher Explanation:</span>
                      {question.options.find(o => o.is_correct)?.explanation ||
                        'Verified against lesson curriculum notes.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action Bar */}
          {!isSubmitted && (
            <div className="sticky bottom-16 md:bottom-4 z-30 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">{answeredCount} of {totalQuestions}</span> questions answered
              </div>

              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Submit Official Answers</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <AdContainer placement="result-page" />
        </>
      )}
    </div>
  );
};
