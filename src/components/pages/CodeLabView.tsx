import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Save,
  RotateCcw,
  Send,
  Plus,
  Trash2,
  FileCode,
  Terminal,
  Eye,
  CheckCircle2,
  Sparkles,
  Download,
  Check,
  Code2,
  WrapText,
  Type,
  Wand2,
  Flame,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { ProjectState, Submission, Task } from '../../types';

interface CodeLabViewProps {
  taskId?: string;
  onNavigate: (view: string, id?: string) => void;
}

const DEFAULT_FILES: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learn2Code Lab</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <header>
      <h1>Alex Johnson</h1>
      <p class="tag">Frontend Apprentice • Batch #4</p>
    </header>

    <main>
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Alex Developer Avatar" class="avatar">
      <p class="bio">Learning semantic HTML, CSS Flexbox and JS DOM manipulation through WhatsApp live classes.</p>
      
      <button id="connect-btn">Connect on WhatsApp</button>
      <div id="output" class="output-box"></div>
    </main>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
  'style.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08);
  max-width: 380px;
  width: 100%;
  padding: 32px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

header h1 {
  font-size: 1.6rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.tag {
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 4px;
  margin-bottom: 20px;
}

.avatar {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 16px;
  border: 4px solid #dbeafe;
}

.bio {
  color: #475569;
  font-size: 0.925rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

button {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.output-box {
  margin-top: 14px;
  font-size: 0.85rem;
  color: #059669;
  font-weight: 600;
}`,
  'script.js': `// JavaScript runtime in Code Lab
console.log('Learn2Code Code Lab initialized!');

const btn = document.getElementById('connect-btn');
const output = document.getElementById('output');

if (btn && output) {
  btn.addEventListener('click', () => {
    output.textContent = '⚡ Connection signal sent! Instructor notified.';
    console.log('WhatsApp connection button triggered.');
  });
}`,
};

const SNIPPETS: Record<string, { label: string; code: string }[]> = {
  'index.html': [
    { label: '<header>', code: '<header>\n  <h1>Page Heading</h1>\n</header>\n' },
    { label: '<main>', code: '<main>\n  <p>Main content goes here.</p>\n</main>\n' },
    { label: '<section>', code: '<section class="content-section">\n  <h2>Section Title</h2>\n</section>\n' },
    { label: '<button>', code: '<button type="button">Click Me</button>\n' },
    { label: '<img>', code: '<img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" alt="Coding Banner" />\n' },
  ],
  'style.css': [
    { label: 'Flexbox Center', code: 'display: flex;\njustify-content: center;\nalign-items: center;\n' },
    { label: 'Card Shadow', code: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);\nborder-radius: 16px;\n' },
    { label: 'Responsive Grid', code: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\ngap: 16px;\n' },
    { label: 'Hover Transition', code: 'transition: all 0.2s ease;\ntransform: translateY(-2px);\n' },
  ],
  'script.js': [
    { label: 'console.log', code: 'console.log("Debug value:", data);\n' },
    { label: 'querySelector', code: 'const el = document.querySelector(".my-element");\n' },
    { label: 'addEventListener', code: 'el.addEventListener("click", () => {\n  console.log("Clicked!");\n});\n' },
    { label: 'fetch API', code: 'fetch("https://api.example.com/data")\n  .then(res => res.json())\n  .then(data => console.log(data));\n' },
  ],
};

export const CodeLabView: React.FC<CodeLabViewProps> = ({ taskId, onNavigate }) => {
  const { currentUser, showToast, setActivity } = useAuth();
  const allTasks = StorageService.getTasks();
  const linkedTask: Task | undefined = allTasks.find(t => t.id === taskId) || allTasks[0];

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);

  // Editor settings
  const [fontSize, setFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-sm');
  const [wordWrap, setWordWrap] = useState(true);

  // Projects state
  const [currentProject, setCurrentProject] = useState<ProjectState>(() => {
    const existing = StorageService.getProjects(currentUser.id).find(p => p.task_id === linkedTask?.id);
    if (existing) return existing;

    const starterFiles = linkedTask?.starter_code
      ? {
          'index.html': linkedTask.starter_code.html,
          'style.css': linkedTask.starter_code.css,
          'script.js': linkedTask.starter_code.js,
        }
      : DEFAULT_FILES;

    return {
      id: `proj_${Date.now()}`,
      user_id: currentUser.id,
      task_id: linkedTask?.id,
      name: `${linkedTask?.title || 'My Project'}`,
      files: { ...starterFiles },
      active_file: 'index.html',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'error' | 'warn'; msg: string; time: string }[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  // Set activity for presence
  useEffect(() => {
    setActivity('code_lab');
  }, [setActivity]);

  // Synchronize scrolling between gutter and textarea
  const handleTextareaScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Intercept sandboxed iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'learn2code_sandbox') {
        const { type, msg } = event.data;
        setConsoleLogs(prev => [
          ...prev.slice(-30),
          {
            type: type || 'log',
            msg: typeof msg === 'object' ? JSON.stringify(msg) : String(msg),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Periodic autosave
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSaveStatus === 'unsaved') {
        handleSaveProject(true);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [autoSaveStatus, currentProject]);

  const handleCodeChange = (newContent: string) => {
    setCurrentProject(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [activeFile]: newContent,
      },
    }));
    setAutoSaveStatus('unsaved');
  };

  const handleSaveProject = (isAuto = false) => {
    setAutoSaveStatus('saving');
    StorageService.saveProject(currentProject);
    setTimeout(() => {
      setAutoSaveStatus('saved');
      if (!isAuto) {
        showToast('Project saved successfully');
      }
    }, 300);
  };

  const handleRunCode = () => {
    setPreviewKey(prev => prev + 1);
    setActiveTab('preview');
    showToast('Preview refreshed');
  };

  const handleResetCode = () => {
    if (confirm('Reset project files to initial starter template?')) {
      const resetFiles = linkedTask?.starter_code
        ? {
            'index.html': linkedTask.starter_code.html,
            'style.css': linkedTask.starter_code.css,
            'script.js': linkedTask.starter_code.js,
          }
        : DEFAULT_FILES;

      setCurrentProject(prev => ({
        ...prev,
        files: { ...resetFiles },
      }));
      setPreviewKey(prev => prev + 1);
      setAutoSaveStatus('unsaved');
      showToast('Starter files restored');
    }
  };

  // Keyboard enhancements: Indentation, Auto-Closing pairs, Ctrl+Enter, Ctrl+S
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const val = target.value;

    // Ctrl+Enter or Cmd+Enter: Run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
      return;
    }

    // Ctrl+S or Cmd+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSaveProject(false);
      return;
    }

    // Tab key: indent 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: dedent if at start of line
        const before = val.substring(0, start);
        if (before.endsWith('  ')) {
          const newVal = before.slice(0, -2) + val.substring(start);
          handleCodeChange(newVal);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = Math.max(0, start - 2);
          }, 0);
        }
      } else {
        const newVal = val.substring(0, start) + '  ' + val.substring(end);
        handleCodeChange(newVal);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }

    // Auto-closing pairs
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key] && start === end) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const newVal = val.substring(0, start) + e.key + closeChar + val.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  // Insert code snippet at cursor
  const handleInsertSnippet = (snippetCode: string) => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const val = target.value;
    const newVal = val.substring(0, start) + snippetCode + val.substring(end);
    handleCodeChange(newVal);
    setTimeout(() => {
      target.focus();
      target.selectionStart = target.selectionEnd = start + snippetCode.length;
    }, 0);
  };

  // Beautify / Format code
  const handleFormatCode = () => {
    const raw = currentProject.files[activeFile] || '';
    const lines = raw.split('\n');
    let indentLevel = 0;
    const formatted = lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('</') || trimmed.startsWith('}') || trimmed.startsWith(']')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indented = '  '.repeat(indentLevel) + trimmed;
        if (
          (trimmed.endsWith('{') || (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</'))) &&
          !trimmed.startsWith('<!--')
        ) {
          indentLevel++;
        }
        return indented;
      })
      .join('\n');

    handleCodeChange(formatted);
    showToast('Code cleanly formatted');
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim().toLowerCase();
    setCurrentProject(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [cleanName]: '/* New file */\n',
      },
    }));
    setActiveFile(cleanName);
    setNewFileName('');
    setShowNewFileModal(false);
    setAutoSaveStatus('unsaved');
  };

  const handleDeleteFile = (fileName: string) => {
    if (['index.html', 'style.css', 'script.js'].includes(fileName)) {
      showToast('Core project files cannot be removed');
      return;
    }
    const newFiles = { ...currentProject.files };
    delete newFiles[fileName];
    setCurrentProject(prev => ({ ...prev, files: newFiles }));
    setActiveFile('index.html');
    setAutoSaveStatus('unsaved');
  };

  const handleSubmitForTask = () => {
    if (!linkedTask) return;
    handleSaveProject(true);

    const grade = StorageService.gradeTaskSolution(linkedTask, currentProject.files);

    const submission: Submission = {
      id: `sub_${Date.now()}`,
      task_id: linkedTask.id,
      user_id: currentUser.id,
      project_id: currentProject.id,
      project_files: currentProject.files,
      status: 'graded',
      score: grade.score,
      max_score: grade.maxScore,
      passed: grade.passed,
      feedback: grade.feedback,
      auto_grade_results: grade.results,
      submitted_at: new Date().toISOString(),
      graded_at: new Date().toISOString(),
    };

    StorageService.saveSubmission(submission);
    if (grade.passed) {
      StorageService.updateProgress(currentUser.id, linkedTask.course_id, linkedTask.recall_id, 100);
      // Award REAL XP to user profile
      StorageService.awardXP(currentUser.id, grade.score, `Completed practical task: ${linkedTask.title}`);
    }

    setGradingResult(grade);
    showToast(grade.passed ? `🎉 Assignment passed! +${grade.score} XP added to your profile!` : 'Submission evaluated. Review feedback.');
  };

  // Build the sandboxed HTML payload with injected CSS, JS, linked multi-files, and console interceptor
  const buildPreviewSrcDoc = () => {
    let html = currentProject.files['index.html'] || '<h1>Empty HTML</h1>';
    
    // Resolve any <link rel="stylesheet" href="*.css"> dynamically from workspace files
    html = html.replace(/<link\s+[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => {
      const cleanPath = href.replace(/^\.\//, '');
      const cssContent = currentProject.files[cleanPath] ?? currentProject.files['style.css'] ?? '';
      return `<style>/* Inlined from ${cleanPath} */\n${cssContent}\n</style>`;
    });

    // Resolve any <script src="*.js"></script> dynamically from workspace files
    html = html.replace(/<script\s+[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi, (match, src) => {
      const cleanPath = src.replace(/^\.\//, '');
      const jsContent = currentProject.files[cleanPath] ?? currentProject.files['script.js'] ?? '';
      return `<script>/* Inlined from ${cleanPath} */\n${jsContent}\n</script>`;
    });

    const fallbackCss = currentProject.files['style.css'] || '';
    const fallbackJs = currentProject.files['script.js'] || '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${fallbackCss}
  </style>
  <script>
    (function() {
      const origLog = console.log;
      const origErr = console.error;
      const origWarn = console.warn;

      function post(type, args) {
        try {
          const str = Array.from(args).map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          window.parent.postMessage({ source: 'learn2code_sandbox', type: type, msg: str }, '*');
        } catch(e) {}
      }

      console.log = function() { origLog.apply(console, arguments); post('log', arguments); };
      console.error = function() { origErr.apply(console, arguments); post('error', arguments); };
      console.warn = function() { origWarn.apply(console, arguments); post('warn', arguments); };

      window.onerror = function(msg, url, line) {
        post('error', ['Runtime Error: ' + msg + ' (line ' + line + ')']);
      };
    })();
  </script>
</head>
<body>
  ${html.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*<\/head>|<body[^>]*>|<\/body>/gi, '')}
  <script>
    try {
      ${fallbackJs}
    } catch(err) {
      console.error(err.message);
    }
  </script>
</body>
</html>`;
  };

  const currentCode = currentProject.files[activeFile] || '';
  const linesCount = (currentCode.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div id="code-lab-ide" className="space-y-4 animate-in fade-in duration-150">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight">
                {currentProject.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                HTML/CSS/JS Sandbox
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  autoSaveStatus === 'saved' ? 'bg-emerald-500' : autoSaveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                }`} />
                {autoSaveStatus === 'saved' ? 'Autosaved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
              {linkedTask && <span>• Linked Task: {linkedTask.title}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('vscode')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Switch to VS Code Mobile IDE (Android & Web)"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>VS Code Beta</span>
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Ctrl + Enter"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProject(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Ctrl + S"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={handleResetCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Reset to starter files"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {linkedTask && (
            <button
              type="button"
              onClick={handleSubmitForTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Auto-Grading</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Requirements Guidance Strip (if linked) */}
      {linkedTask && (
        <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-blue-900 block">Assignment: {linkedTask.title}</span>
            <p className="text-blue-700 text-[11px] leading-relaxed">{linkedTask.instructions}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {linkedTask.requirements.map(req => {
              const matchesHtml = currentProject.files['index.html']?.toLowerCase().includes(req.rule_target.toLowerCase());
              const matchesCss = currentProject.files['style.css']?.toLowerCase().includes(req.rule_target.toLowerCase());
              const isMet = matchesHtml || matchesCss;

              return (
                <div
                  key={req.id}
                  className={`px-2.5 py-1 rounded-xl font-medium text-[11px] flex items-center gap-1.5 border transition ${
                    isMet
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isMet ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{req.description}</span>
                  <span className="font-bold text-[10px] text-slate-400">+{req.points} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grading Evaluation Banner if evaluated */}
      {gradingResult && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 animate-in fade-in duration-200 ${
          gradingResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              gradingResult.passed ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {gradingResult.score}
            </div>
            <div>
              <p className="font-bold">{gradingResult.feedback}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Earned: {gradingResult.score} of {gradingResult.maxScore} possible points
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGradingResult(null)}
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor & Preview Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[580px]">
        {/* Left Pane: File Tree Tabs, Quick Snippets & Code Editor */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-sm">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-1">
              {Object.keys(currentProject.files).map(fileName => {
                const isActive = activeFile === fileName;
                return (
                  <div
                    key={fileName}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-blue-400 font-bold border-b-2 border-blue-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    onClick={() => setActiveFile(fileName)}
                  >
                    <span>{fileName}</span>
                    {!['index.html', 'style.css', 'script.js'].includes(fileName) && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteFile(fileName);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowNewFileModal(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                title="Create new file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editor Tools: Format, Wrap, Font Size */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleFormatCode}
                className="text-[11px] text-slate-400 hover:text-blue-400 px-2 py-1 rounded hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                title="Beautify / Format Code"
              >
                <Wand2 className="w-3 h-3" />
                <span className="hidden sm:inline">Format</span>
              </button>

              <button
                type="button"
                onClick={() => setWordWrap(!wordWrap)}
                className={`p-1 rounded text-xs transition cursor-pointer ${
                  wordWrap ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Word Wrap"
              >
                <WrapText className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-slate-800/80 rounded p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setFontSize('text-xs')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'text-xs' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('text-sm')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'text-sm' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('text-base')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'text-base' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  L
                </button>
              </div>
            </div>
          </div>

          {/* Quick Snippets Insertion Bar */}
          {SNIPPETS[activeFile] && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-[11px]">
              <span className="text-slate-500 text-[10px] font-mono shrink-0 mr-1">Insert:</span>
              {SNIPPETS[activeFile].map(snip => (
                <button
                  key={snip.label}
                  type="button"
                  onClick={() => handleInsertSnippet(snip.code)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] whitespace-nowrap transition cursor-pointer"
                >
                  {snip.label}
                </button>
              ))}
            </div>
          )}

          {/* Code Textarea Area with Synchronized Line Numbers Gutter */}
          <div className="flex-1 flex overflow-hidden relative bg-slate-900">
            {/* Line Numbers Gutter */}
            <div
              ref={lineGutterRef}
              className="w-11 bg-slate-950 text-slate-600 font-mono text-xs select-none pr-2.5 pl-1 py-3 text-right overflow-hidden shrink-0 border-r border-slate-800/80"
            >
              {lineNumbers.map(n => (
                <div key={n} className="leading-relaxed">
                  {n}
                </div>
              ))}
            </div>

            {/* Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={currentProject.files[activeFile] || ''}
              onChange={e => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleTextareaScroll}
              spellCheck={false}
              className={`flex-1 w-full h-full bg-transparent text-slate-100 font-mono ${fontSize} ${
                wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
              } p-3 resize-none focus:outline-none leading-relaxed selection:bg-blue-600 selection:text-white`}
            />
          </div>

          {/* Bottom Bar: Shortcuts hint */}
          <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Tab = 2 spaces • Auto-quotes & brackets enabled</span>
            <span>Ctrl + Enter to Run • Ctrl + S to Save</span>
          </div>
        </div>

        {/* Right Pane: Live Sandboxed Iframe Preview & Console */}
        <div className="rounded-3xl bg-white border border-slate-200/80 flex flex-col overflow-hidden shadow-sm">
          {/* Preview Tabs: Live Preview vs Console */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Sandboxed Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console ({consoleLogs.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'console' && (
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Safe Sandboxed
              </span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-[480px] bg-slate-50 relative flex flex-col">
            {activeTab === 'preview' ? (
              <iframe
                key={previewKey}
                title="Learn2Code Output Sandbox"
                srcDoc={buildPreviewSrcDoc()}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full flex-1 border-0 bg-white"
              />
            ) : (
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-slate-900 text-slate-200 space-y-2">
                {consoleLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-8 text-center">
                    Console output will appear here when JavaScript executes console.log() or encounters errors.
                  </div>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border font-mono text-[11px] flex items-start gap-2 ${
                        log.type === 'error'
                          ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                          : log.type === 'warn'
                          ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-200'
                      }`}
                    >
                      <span className="text-[9px] text-slate-500 shrink-0 mt-0.5">[{log.time}]</span>
                      <span className="font-bold shrink-0">[{log.type.toUpperCase()}]:</span>
                      <span className="break-all whitespace-pre-wrap">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Create New Project File</h3>
            <p className="text-xs text-slate-500 mb-4">
              e.g. <code>utils.js</code> or <code>components.css</code>
            </p>
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFile}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
