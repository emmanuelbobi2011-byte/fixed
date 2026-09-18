import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  FileCode,
  FileText,
  Play,
  Save,
  RotateCcw,
  Terminal,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Split,
  Plus,
  Trash2,
  Settings,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  Code2,
  Layers,
  Sparkles,
  Info,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { ProjectState } from '../../types';

interface VSCodeEditorViewProps {
  onBackToMain?: () => void;
  standalone?: boolean;
}

const DEFAULT_VS_FILES: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VS Code Web App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="app-card">
    <div class="badge">Learn2Code VS Studio</div>
    <h1>Mobile-First Developer Lab</h1>
    <p>File linking is fully supported: style.css is auto-linked into index.html, and script.js runs safely with live DOM & console support.</p>
    
    <div class="counter-box">
      <span id="counter-val">0</span>
      <div class="actions">
        <button id="inc-btn" class="btn primary">+ Increment</button>
        <button id="reset-btn" class="btn secondary">Reset</button>
      </div>
    </div>

    <div id="log-feed" class="log-feed"></div>
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
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
}

.app-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

h1 {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: #ffffff;
}

p {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 20px;
}

.counter-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
}

#counter-val {
  display: block;
  font-size: 2.8rem;
  font-weight: 800;
  color: #60a5fa;
  font-family: monospace;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.82rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: #2563eb;
  color: white;
}
.btn.primary:active {
  transform: scale(0.96);
  background: #1d4ed8;
}

.btn.secondary {
  background: #334155;
  color: #cbd5e1;
}
.btn.secondary:active {
  transform: scale(0.96);
  background: #475569;
}

.log-feed {
  font-family: monospace;
  font-size: 0.75rem;
  color: #38bdf8;
  padding: 10px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  min-height: 40px;
  border-left: 3px solid #38bdf8;
}`,
  'script.js': `// Learn2Code VS Code Mobile Engine
let count = 0;
const valEl = document.getElementById('counter-val');
const incBtn = document.getElementById('inc-btn');
const resetBtn = document.getElementById('reset-btn');
const logFeed = document.getElementById('log-feed');

function log(msg) {
  console.log('[App]: ' + msg);
  if (logFeed) {
    logFeed.textContent = msg;
  }
}

if (incBtn && valEl) {
  incBtn.addEventListener('click', () => {
    count++;
    valEl.textContent = count;
    log('Tapped increment. New count = ' + count);
  });
}

if (resetBtn && valEl) {
  resetBtn.addEventListener('click', () => {
    count = 0;
    valEl.textContent = count;
    log('Counter was reset to 0');
  });
}

log('VS Code script mounted and listening for taps!');
`,
  'about.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About This Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-card">
    <div class="badge">Multi-Page File Link</div>
    <h1>About The Project</h1>
    <p>This is a secondary page linking directly to <code>style.css</code>! You can link between pages like &lt;a href="index.html"&gt;Back to Home&lt;/a&gt;.</p>
    <a href="index.html" class="btn primary" style="display:inline-block; text-decoration:none;">&larr; Back to Main</a>
  </div>
</body>
</html>`,
};

type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'responsive';
type ActivityTab = 'explorer' | 'search' | 'settings';

export const VSCodeEditorView: React.FC<VSCodeEditorViewProps> = ({ onBackToMain, standalone = false }) => {
  const { currentUser, showToast } = useAuth();

  // Storage / Project setup
  const [project, setProject] = useState<ProjectState>(() => {
    const saved = localStorage.getItem('learn2code_vscode_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: `proj_vscode_${Date.now()}`,
      user_id: currentUser?.id || 'guest',
      name: 'Mobile Studio App',
      files: { ...DEFAULT_VS_FILES },
      active_file: 'index.html',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const [activeFile, setActiveFile] = useState<string>(project.active_file || 'index.html');
  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    const keys = Object.keys(project.files);
    return keys.slice(0, 3);
  });

  // UI States
  const [activityTab, setActivityTab] = useState<ActivityTab>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => window.innerWidth > 768);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile');
  const [mobileBottomTab, setMobileBottomTab] = useState<'editor' | 'preview' | 'terminal'>('editor');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; msg: string; time: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [isCopied, setIsCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('learn2code_vscode_project', JSON.stringify(project));
  }, [project]);

  // Handle message from sandbox iframe (console + inter-page navigation)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.source === 'vscode_mobile_sandbox') {
        if (e.data.type === 'navigate_file') {
          const target = e.data.target;
          if (project.files[target]) {
            handleOpenFile(target);
            showToast(`Linked navigation to ${target}`);
          }
        } else {
          setConsoleLogs(prev => [
            ...prev.slice(-40),
            {
              type: e.data.type || 'log',
              msg: typeof e.data.msg === 'object' ? JSON.stringify(e.data.msg) : String(e.data.msg),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
          ]);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [project.files, showToast]);

  const handleOpenFile = (file: string) => {
    setActiveFile(file);
    if (!openTabs.includes(file)) {
      setOpenTabs(prev => [...prev, file]);
    }
    // On mobile, switch to editor view
    if (window.innerWidth < 768) {
      setMobileBottomTab('editor');
    }
  };

  const handleCloseTab = (file: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = openTabs.filter(f => f !== file);
    setOpenTabs(filtered);
    if (activeFile === file && filtered.length > 0) {
      setActiveFile(filtered[filtered.length - 1]);
    }
  };

  const handleCodeChange = (val: string) => {
    setProject(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [activeFile]: val,
      },
      updated_at: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    localStorage.setItem('learn2code_vscode_project', JSON.stringify(project));
    setTimeout(() => {
      setSaveStatus('saved');
      showToast('Project files saved');
    }, 250);
  };

  const handleRun = () => {
    handleSave();
    setPreviewKey(prev => prev + 1);
    if (window.innerWidth < 768) {
      setMobileBottomTab('preview');
    }
    showToast('Live preview refreshed');
  };

  const handleReset = () => {
    if (confirm('Reset all files to default starter project?')) {
      setProject({
        id: `proj_vscode_${Date.now()}`,
        user_id: currentUser?.id || 'guest',
        name: 'Mobile Studio App',
        files: { ...DEFAULT_VS_FILES },
        active_file: 'index.html',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setActiveFile('index.html');
      setOpenTabs(['index.html', 'style.css', 'script.js']);
      setPreviewKey(k => k + 1);
      showToast('Reset to default VS Code starter project');
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim().toLowerCase();
    setProject(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [name]: name.endsWith('.html')
          ? '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h2>New Page</h2>\n</body>\n</html>'
          : name.endsWith('.css')
          ? '/* Custom stylesheet */\n'
          : '// JavaScript file\n',
      },
    }));
    handleOpenFile(name);
    setNewFileName('');
    setShowNewFileModal(false);
    showToast(`Created ${name}`);
  };

  const handleDeleteFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (['index.html', 'style.css', 'script.js'].includes(name)) {
      showToast('Core files cannot be deleted');
      return;
    }
    if (confirm(`Delete file "${name}"?`)) {
      const nextFiles = { ...project.files };
      delete nextFiles[name];
      setProject(prev => ({ ...prev, files: nextFiles }));
      setOpenTabs(prev => prev.filter(f => f !== name));
      if (activeFile === name) {
        setActiveFile('index.html');
      }
      showToast(`Deleted ${name}`);
    }
  };

  // Keyboard enhancements
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const val = target.value;

    // Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
      return;
    }

    // Tab = 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Auto brackets/quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
      '<': '>',
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

  // Quick Mobile Snippets for fast on-screen keyboard typing on Android/iOS
  const mobileSnippets = [
    { label: '<tag>', code: '<div class="">\n  \n</div>' },
    { label: 'class=""', code: 'class=""' },
    { label: 'id=""', code: 'id=""' },
    { label: '{ }', code: '{\n  \n}' },
    { label: '=>', code: '() => {\n  \n}' },
    { label: 'console.log', code: 'console.log();' },
    { label: ';', code: ';' },
    { label: '=', code: ' = ' },
    { label: '()', code: '()' },
    { label: '""', code: '""' },
  ];

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const val = target.value;
    const newVal = val.substring(0, start) + snippet + val.substring(end);
    handleCodeChange(newVal);
    setTimeout(() => {
      target.focus();
      target.selectionStart = target.selectionEnd = start + snippet.length;
    }, 0);
  };

  /**
   * FILE LINKING SYSTEM:
   * Build complete Sandboxed HTML by resolving all relative links:
   * - <link rel="stylesheet" href="style.css"> -> replaced by actual content of style.css or inlined
   * - <script src="script.js"></script> -> inlined with execution safety
   * - Intercepts <a href="page.html"> so user can click internal page links
   * - Supports relative images and dynamic DOM
   */
  const buildLinkedHtmlBundle = () => {
    // Determine which file to display in iframe (default index.html or active html file)
    const targetHtmlFile = activeFile.endsWith('.html') ? activeFile : 'index.html';
    let rawHtml = project.files[targetHtmlFile] || project.files['index.html'] || '<h1>No HTML File</h1>';

    // 1. Resolve CSS links: replace <link rel="stylesheet" href="filename.css"> with <style>
    rawHtml = rawHtml.replace(/<link\s+[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (match, cssPath) => {
      const cleanCssPath = cssPath.replace(/^\.\//, '');
      const cssContent = project.files[cleanCssPath] || '';
      return `<style>/* Inlined from ${cleanCssPath} */\n${cssContent}\n</style>`;
    });

    // 2. Resolve external script tags that match workspace files: <script src="filename.js"></script>
    rawHtml = rawHtml.replace(/<script\s+[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi, (match, jsPath) => {
      const cleanJsPath = jsPath.replace(/^\.\//, '');
      const jsContent = project.files[cleanJsPath] || '';
      return `<script>/* Inlined from ${cleanJsPath} */\n${jsContent}\n</script>`;
    });

    // 3. Inject Console Interceptor & Link click handler for multi-page linking
    const injectionScript = `
    <script>
      (function() {
        const origLog = console.log;
        const origErr = console.error;
        const origWarn = console.warn;

        function post(type, args) {
          try {
            const str = Array.from(args).map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
            window.parent.postMessage({ source: 'vscode_mobile_sandbox', type: type, msg: str }, '*');
          } catch(e) {}
        }

        console.log = function() { origLog.apply(console, arguments); post('log', arguments); };
        console.error = function() { origErr.apply(console, arguments); post('error', arguments); };
        console.warn = function() { origWarn.apply(console, arguments); post('warn', arguments); };

        window.onerror = function(msg, url, line) {
          post('error', ['Runtime Error: ' + msg + ' (line ' + line + ')']);
        };

        // File linking: intercept internal page navigation links <a href="*.html">
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && target.getAttribute('href')) {
            const href = target.getAttribute('href');
            if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#')) {
              e.preventDefault();
              window.parent.postMessage({ source: 'vscode_mobile_sandbox', type: 'navigate_file', target: href }, '*');
            }
          }
        }, true);
      })();
    </script>
    `;

    // Insert injector into head or before body
    if (rawHtml.includes('<head>')) {
      return rawHtml.replace('<head>', '<head>' + injectionScript);
    } else {
      return injectionScript + rawHtml;
    }
  };

  const getFileIcon = (file: string) => {
    if (file.endsWith('.html')) return <span className="text-orange-500 font-bold text-xs">H</span>;
    if (file.endsWith('.css')) return <span className="text-sky-400 font-bold text-xs">#</span>;
    if (file.endsWith('.js')) return <span className="text-amber-400 font-bold text-xs">JS</span>;
    return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  };

  const currentCode = project.files[activeFile] || '';
  const linesCount = (currentCode.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  // Filtered files for search
  const fileEntries = Object.entries(project.files).filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="vscode-mobile-ide"
      className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-5rem)] bg-[#1e1e1e] text-[#cccccc] rounded-2xl md:rounded-3xl border border-[#333333] shadow-2xl overflow-hidden font-sans select-none"
    >
      {/* 1. TOP VS CODE TITLEBAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#323233] border-b border-[#252526] text-xs shrink-0">
        <div className="flex items-center gap-2">
          {onBackToMain && (
            <button
              type="button"
              onClick={onBackToMain}
              className="p-1 rounded hover:bg-[#3c3c3d] text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 font-semibold"
              title="Return to Learn2Code Portal"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {/* VS Code Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#007acc] rounded-sm flex items-center justify-center text-white font-mono text-[9px] font-bold">
              VS
            </div>
            <span className="font-semibold text-slate-200 hidden sm:inline">Visual Studio Code (Web Beta)</span>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
              Android &amp; Web
            </span>
          </div>
        </div>

        {/* Center Current Workspace */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>{project.name}</span>
          <span>&gt;</span>
          <span className="text-white font-bold">{activeFile}</span>
          <span
            className={`w-2 h-2 rounded-full ml-1 ${
              saveStatus === 'saved'
                ? 'bg-emerald-500'
                : saveStatus === 'saving'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-rose-400'
            }`}
          />
        </div>

        {/* Right Actions: Viewport switch & Run Button */}
        <div className="flex items-center gap-1.5">
          {/* Viewport size buttons for Android / Tablet / Desktop testing */}
          <div className="hidden sm:flex items-center bg-[#252526] rounded p-0.5 border border-[#3c3c3d]">
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Android / Mobile Viewport (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('responsive')}
              className={`p-1 rounded cursor-pointer ${
                viewportMode === 'responsive' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Full Responsive Width"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Ctrl + Enter / Run Live"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Run</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-[#3c3c3d] hover:bg-[#4c4c4d] text-slate-200 text-xs font-medium cursor-pointer"
            title="Ctrl + S"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>

          {/* Open In New Tab */}
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?standalone=vscode`;
              window.open(url, '_blank');
            }}
            className="p-1 rounded hover:bg-[#3c3c3d] text-slate-400 hover:text-white cursor-pointer"
            title="Open In Separate Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN VS CODE WORKSPACE: ACTIVITY BAR + SIDEBAR + EDITOR/PREVIEW */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar (VS Code Left Strip) */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 shrink-0 border-r border-[#252526] z-10">
          <button
            type="button"
            onClick={() => {
              if (activityTab === 'explorer') setSidebarOpen(!sidebarOpen);
              else {
                setActivityTab('explorer');
                setSidebarOpen(true);
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition mb-1 cursor-pointer ${
              sidebarOpen && activityTab === 'explorer'
                ? 'text-white border-l-2 border-[#007acc] bg-[#252526]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Explorer (Files)"
          >
            <FolderTree className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (activityTab === 'search') setSidebarOpen(!sidebarOpen);
              else {
                setActivityTab('search');
                setSidebarOpen(true);
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition mb-1 cursor-pointer ${
              sidebarOpen && activityTab === 'search'
                ? 'text-white border-l-2 border-[#007acc] bg-[#252526]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Search Files"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition mb-1 cursor-pointer"
            title="Reset Starter Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="mt-auto flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActivityTab('settings');
                setSidebarOpen(true);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Settings & Shortcuts"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Sidebar (Explorer / Files) */}
        {sidebarOpen && (
          <div className="w-60 md:w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0 z-10 text-xs">
            {activityTab === 'explorer' && (
              <>
                <div className="px-3 py-2 flex items-center justify-between text-[#bbbbbb] font-bold uppercase tracking-wider text-[11px] border-b border-[#333333]">
                  <span>Explorer</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewFileModal(true)}
                      className="p-1 hover:bg-[#333333] rounded text-slate-300 hover:text-white cursor-pointer"
                      title="New File"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="md:hidden p-1 hover:bg-[#333333] rounded text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* File Tree Header */}
                <div className="px-3 py-1.5 flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-[#2d2d2d]">
                  <ChevronDown className="w-3 h-3" />
                  <span className="truncate">{project.name.toUpperCase()}</span>
                  <span className="ml-auto text-[10px] text-slate-400 font-mono">
                    {Object.keys(project.files).length} files
                  </span>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
                  {Object.keys(project.files).map(fileName => {
                    const isSelected = activeFile === fileName;
                    return (
                      <div
                        key={fileName}
                        onClick={() => handleOpenFile(fileName)}
                        className={`group px-3 py-1.5 flex items-center justify-between font-mono cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#37373d] text-white font-bold border-l-2 border-[#007acc]'
                            : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(fileName)}
                          <span className="truncate">{fileName}</span>
                        </div>

                        {!['index.html', 'style.css', 'script.js'].includes(fileName) && (
                          <button
                            type="button"
                            onClick={e => handleDeleteFile(fileName, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Project File Linking Info badge */}
                <div className="p-3 bg-[#1e1e1e] border-t border-[#333333] text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-200 block mb-1">🔗 File Linking Active</span>
                  <p className="text-[10px] text-slate-400">
                    <code>style.css</code> and <code>script.js</code> link automatically into <code>index.html</code>. Click links or add <code>&lt;a href="about.html"&gt;</code> to test page linking.
                  </p>
                </div>
              </>
            )}

            {activityTab === 'search' && (
              <div className="p-3 space-y-3">
                <span className="text-[11px] uppercase font-bold text-slate-300">Search Workspace</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter files..."
                  className="w-full bg-[#3c3c3d] border border-[#555555] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#007acc]"
                />
                <div className="space-y-1">
                  {fileEntries.map(([name]) => (
                    <div
                      key={name}
                      onClick={() => handleOpenFile(name)}
                      className="px-2 py-1 rounded hover:bg-[#37373d] cursor-pointer flex items-center gap-2 font-mono"
                    >
                      {getFileIcon(name)}
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activityTab === 'settings' && (
              <div className="p-3 space-y-3 text-xs">
                <span className="text-[11px] uppercase font-bold text-slate-300">Shortcuts &amp; Setup</span>
                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex justify-between border-b border-[#333] pb-1">
                    <span>Run Preview</span>
                    <kbd className="bg-[#3c3c3d] px-1.5 py-0.5 rounded text-white font-mono">Ctrl+Enter</kbd>
                  </div>
                  <div className="flex justify-between border-b border-[#333] pb-1">
                    <span>Save Project</span>
                    <kbd className="bg-[#3c3c3d] px-1.5 py-0.5 rounded text-white font-mono">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between border-b border-[#333] pb-1">
                    <span>Indentation</span>
                    <kbd className="bg-[#3c3c3d] px-1.5 py-0.5 rounded text-white font-mono">Tab (2 sp)</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CENTER SPLIT: TABS + CODE EDITOR + LIVE RUNTIME PREVIEW */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#1e1e1e]">
          {/* EDITOR COLUMN */}
          <div
            className={`flex-1 flex flex-col min-w-0 bg-[#1e1e1e] border-r border-[#252526] ${
              mobileBottomTab !== 'editor' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Editor Tab Bar */}
            <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto shrink-0">
              {openTabs.map(fileName => {
                const isActive = activeFile === fileName;
                return (
                  <div
                    key={fileName}
                    onClick={() => setActiveFile(fileName)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-r border-[#1e1e1e] cursor-pointer transition ${
                      isActive
                        ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc] font-bold'
                        : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#252526] hover:text-[#cccccc]'
                    }`}
                  >
                    {getFileIcon(fileName)}
                    <span>{fileName}</span>
                    <button
                      type="button"
                      onClick={e => handleCloseTab(fileName, e)}
                      className="p-0.5 rounded hover:bg-[#3c3c3d] text-slate-500 hover:text-white ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Android / Mobile Coding Snippet Bar (Touch keyboard acceleration) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252526] border-b border-[#333333] overflow-x-auto text-xs shrink-0">
              <span className="text-[10px] text-slate-400 font-mono shrink-0 mr-1">Android Quick Keys:</span>
              {mobileSnippets.map((snip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertSnippet(snip.code)}
                  className="px-2 py-0.5 rounded bg-[#333333] hover:bg-[#3c3c3d] text-slate-200 font-mono text-[11px] whitespace-nowrap active:bg-[#007acc] transition cursor-pointer"
                >
                  {snip.label}
                </button>
              ))}
            </div>

            {/* Code Textarea & Gutter */}
            <div className="flex-1 flex overflow-hidden relative bg-[#1e1e1e]">
              {/* Line Numbers Gutter */}
              <div
                ref={lineGutterRef}
                className="w-10 bg-[#1e1e1e] text-[#858585] font-mono text-xs select-none pr-2 py-3 text-right overflow-hidden shrink-0 border-r border-[#2d2d2d]"
              >
                {lineNumbers.map(n => (
                  <div key={n} className="leading-relaxed">
                    {n}
                  </div>
                ))}
              </div>

              {/* Real Code Input */}
              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={e => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                className="flex-1 w-full h-full bg-transparent text-[#d4d4d4] font-mono text-xs sm:text-sm p-3 resize-none focus:outline-none leading-relaxed selection:bg-[#264f78] selection:text-white"
              />
            </div>
          </div>

          {/* PREVIEW & CONSOLE COLUMN */}
          <div
            className={`flex-1 flex flex-col bg-[#1e1e1e] min-w-0 ${
              mobileBottomTab === 'editor' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Top Preview Controls */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#1e1e1e] text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileBottomTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer ${
                    mobileBottomTab === 'preview' || window.innerWidth >= 768
                      ? 'text-white bg-[#1e1e1e] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Output Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileBottomTab('terminal')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer ${
                    mobileBottomTab === 'terminal' ? 'text-white bg-[#1e1e1e] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Terminal ({consoleLogs.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Linked Live DOM
                </span>
              </div>
            </div>

            {/* Sandbox Container (Supports Android Viewport Simulation) */}
            <div className="flex-1 bg-[#121212] overflow-auto flex items-center justify-center p-2 sm:p-4">
              {mobileBottomTab === 'terminal' ? (
                <div className="w-full h-full bg-[#181818] rounded-xl border border-[#333333] p-3 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-200">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-[#333] pb-1">
                    <span>Learn2Code JavaScript Runtime Console</span>
                    <button
                      type="button"
                      onClick={() => setConsoleLogs([])}
                      className="hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {consoleLogs.length === 0 ? (
                    <div className="text-slate-600 italic py-6 text-center">
                      No console logs yet. Call console.log() in your script.js or interact with your live preview.
                    </div>
                  ) : (
                    consoleLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded font-mono text-[11px] flex items-start gap-2 ${
                          log.type === 'error'
                            ? 'bg-rose-950/40 text-rose-300'
                            : log.type === 'warn'
                            ? 'bg-amber-950/40 text-amber-300'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="text-[9px] text-slate-500 shrink-0">[{log.time}]</span>
                        <span className="font-bold shrink-0">[{log.type}]:</span>
                        <span className="break-all">{log.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div
                  className={`h-full transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-700 ${
                    viewportMode === 'mobile'
                      ? 'w-[375px] max-w-full'
                      : viewportMode === 'tablet'
                      ? 'w-[720px] max-w-full'
                      : 'w-full'
                  }`}
                >
                  <iframe
                    key={previewKey}
                    title="VS Code Sandbox Preview"
                    srcDoc={buildLinkedHtmlBundle()}
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-full border-0 bg-white flex-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOBILE BOTTOM TAB SWITCHER (For phone/Android users to toggle between Editor & Preview) */}
      <div className="md:hidden flex items-center justify-around bg-[#252526] border-t border-[#333333] py-2 px-4 shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setMobileBottomTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            mobileBottomTab === 'editor' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Editor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleRun();
            setMobileBottomTab('preview');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            mobileBottomTab === 'preview' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileBottomTab('terminal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            mobileBottomTab === 'terminal' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Console</span>
        </button>
      </div>

      {/* 5. BOTTOM VS CODE STATUS BAR */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[11px] font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>UTF-8</span>
          </span>
          <span>HTML/CSS/JS</span>
          <span className="hidden sm:inline">Lines: {linesCount}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>{activeFile}</span>
          <span className="hidden sm:inline">Spaces: 2</span>
          <span>Learn2Code Engine</span>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#252526] text-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#3c3c3d]">
            <h3 className="font-bold text-sm mb-1">New File in Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter filename (e.g. <code>about.html</code>, <code>modal.css</code>, <code>calculator.js</code>)
            </p>
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="e.g. app.js"
              className="w-full bg-[#3c3c3d] border border-[#555555] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007acc] mb-4 font-mono"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFile}
                className="px-4 py-1.5 text-xs font-bold bg-[#007acc] hover:bg-[#1177bb] text-white rounded-xl shadow-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
