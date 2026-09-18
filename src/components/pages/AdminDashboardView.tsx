import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  BookOpen,
  CheckSquare,
  HelpCircle,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Eye,
  Sparkles,
  Layers,
  Send,
  UserCheck,
  Video,
  Image as ImageIcon,
  FileText,
  Code2,
  FileCode,
  Flame,
  Zap,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService, useStorageSync } from '../../services/storage';
import {
  Course,
  LessonRecall,
  Task,
  Test,
  Announcement,
  TaskRequirement,
  CourseType,
  MediaType,
  Question,
  QuestionOption,
  TestQuestion,
  TestOption,
  StudentProgress,
  TestAttempt,
} from '../../types';
import { StudentProgressTracker } from '../admin/StudentProgressTracker';
import { AICourseGeneratorSection } from '../admin/AICourseGeneratorSection';
import { GeminiCourseDraft } from '../../services/geminiCourseService';

interface AdminDashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

const MEDIA_PRESETS: Record<MediaType, string[]> = {
  picture: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
  ],
  video: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/UB1O30fR-EE',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ],
  presentation: [
    'https://docs.google.com/presentation/d/e/2PACX-1vT-demo/embed',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  ],
  gif: [
    'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/LmN8OYiY4m0X85K0Zz/giphy.gif',
  ],
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, isAdmin, profiles, presenceList, showToast, refreshProfiles } = useAuth();

  const [activeTab, setActiveTab] = useState<'courses' | 'presence' | 'recalls' | 'tasks' | 'tests' | 'submissions' | 'overview'>('courses');

  // Loaded from storage
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [recalls, setRecalls] = useState<LessonRecall[]>(() => StorageService.getRecalls());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [tests, setTests] = useState<Test[]>(() => StorageService.getTests());
  const [submissions, setSubmissions] = useState(() => StorageService.getSubmissions());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());

  // ==========================================
  // COMPREHENSIVE COURSE BUILDER STATE
  // ==========================================
  const [courseName, setCourseName] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('html');
  const [courseDetails, setCourseDetails] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('picture');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80');

  // Admin writes text & code example for student
  const [exampleTitle, setExampleTitle] = useState('Starter Code Example');
  const [adminNotes, setAdminNotes] = useState('Follow this template to construct your solution.');
  const [codeSnippet, setCodeSnippet] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Course Example</title>
</head>
<body>
  <h1>Welcome to Learn2Code</h1>
  <p>Learn coding step by step with WhatsApp sessions.</p>
</body>
</html>`);

  // Practical Task for Student
  const [taskTitle, setTaskTitle] = useState('');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [taskReq1, setTaskReq1] = useState('Must contain an <h1> heading tag');
  const [taskReq2, setTaskReq2] = useState('Must contain a <p> descriptive tag');
  const [taskPoints, setTaskPoints] = useState(50);

  // Automated Quiz Question & Answers
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptA, setQuizOptA] = useState('');
  const [quizOptB, setQuizOptB] = useState('');
  const [quizOptC, setQuizOptC] = useState('');
  const [quizOptD, setQuizOptD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [quizExplanation, setQuizExplanation] = useState('');

  // Standalone broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Real Platform metrics
  const [allSubmissions, setSubmissionsState] = useState(() => StorageService.getSubmissions());
  const [allAttempts, setAllAttempts] = useState<TestAttempt[]>(() => StorageService.getTestAttempts());
  const [allProgress, setAllProgress] = useState<StudentProgress[]>(() => StorageService.getProgress());

  const realStudents = profiles.filter(p => p.role === 'student');
  const realOnlineCount = presenceList.length;
  const realCompletedRecalls = allProgress.filter(p => p.status === 'completed').length;
  const realSubmittedTasks = allSubmissions.length;
  const avgTestScore = allAttempts.length
    ? Math.round(allAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / allAttempts.length)
    : 0;

  const syncVersion = useStorageSync([
    'courses',
    'recalls',
    'tasks',
    'tests',
    'submissions',
    'announcements',
    'progress',
    'profiles',
  ]);

  // Refresh all state from storage
  const reloadData = () => {
    setCourses(StorageService.getCourses());
    setRecalls(StorageService.getRecalls());
    setTasks(StorageService.getTasks());
    setTests(StorageService.getTests());
    const freshSubs = StorageService.getSubmissions();
    setSubmissions(freshSubs);
    setSubmissionsState(freshSubs);
    setAnnouncements(StorageService.getAnnouncements());
    setAllProgress(StorageService.getProgress());
    setAllAttempts(StorageService.getTestAttempts());
  };

  useEffect(() => {
    reloadData();
  }, [syncVersion]);

  // ==========================================
  // COURSE SUBMIT HANDLER
  // ==========================================
  const handlePublishCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      showToast('Please provide a course name');
      return;
    }

    const courseId = `course_${courseType}_${Date.now()}`;
    const recallId = `recall_${Date.now()}`;
    const taskId = `task_${Date.now()}`;
    const testId = `test_${Date.now()}`;

    // 1. Create Course
    const now = new Date().toISOString();
    const newCourse: Course = {
      id: courseId,
      title: courseName.trim(),
      description: courseDetails.trim() || `Master practical ${courseType.toUpperCase()} concepts.`,
      slug: courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      level: 'Beginner',
      order_index: courses.length + 1,
      image_url: mediaUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      media_type: mediaType,
      media_url: mediaUrl,
      course_type: courseType,
      code_example_title: exampleTitle.trim(),
      code_example_explanation: adminNotes.trim(),
      code_example: codeSnippet,
      status: 'published',
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    // 2. Create Lesson Recall
    const newRecall: LessonRecall = {
      id: recallId,
      course_id: courseId,
      title: `${courseName.trim()} — Lesson Recall`,
      whatsapp_session_title: `${courseName.trim()} Live WhatsApp Session`,
      whatsapp_date: 'Today, 8:00 PM',
      body: `${courseDetails.trim()}\n\nTeacher Notes:\n${adminNotes.trim()}`,
      key_takeaways: [
        `Understand core ${courseType.toUpperCase()} structure and syntax`,
        'Apply principles directly inside the Code Lab',
        'Review WhatsApp room discussion notes',
      ],
      materials: [
        {
          id: `mat_${Date.now()}`,
          recall_id: recallId,
          file_name: `${courseName.toLowerCase().replace(/\s+/g, '_')}_resource`,
          file_path: mediaUrl,
          mime_type: mediaType === 'video' ? 'video/mp4' : mediaType === 'presentation' ? 'application/pdf' : 'image/jpeg',
          size: '1.5 MB',
          slide_count: 1,
          slide_previews: [`Overview: ${courseName}`],
          created_at: now,
        },
      ],
      created_by: currentUser.id,
      published: true,
      order_index: 1,
      created_at: now,
      updated_at: now,
    };

    // 3. Create Task (Code Lab Assignment)
    const effectiveTaskTitle = taskTitle.trim() || `Practical: ${courseName.trim()}`;
    const target1 = courseType === 'html' ? 'h1' : courseType === 'css' ? '.container' : 'body';
    const target2 = courseType === 'html' ? 'p' : courseType === 'css' ? 'body' : 'body';
    const reqs: TaskRequirement[] = [
      {
        id: `req_${Date.now()}_1`,
        description: taskReq1.trim() || 'Must implement required element structure',
        type: courseType === 'css' ? 'css_property' : 'html_tag',
        target: target1,
        rule_type: 'selector_exists',
        rule_target: target1,
        points: Math.round(taskPoints / 2),
      },
      {
        id: `req_${Date.now()}_2`,
        description: taskReq2.trim() || 'Must pass structural validation',
        type: courseType === 'css' ? 'css_property' : 'html_tag',
        target: target2,
        rule_type: 'selector_exists',
        rule_target: target2,
        points: taskPoints - Math.round(taskPoints / 2),
      },
    ];

    const newTask: Task = {
      id: taskId,
      course_id: courseId,
      recall_id: recallId,
      title: effectiveTaskTitle,
      instructions: taskInstructions.trim() || `Implement the coding assignment for ${courseName.trim()}. Follow the teacher instructions and verify your code in the preview.`,
      starter_code: {
        html: courseType === 'html' ? codeSnippet : `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="container">\n    <h1>${courseName}</h1>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
        css: courseType === 'css' ? codeSnippet : `body { font-family: sans-serif; padding: 20px; }\n.container { max-width: 600px; margin: 0 auto; }`,
        js: courseType === 'js' ? codeSnippet : `console.log("Learn2Code initialized for ${courseName}");`,
      },
      requirements: reqs,
      points: taskPoints || 50,
      auto_grade_config: {
        required_files: ['index.html', 'style.css', 'script.js'],
        checks: reqs,
      },
      published: true,
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    // 4. Create Quiz Question (if provided)
    if (quizQuestion.trim() && quizOptA.trim() && quizOptB.trim()) {
      const qId = `q_${Date.now()}`;
      const options: QuestionOption[] = [
        { id: 'opt_a', question_id: qId, option_text: quizOptA.trim(), is_correct: correctOption === 'A', explanation: quizExplanation.trim() },
        { id: 'opt_b', question_id: qId, option_text: quizOptB.trim(), is_correct: correctOption === 'B', explanation: quizExplanation.trim() },
      ];
      if (quizOptC.trim()) options.push({ id: 'opt_c', question_id: qId, option_text: quizOptC.trim(), is_correct: correctOption === 'C', explanation: quizExplanation.trim() });
      if (quizOptD.trim()) options.push({ id: 'opt_d', question_id: qId, option_text: quizOptD.trim(), is_correct: correctOption === 'D', explanation: quizExplanation.trim() });

      const newQuestion: Question = {
        id: qId,
        test_id: testId,
        question_text: quizQuestion.trim(),
        type: 'single_choice',
        order_index: 1,
        options,
        points: 25,
      };

      const newTest: Test = {
        id: testId,
        course_id: courseId,
        recall_id: recallId,
        title: `${courseName.trim()} Comprehension Quiz`,
        instructions: `Answer the questions based on the WhatsApp lesson for ${courseName.trim()}.`,
        description: `Automated test covering ${courseName.trim()} topics.`,
        pass_score: 70,
        time_limit_seconds: 180,
        attempts_allowed: 3,
        published: true,
        questions: [newQuestion],
        created_by: currentUser.id,
        created_at: now,
      };

      StorageService.saveTest(newTest);
    }

    // Save all to database
    StorageService.saveCourse(newCourse);
    StorageService.saveRecall(newRecall);
    StorageService.saveTask(newTask);

    // Notify all active students
    StorageService.saveNotification({
      id: `notif_${Date.now()}`,
      user_id: 'broadcast',
      title: `📚 New Course Available: ${courseName.trim()}`,
      body: `Admin published ${courseName.trim()} with media, lesson recall, Code Lab task, and quiz!`,
      link_target: { view: 'learn', id: courseId },
      created_at: new Date().toISOString(),
    });

    reloadData();

    // Reset Form fields
    setCourseName('');
    setCourseDetails('');
    setTaskTitle('');
    setTaskInstructions('');
    setQuizQuestion('');
    setQuizOptA('');
    setQuizOptB('');
    setQuizOptC('');
    setQuizOptD('');
    setQuizExplanation('');

    showToast('🎉 Course published! Available immediately to all students.');
  };

  // Helper to map string to CourseType
  const mapCourseType = (type: string): CourseType => {
    const upper = type?.toUpperCase();
    if (upper === 'CSS') return 'CSS';
    if (upper === 'JS' || upper === 'JAVASCRIPT') return 'JS';
    if (upper === 'FULLSTACK') return 'Fullstack';
    return 'HTML';
  };

  // Populate manual editor form from AI draft
  const handleApplyDraftToForm = (draft: GeminiCourseDraft) => {
    setCourseName(draft.title);
    setCourseType(mapCourseType(draft.course_type));
    setCourseDetails(draft.description);
    setMediaType('picture');
    setMediaUrl(draft.image_url);
    setExampleTitle(draft.code_example_title || 'Starter Code Example');
    setAdminNotes(draft.code_example_explanation || 'Inspect and customize this starter code.');
    setCodeSnippet(draft.code_example);
    setTaskTitle(draft.task.title);
    setTaskInstructions(draft.task.instructions);
    setTaskPoints(draft.task.points || 50);
    setTaskReq1(draft.task.requirements[0]?.description || 'Must contain required tags');
    setTaskReq2(draft.task.requirements[1]?.description || 'Must implement structural design');
    setQuizQuestion(draft.quiz.question);
    setQuizOptA(draft.quiz.options.find(o => o.id === 'A')?.text || '');
    setQuizOptB(draft.quiz.options.find(o => o.id === 'B')?.text || '');
    setQuizOptC(draft.quiz.options.find(o => o.id === 'C')?.text || '');
    setQuizOptD(draft.quiz.options.find(o => o.id === 'D')?.text || '');
    setCorrectOption(draft.quiz.correct_option);
    setQuizExplanation(draft.quiz.explanation);

    const formEl = document.getElementById('manual-course-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Direct publish AI draft with explicit user permission granted
  const handleDirectPublishDraft = (draft: GeminiCourseDraft) => {
    const courseId = `course_${draft.course_type}_${Date.now()}`;
    const recallId = `recall_${Date.now()}`;
    const taskId = `task_${Date.now()}`;
    const testId = `test_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Create Course
    const newCourse: Course = {
      id: courseId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      level: draft.level,
      order_index: courses.length + 1,
      image_url: draft.image_url,
      media_type: 'picture',
      media_url: draft.image_url,
      course_type: mapCourseType(draft.course_type),
      code_example_title: draft.code_example_title,
      code_example_explanation: draft.code_example_explanation,
      code_example: draft.code_example,
      status: 'published',
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    // 2. Create Recall
    const newRecall: LessonRecall = {
      id: recallId,
      course_id: courseId,
      title: draft.lesson_recall.title,
      whatsapp_session_title: draft.lesson_recall.whatsapp_session_title,
      whatsapp_date: draft.lesson_recall.whatsapp_date,
      body: draft.lesson_recall.body,
      key_takeaways: draft.lesson_recall.key_takeaways,
      materials: [
        {
          id: `mat_${Date.now()}`,
          recall_id: recallId,
          file_name: `${draft.title.toLowerCase().replace(/\s+/g, '_')}_resource`,
          file_path: draft.image_url,
          mime_type: 'image/jpeg',
          size: '1.2 MB',
          slide_count: 1,
          slide_previews: [`Overview: ${draft.title}`],
          created_at: now,
        },
      ],
      created_by: currentUser.id,
      published: true,
      order_index: 1,
      created_at: now,
      updated_at: now,
    };

    // 3. Create Task
    const reqs: TaskRequirement[] = draft.task.requirements.map((r, idx) => ({
      id: `req_${Date.now()}_${idx + 1}`,
      description: r.description,
      type: draft.course_type === 'css' ? 'css_property' : 'html_tag',
      target: r.target || 'body',
      rule_type: 'selector_exists',
      rule_target: r.target || 'body',
      points: Math.round(draft.task.points / Math.max(1, draft.task.requirements.length)),
    }));

    const newTask: Task = {
      id: taskId,
      course_id: courseId,
      recall_id: recallId,
      title: draft.task.title,
      instructions: draft.task.instructions,
      starter_code: {
        html: draft.course_type === 'html' ? draft.code_example : `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="container">\n    <h1>${draft.title}</h1>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
        css: draft.course_type === 'css' ? draft.code_example : `body { font-family: sans-serif; padding: 20px; }\n.container { max-width: 600px; margin: 0 auto; }`,
        js: draft.course_type === 'js' ? draft.code_example : `console.log("Ready for ${draft.title}");`,
      },
      requirements: reqs,
      points: draft.task.points,
      auto_grade_config: {
        required_files: ['index.html', 'style.css', 'script.js'],
        checks: reqs,
      },
      published: true,
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    // 4. Create Quiz
    if (draft.quiz && draft.quiz.question) {
      const qId = `q_${Date.now()}`;
      const options: QuestionOption[] = draft.quiz.options.map(opt => ({
        id: `opt_${opt.id.toLowerCase()}`,
        question_id: qId,
        option_text: opt.text,
        is_correct: opt.id === draft.quiz.correct_option,
        explanation: draft.quiz.explanation,
      }));

      const newQuestion: Question = {
        id: qId,
        test_id: testId,
        question_text: draft.quiz.question,
        type: 'single_choice',
        order_index: 1,
        options,
        points: 25,
      };

      const newTest: Test = {
        id: testId,
        course_id: courseId,
        recall_id: recallId,
        title: `${draft.title} Comprehension Quiz`,
        instructions: `Test your understanding of ${draft.title}.`,
        description: `Automated assessment for ${draft.title}.`,
        pass_score: 70,
        time_limit_seconds: 180,
        attempts_allowed: 3,
        published: true,
        questions: [newQuestion],
        created_by: currentUser.id,
        created_at: now,
      };

      StorageService.saveTest(newTest);
    }

    StorageService.saveCourse(newCourse);
    StorageService.saveRecall(newRecall);
    StorageService.saveTask(newTask);

    // Broadcast announcement & notification
    StorageService.addAnnouncement({
      title: `New Course Released: ${draft.title}`,
      body: `Admin approved AI course curriculum "${draft.title}" with live Code Lab task and interactive quiz. Start learning now!`,
      tag: 'Platform Update',
      published: true,
      created_by: currentUser.id,
    });

    StorageService.saveNotification({
      id: `notif_${Date.now()}`,
      user_id: 'broadcast',
      title: `🚀 New Course: ${draft.title}`,
      body: `A new verified course with Code Lab assignment and quiz is now available!`,
      link_target: { view: 'learn', id: courseId },
      created_at: now,
    });

    reloadData();
    showToast(`🎉 Permission granted! Course "${draft.title}" published live with all tasks and questions.`);

    const coursesListEl = document.getElementById('published-courses-section');
    if (coursesListEl) coursesListEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    if (confirm(`Are you sure you want to delete "${courseTitle}" and all its linked recalls, tasks, and tests?`)) {
      StorageService.deleteCourse(courseId);
      reloadData();
      showToast(`Course "${courseTitle}" deleted from database`);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;

    StorageService.addAnnouncement({
      title: broadcastTitle,
      body: broadcastBody || 'Check WhatsApp discussion room for details.',
      tag: 'WhatsApp Session',
      published: true,
      created_by: currentUser.id,
    });

    StorageService.saveNotification({
      id: `notif_${Date.now()}`,
      user_id: 'broadcast',
      title: broadcastTitle,
      body: broadcastBody || 'Check WhatsApp discussion room for details.',
      link_target: { view: 'home' },
      created_at: new Date().toISOString(),
    });

    setBroadcastTitle('');
    setBroadcastBody('');
    showToast('Broadcast published to all students live on the web!');
  };

  const handleDeleteAnnouncement = (annId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      StorageService.deleteAnnouncement(annId);
      setAnnouncements(StorageService.getAnnouncements());
      showToast('Announcement post deleted successfully');
    }
  };

  if (!isAdmin) {
    return (
      <div id="admin-access-denied" className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-150">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center shadow-inner">
          <Crown className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Administrator Access Required</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Not everybody is eligible for administrative control. The system automatically detects authorized administrators (<span className="font-semibold text-purple-700">Eunice Ajayi</span> &amp; <span className="font-semibold text-purple-700">Emmanuel Bobi</span>) when they sign in.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left max-w-md mx-auto space-y-1">
          <p className="font-bold text-slate-800">Current active account:</p>
          <p className="font-mono text-slate-600">{currentUser?.email || 'Guest Student'} ({currentUser?.role?.toUpperCase() || 'STUDENT'})</p>
          <p className="text-[11px] text-slate-400 pt-1">
            Sign in with an authorized instructor email address to unlock course creation, quiz editing, and grading.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Return to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Official Admin Management Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Curriculum & Classroom Controller
          </h1>
          <p className="text-xs text-purple-200">
            Logged in as: <strong className="text-white">{currentUser.email}</strong> ({currentUser.display_name})
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Switch to Student View</span>
        </button>
      </div>

      {/* Real Analytics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Registered Students</span>
          </div>
          <p className="text-xl font-black text-slate-900">{realStudents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Real accounts in database</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-semibold">Live Online</span>
          </div>
          <p className="text-xl font-black text-emerald-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {realOnlineCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active browser heartbeats</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold">Courses Published</span>
          </div>
          <p className="text-xl font-black text-slate-900">{courses.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Custom instructor courses</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-purple-600 mb-1">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs font-semibold">Task Submissions</span>
          </div>
          <p className="text-xl font-black text-slate-900">{realSubmittedTasks}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Code Lab projects graded</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-semibold">Quiz Pass Average</span>
          </div>
          <p className="text-xl font-black text-slate-900">{avgTestScore}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{allAttempts.length} total attempts</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'courses', label: 'Course & Quiz Builder', count: courses.length },
          { id: 'presence', label: 'Student Progress & Roster', count: realStudents.length },
          { id: 'submissions', label: 'Task Submissions', count: realSubmittedTasks },
          { id: 'overview', label: 'WhatsApp Broadcasts' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* TAB 1: COURSE BUILDER & LIST */}
      {/* ========================================== */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          {/* AI Auto-Course Creator (Gemini Flash) with Mandatory Admin Permission */}
          <AICourseGeneratorSection
            onApplyDraftToForm={handleApplyDraftToForm}
            onDirectPublish={handleDirectPublishDraft}
            showToast={showToast}
          />

          {/* Create New Course Form (Manual or AI-Populated) */}
          <div id="manual-course-form" className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Course & Content Publishing Form
                </h2>
                <p className="text-xs text-slate-500">
                  Manual editor or pre-filled from Gemini AI. This creates the Course, Lesson Recall, Code Lab Task, and Interactive Quiz.
                </p>
              </div>
            </div>

            <form onSubmit={handlePublishCourse} className="space-y-6">
              {/* SECTION 1: Course Basics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>1. Course Information & Type</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course Name / Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                      placeholder="e.g. Introduction to HTML Semantic Elements"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Type of Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={courseType}
                      onChange={e => setCourseType(e.target.value as CourseType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-bold text-slate-800"
                    >
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="js">JavaScript (JS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Details & Description
                  </label>
                  <textarea
                    rows={3}
                    value={courseDetails}
                    onChange={e => setCourseDetails(e.target.value)}
                    placeholder="Write a clear explanation of what the student will learn from this course..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Media Resource */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>2. Media Resource (Pic / Video / Presentation / GIF)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Media Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['picture', 'video', 'presentation', 'gif'] as MediaType[]).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setMediaType(type);
                            setMediaUrl(MEDIA_PRESETS[type][0] || '');
                          }}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border capitalize transition cursor-pointer flex flex-col items-center gap-1 ${
                            mediaType === type
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type === 'picture' && <ImageIcon className="w-3.5 h-3.5" />}
                          {type === 'video' && <Video className="w-3.5 h-3.5" />}
                          {type === 'presentation' && <FileText className="w-3.5 h-3.5" />}
                          {type === 'gif' && <Sparkles className="w-3.5 h-3.5" />}
                          <span>{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Media URL (or select preset below)
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={e => setMediaUrl(e.target.value)}
                      placeholder="Paste image URL, YouTube embed URL, slide deck URL, or GIF link"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                      {MEDIA_PRESETS[mediaType]?.slice(0, 3).map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMediaUrl(url)}
                          className="text-[10px] text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md transition cursor-pointer"
                        >
                          Preset #{i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Admin Text & Code Example for Student */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>3. Teacher Notes & Code Example for Student</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Example Title
                    </label>
                    <input
                      type="text"
                      value={exampleTitle}
                      onChange={e => setExampleTitle(e.target.value)}
                      placeholder="e.g. Flexbox Navigation Template"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teacher Advice / Notes for Student
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="e.g. Remember to always close semantic tags."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code Example Snippet (shown to students to learn from)
                  </label>
                  <textarea
                    rows={5}
                    value={codeSnippet}
                    onChange={e => setCodeSnippet(e.target.value)}
                    className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 4: Practical Code Lab Task */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  <span>4. Practical Assignment (Code Lab Task)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      placeholder="e.g. Build an HTML Profile Card"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      XP Points Awarded
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={taskPoints}
                      onChange={e => setTaskPoints(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={taskInstructions}
                    onChange={e => setTaskInstructions(e.target.value)}
                    placeholder="Instructions explaining what code the student must write in the Code Lab..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requirement #1 (Target Rule)
                    </label>
                    <input
                      type="text"
                      value={taskReq1}
                      onChange={e => setTaskReq1(e.target.value)}
                      placeholder="e.g. Must contain an <h1> tag"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requirement #2 (Target Rule)
                    </label>
                    <input
                      type="text"
                      value={taskReq2}
                      onChange={e => setTaskReq2(e.target.value)}
                      placeholder="e.g. Must contain a <p> tag"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Quiz Question & Answers */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>5. Automated Quiz Question & Answer</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={e => setQuizQuestion(e.target.value)}
                    placeholder="e.g. Which HTML tag is used for the main heading of a page?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option A</label>
                    <input
                      type="text"
                      value={quizOptA}
                      onChange={e => setQuizOptA(e.target.value)}
                      placeholder="e.g. <h1>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option B</label>
                    <input
                      type="text"
                      value={quizOptB}
                      onChange={e => setQuizOptB(e.target.value)}
                      placeholder="e.g. <header>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option C (optional)</label>
                    <input
                      type="text"
                      value={quizOptC}
                      onChange={e => setQuizOptC(e.target.value)}
                      placeholder="e.g. <title>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option D (optional)</label>
                    <input
                      type="text"
                      value={quizOptD}
                      onChange={e => setQuizOptD(e.target.value)}
                      placeholder="e.g. <main>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correct Answer Selection
                    </label>
                    <select
                      value={correctOption}
                      onChange={e => setCorrectOption(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 bg-white"
                    >
                      <option value="A">Option A is Correct</option>
                      <option value="B">Option B is Correct</option>
                      <option value="C">Option C is Correct</option>
                      <option value="D">Option D is Correct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Explanation for Student
                    </label>
                    <input
                      type="text"
                      value={quizExplanation}
                      onChange={e => setQuizExplanation(e.target.value)}
                      placeholder="Why this answer is correct..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Course, Assignment & Quiz to Curriculum</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Published Courses */}
          <div id="published-courses-section" className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Published Courses ({courses.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Manage the courses available to students. Click to preview or remove.
                </p>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm text-slate-600">No courses in the curriculum yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the form above to add your first course!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(c => {
                  const cRecalls = recalls.filter(r => r.course_id === c.id);
                  const cTasks = tasks.filter(t => t.course_id === c.id);
                  const cTests = tests.filter(t => t.course_id === c.id);

                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition bg-slate-50/50 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200 flex items-center justify-center">
                          {c.image_url?.trim() ? (
                            <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                              {c.course_type || 'html'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {c.media_type || 'picture'}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 truncate">{c.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                        <div className="text-[11px] text-slate-500 font-medium">
                          <span>{cRecalls.length} Recalls</span> • <span>{cTasks.length} Tasks</span> • <span>{cTests.length} Quizzes</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate('learn', c.id)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Preview as Student"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: STUDENT PROGRESS & ROSTER */}
      {/* ========================================== */}
      {activeTab === 'presence' && (
        <StudentProgressTracker
          students={realStudents}
          presenceList={presenceList}
          courses={courses}
          recalls={recalls}
          tasks={tasks}
          tests={tests}
          allProgress={allProgress}
          allAttempts={allAttempts}
          allSubmissions={submissions}
          currentUserId={currentUser.id}
          onRefresh={reloadData}
        />
      )}

      {/* ========================================== */}
      {/* TAB 3: SUBMISSIONS */}
      {/* ========================================== */}
      {activeTab === 'submissions' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Student Code Lab Submissions</h3>
              <p className="text-xs text-slate-500">Auto-evaluated student projects with score breakdowns</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
              {allSubmissions.length} Submissions
            </span>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm text-slate-600">No submissions received yet</p>
              <p className="text-xs text-slate-400 mt-1">Once students submit code in the Code Lab, they will be logged here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allSubmissions.map(sub => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{sub.task_id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub.feedback}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {sub.score} / {sub.max_score} pts
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: WHATSAPP BROADCASTS */}
      {/* ========================================== */}
      {activeTab === 'overview' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Push WhatsApp Broadcast</h3>
              <p className="text-xs text-slate-500">Sends high-priority community notification to all active students</p>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. WhatsApp Voice Lecture starts in 15 mins!"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Body</label>
              <textarea
                value={broadcastBody}
                onChange={e => setBroadcastBody(e.target.value)}
                rows={3}
                placeholder="Include WhatsApp room links, lecture topic, or reminders..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Announcement</span>
              </button>
            </div>
          </form>

          {/* Manage Published Announcements */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Published Announcements ({announcements.length})
            </h4>
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400">No active broadcast announcements.</p>
            ) : (
              <div className="space-y-2">
                {announcements.map(ann => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                          {ann.tag}
                        </span>
                        <h5 className="font-bold text-slate-900">{ann.title}</h5>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{ann.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
