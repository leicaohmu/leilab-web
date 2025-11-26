import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

// ==========================================
// 0. Firebase Configuration & Init
// ==========================================
const firebaseConfig = JSON.parse(__firebase_config || '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper to get collection paths
const getPath = (colName) => ['artifacts', appId, 'public', 'data', colName];

// ==========================================
// 1. 图标组件 (Zero Dependency SVGs)
// ==========================================
const IconBase = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const BookOpen = (props) => <IconBase {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>;
const Users = (props) => <IconBase {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconBase>;
const FileText = (props) => <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></IconBase>;
const Search = (props) => <IconBase {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IconBase>;
const ChevronRight = (props) => <IconBase {...props}><polyline points="9 18 15 12 9 6"/></IconBase>;
const ChevronLeft = (props) => <IconBase {...props}><polyline points="15 18 9 12 15 6"/></IconBase>;
const Lock = (props) => <IconBase {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>;
const LogOut = (props) => <IconBase {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></IconBase>;
const Plus = (props) => <IconBase {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconBase>;
const Trash = (props) => <IconBase {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></IconBase>;
const Edit = (props) => <IconBase {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconBase>;
const Settings = (props) => <IconBase {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></IconBase>;
const Upload = (props) => <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>;
const Code = (props) => <IconBase {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></IconBase>;
const MessageSquare = (props) => <IconBase {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconBase>;
const Clock = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>;
const AlertCircle = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>;
const Check = (props) => <IconBase {...props}><polyline points="20 6 9 17 4 12"/></IconBase>;
const Play = (props) => <IconBase {...props}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>;
const Copy = (props) => <IconBase {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconBase>;
const Eye = (props) => <IconBase {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></IconBase>;
const Save = (props) => <IconBase {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconBase>;
const RefreshCw = (props) => <IconBase {...props}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></IconBase>;
const User = (props) => <IconBase {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconBase>;
const Shield = (props) => <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>;
const ThumbsUp = (props) => <IconBase {...props}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></IconBase>;
const Key = (props) => <IconBase {...props}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></IconBase>;
const X = (props) => <IconBase {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconBase>;
const Info = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></IconBase>;
const Bell = (props) => <IconBase {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></IconBase>;
const Mail = (props) => <IconBase {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></IconBase>;
const ImageIcon = (props) => <IconBase {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></IconBase>;
const Camera = (props) => <IconBase {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></IconBase>;
const Video = (props) => <IconBase {...props}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></IconBase>;
const Monitor = (props) => <IconBase {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></IconBase>;
const Loader2 = (props) => <IconBase {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></IconBase>;
const Cloud = (props) => <IconBase {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></IconBase>;

// ==========================================
// 2. Mock Data & Config
// ==========================================
const DEFAULT_CODE = "LAB2025"; 
const apiKey = ""; 
const AVATAR_POOL = ["🦊", "🐱", "🐼", "🐨", "🐸", "🐙", "🦄", "🤖", "🦖", "🐳", "🦋", "🐞", "🐵", "🐶", "🐰", "🐯", "🦁", "🐮", "🐷", "🐹"];

const INITIAL_USERS = []; 
const INITIAL_TUTORIALS = [];
const INITIAL_COURSES = [
  {
    id: 'c1',
    title: '医学图像分析深度学习入门',
    description: '本课程专为医学背景的研究人员和计算机科学初学者设计。我们将从深度学习的基础概念讲起，逐步深入到卷积神经网络（CNN）在医学图像分割、分类和检测中的应用。课程包含丰富的实战案例，如细胞核分割、肿瘤区域识别等。',
    instructorName: 'Prof. Li',
    instructorId: 'u1', 
    level: '入门',
    duration: '4 周',
    students: 120,
    coverImage: null, 
    modules: [
      {
        id: 'm1',
        title: '第一周：深度学习与医学影像基础',
        resources: [
          { id: 'r1', type: 'video', title: '1.1 课程介绍与导学', duration: '10:00' },
          { id: 'r2', type: 'ppt', title: '1.1 课件幻灯片', size: '5MB' },
          { id: 'r3', type: 'pdf', title: '阅读材料：WSI 图像格式详解', size: '2.3MB' }
        ]
      },
      {
        id: 'm2',
        title: '第二周：卷积神经网络 (CNN) 原理',
        resources: [
            { id: 'r4', type: 'video', title: '2.1 CNN 核心组件解析', duration: '25:00' },
            { id: 'r5', type: 'quiz', title: '单元测试：CNN 基础', duration: '10 题' }
        ]
      }
    ]
  }
];
const INITIAL_NEWS = [
  { id: 'n1', title: '祝贺课题组论文被CVPR录用', date: '2023-10-24', content: '我们关于弱监督学习的工作被录用...' },
  { id: 'n2', title: '2024年春季招新启动', date: '2023-11-01', content: '欢迎对AI4Science感兴趣的同学加入...' },
];

// ==========================================
// 3. Utils & Hooks
// ==========================================
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

const useMathJax = () => {
  useEffect(() => {
    if (!window.MathJax) {
      window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }, svg: { fontCache: 'global' } };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  const typeset = () => { if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise(); };
  return { typeset };
};

// ==========================================
// 4. Basic UI Components
// ==========================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  const bgColors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColors[type] || bgColors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4`}>
      {type === 'success' ? <Check className="w-5 h-5" /> : type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) => {
  const baseStyle = "rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    ghost: "text-gray-600 hover:bg-gray-100",
    ai: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm border border-purple-500",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const Badge = ({ role }) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    member: 'bg-green-100 text-green-700 border-green-200',
    alumni: 'bg-orange-100 text-orange-700 border-orange-200',
    guest: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels = { admin: '管理员', member: '成员', alumni: '毕业生/校友', guest: '游客' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[role] || colors.guest}`}>
      {labels[role] || role}
    </span>
  );
};

const UserAvatar = ({ user, size = "md", className = "", onClick }) => {
    const sizes = { 
      xs: "w-6 h-6 text-[10px]", 
      sm: "w-8 h-8 text-sm", 
      md: "w-10 h-10 text-base", 
      lg: "w-16 h-16 text-3xl", 
      xl: "w-24 h-24 text-4xl",
      full: "w-full h-full text-4xl"
    };
    const sizeClass = sizes[size] || sizes.md;
    
    const isCustomImage = user.avatar && user.avatar.startsWith('data:image');
    const isEmoji = user.avatar && !isCustomImage && user.avatar.length < 5;
    
    if (isEmoji) {
         return (
            <div onClick={onClick} className={`${sizeClass} rounded-full bg-gray-100 flex items-center justify-center shadow-sm shrink-0 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}>
                {user.avatar}
            </div>
        );
    }

    const avatarSeed = user.avatar && !isCustomImage ? user.avatar : user.name;
    const avatarUrl = isCustomImage ? user.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`;

    return (
        <div onClick={onClick} className={`${sizeClass} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}>
            <img 
                src={avatarUrl} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${user.name}&background=random`}}
            />
        </div>
    );
};

// ==========================================
// 5. Feature Components
// ==========================================
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleRunInColab = () => {
    navigator.clipboard.writeText(code);
    alert("代码已复制到剪贴板！\n正在为您打开 Google Colab 新建页面...\n\n请在打开的页面中粘贴 (Ctrl+V) 代码并运行。");
    window.open('https://colab.research.google.com/#create=true', '_blank');
  };
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-mono font-bold text-gray-600 uppercase">{language || 'code'}</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors" title="复制代码">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '复制'}
          </button>
          <button onClick={handleRunInColab} className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-2 py-0.5 rounded hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-colors" title="在 Colab 中运行">
            <Play className="w-3 h-3 fill-current" /> Run in Colab
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto bg-[#282c34] text-gray-100 font-mono text-sm leading-relaxed"><pre>{code}</pre></div>
    </div>
  );
};

const convertTableToHtml = (markdownTable) => {
  try {
    const rows = markdownTable.trim().split('\n').map(row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
    if (rows.length < 2) return markdownTable;
    const header = rows[0];
    const body = rows.slice(2);
    const formatCell = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded font-mono text-xs">$1</code>');
    const renderRow = (cells, isHeader = false) => {
      const Tag = isHeader ? 'th' : 'td';
      const className = isHeader ? "px-4 py-2 bg-gray-50 border border-gray-200 font-bold text-left text-gray-700" : "px-4 py-2 border border-gray-200 text-gray-600";
      return `<tr>${cells.map(cell => `<${Tag} class="${className}">${formatCell(cell)}</${Tag}>`).join('')}</tr>`;
    };
    return `<div class="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm"><table class="min-w-full border-collapse text-sm"><thead>${renderRow(header, true)}</thead><tbody class="bg-white divide-y divide-gray-200">${body.map(row => renderRow(row)).join('')}</tbody></table></div>`;
  } catch (e) { return markdownTable; }
};

const MarkdownRenderer = ({ content }) => {
  const { typeset } = useMathJax();
  useEffect(() => { typeset(); }, [content]);
  const parseContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) return <CodeBlock key={index} language={match[1]} code={match[2]} />;
        return null;
      }
      let processedPart = part.replace(/(\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|\n?)*)/g, (match) => {
        const tableHtml = convertTableToHtml(match);
        return `__TABLE_HTML_${encodeURIComponent(tableHtml)}_END__`;
      });
      let renderedPart = processedPart
        .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold mt-4 mb-2 text-gray-800">$1</h4>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-8 mb-6 text-gray-900">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded font-mono text-sm">$1</code>')
        .replace(/\n/g, '<br/>');
        
      renderedPart = renderedPart.replace(/__TABLE_HTML_(.*?)_END__/g, (match, p1) => decodeURIComponent(p1));

      return <div key={index} className="prose prose-slate max-w-none text-gray-700 leading-7" dangerouslySetInnerHTML={{ __html: renderedPart }} />;
    });
  };
  return <div className="markdown-body">{parseContent(content)}</div>;
};

const IpynbRenderer = ({ content }) => {
  const { typeset } = useMathJax();
  let cells = [];
  let error = null;
  if (!content) return <div className="text-gray-400 p-8 text-center border-2 border-dashed rounded-lg">无内容预览</div>;
  try { const data = typeof content === 'string' ? JSON.parse(content) : content; cells = data.cells || []; } catch (e) { error = "文件格式错误：无法解析 JSON 内容"; }
  useEffect(() => { typeset(); }, [content]);
  const renderOutput = (output, idx) => {
    if (output.output_type === 'stream') {
      const text = Array.isArray(output.text) ? output.text.join('') : output.text;
      return <pre key={idx} className="font-mono text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 my-1 border-l-2 border-gray-200">{text}</pre>;
    }
    if (output.data) {
      const imgPng = output.data['image/png'];
      if (imgPng) {
        const src = Array.isArray(imgPng) ? imgPng.join('') : imgPng;
        return <div key={idx} className="my-2"><img src={`data:image/png;base64,${src}`} alt="Output" className="max-w-full h-auto shadow-sm border border-gray-100 rounded bg-white" /></div>;
      }
      const textPlain = output.data['text/plain'];
      if (textPlain) {
        const text = Array.isArray(textPlain) ? textPlain.join('') : textPlain;
        return <pre key={idx} className="font-mono text-xs text-gray-600 whitespace-pre-wrap my-1">{text}</pre>;
      }
    }
    return null;
  };
  if (error) return <div className="text-red-500 p-4 border border-red-200 bg-red-50 rounded">{error}</div>;
  if (cells.length === 0) return <div className="text-gray-500 p-4">Notebook 为空</div>;
  return (
    <div className="space-y-6">
      {cells.map((cell, idx) => (
        <div key={idx} className="group">
          {cell.cell_type === 'markdown' ? (
            <div className="prose prose-sm max-w-none px-4 py-2 bg-transparent text-gray-800 font-sans"><MarkdownRenderer content={Array.isArray(cell.source) ? cell.source.join('') : cell.source} /></div>
          ) : (
            <div className="flex flex-col space-y-1">
              <CodeBlock language="python" code={Array.isArray(cell.source) ? cell.source.join('') : cell.source} />
              {cell.outputs && cell.outputs.length > 0 && (
                <div className="pl-2 mt-1"><div className="ml-1 pl-4 border-l border-gray-200">{cell.outputs.map((out, i) => renderOutput(out, i))}</div></div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 6. Functional Sections
// ==========================================

const CommentSection = ({ tutorial, onUpdate, user, isAdmin, onNotify }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); 
  const [replyContent, setReplyContent] = useState('');
  const comments = tutorial.comments || [];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = { id: Date.now().toString(), userId: user.id, userName: user.name, userAvatar: user.avatar, content: newComment, date: new Date().toLocaleDateString(), replies: [] };
    onUpdate({ ...tutorial, comments: [...comments, comment] });
    setNewComment('');
    if (tutorial.authorId && tutorial.authorId !== user.id) {
        onNotify(tutorial.authorId, `${user.name} 评论了你的文章 "${tutorial.title}"`);
    }
  };

  const handleAddReply = (commentId) => {
    if (!replyContent.trim()) return;
    const reply = { id: Date.now().toString(), userId: user.id, userName: user.name, userAvatar: user.avatar, content: replyContent, date: new Date().toLocaleDateString() };
    const parentComment = comments.find(c => c.id === commentId);
    const updatedComments = comments.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c);
    onUpdate({ ...tutorial, comments: updatedComments });
    setReplyTo(null);
    setReplyContent('');
    if (parentComment && parentComment.userId !== user.id) {
        onNotify(parentComment.userId, `${user.name} 回复了你的评论`);
    }
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    let updatedComments;
    if (isReply && parentId) {
        updatedComments = comments.map(c => c.id === parentId ? { ...c, replies: c.replies.filter(r => r.id !== commentId) } : c);
    } else {
        updatedComments = comments.filter(c => c.id !== commentId);
    }
    onUpdate({ ...tutorial, comments: updatedComments });
  };

  const canDelete = (commentUserId) => isAdmin || user.id === commentUserId;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> 讨论区 ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>
      <div className="flex gap-3 mb-8">
        <UserAvatar user={user} size="sm" />
        <div className="flex-1">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="写下你的想法..." className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y" />
            <div className="flex justify-end mt-2"><Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>发布评论</Button></div>
        </div>
      </div>
      <div className="space-y-6">
        {comments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">暂无评论，快来抢沙发吧！</p>}
        {comments.map(comment => (
          <div key={comment.id} className="group">
            <div className="flex gap-3">
                <UserAvatar user={{name: comment.userName, avatar: comment.userAvatar}} size="sm" className="bg-gray-100 text-gray-600" />
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1"><span className="font-bold text-sm text-gray-900">{comment.userName}</span><span className="text-xs text-gray-400">{comment.date}</span></div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                        <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-gray-500 hover:text-blue-600 font-medium">回复</button>
                        {canDelete(comment.userId) && <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-400 hover:text-red-600">删除</button>}
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                            {comment.replies.map(reply => (
                                <div key={reply.id} className="flex gap-2">
                                    <UserAvatar user={{name: reply.userName, avatar: reply.userAvatar}} size="xs" className="bg-gray-100 text-gray-500" />
                                    <div className="flex-1">
                                        <div className="bg-white border border-gray-100 rounded-lg p-2">
                                            <div className="flex justify-between items-start mb-1"><span className="font-bold text-xs text-gray-800">{reply.userName}</span><span className="text-[10px] text-gray-400">{reply.date}</span></div>
                                            <p className="text-xs text-gray-600">{reply.content}</p>
                                        </div>
                                        {canDelete(reply.userId) && <button onClick={() => handleDeleteComment(reply.id, true, comment.id)} className="text-[10px] text-gray-400 hover:text-red-600 mt-1 ml-1">删除</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {replyTo === comment.id && (
                        <div className="flex gap-2 mt-3 pl-4 border-l-2 border-blue-100 animate-in slide-in-from-top-1">
                             <input autoFocus value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder={`回复 ${comment.userName}...`} className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" onKeyDown={e => e.key === 'Enter' && handleAddReply(comment.id)} />
                             <Button size="sm" onClick={() => handleAddReply(comment.id)}>回复</Button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Course View ---
const CourseView = ({ courses, user, isAdminOrMember, onSaveCourse, onDeleteCourse, showNotification }) => {
    const [viewMode, setViewMode] = useState('list'); 
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [newModuleTitle, setNewModuleTitle] = useState('');
    
    // Auto-update local selected course when courses prop changes (sync)
    useEffect(() => {
        if (selectedCourse) {
            const updated = courses.find(c => c.id === selectedCourse.id);
            if (updated) setSelectedCourse(updated);
        }
    }, [courses]);

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setViewMode('detail');
        setIsEditing(false);
    };

    const handleBack = () => {
        setSelectedCourse(null);
        setViewMode('list');
    };

    const handleCreateCourse = () => {
        const newCourse = {
            id: Date.now().toString(),
            title: '新课程',
            description: '课程描述...',
            instructorName: user.name,
            instructorId: user.id,
            level: '初级',
            duration: '待定',
            students: 0,
            modules: []
        };
        onSaveCourse(newCourse);
        showNotification('新课程已创建，请编辑内容', 'success');
        handleSelectCourse(newCourse);
        setIsEditing(true);
        setEditTitle(newCourse.title);
        setEditDesc(newCourse.description);
    };

    const handleSaveCourseInfo = () => {
        if (!selectedCourse) return;
        const updatedCourse = { ...selectedCourse, title: editTitle, description: editDesc };
        onSaveCourse(updatedCourse);
        setIsEditing(false);
        showNotification('课程信息已保存', 'success');
    };

    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return;
        const newModule = {
            id: Date.now().toString(),
            title: newModuleTitle,
            resources: []
        };
        const updatedCourse = {
            ...selectedCourse,
            modules: [...selectedCourse.modules, newModule]
        };
        onSaveCourse(updatedCourse);
        setNewModuleTitle('');
        showNotification('章节已添加', 'success');
    };

    const handleAddResource = (moduleId, type) => {
        const title = prompt('请输入资源名称:');
        if (!title) return;
        
        const newResource = {
            id: Date.now().toString(),
            type,
            title,
            duration: type === 'video' ? '10:00' : null,
            size: type !== 'video' ? '2MB' : null
        };
        
        const updatedCourse = {
            ...selectedCourse,
            modules: selectedCourse.modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, resources: [...m.resources, newResource] };
                }
                return m;
            })
        };
        
        onSaveCourse(updatedCourse);
    };

    const handleDeleteResource = (moduleId, resourceId) => {
        if (!window.confirm('确定要删除吗？')) return;
        if (resourceId === 'module_itself') {
            const updatedCourse = {
                ...selectedCourse,
                modules: selectedCourse.modules.filter(m => m.id !== moduleId)
            };
            onSaveCourse(updatedCourse);
            return;
        }

        const updatedCourse = {
            ...selectedCourse,
            modules: selectedCourse.modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, resources: m.resources.filter(r => r.id !== resourceId) };
                }
                return m;
            })
        };
        onSaveCourse(updatedCourse);
    }

    if (viewMode === 'list') {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">教学课程</h2>
                        <p className="text-gray-500 mt-2">系统化的学习路径，助你掌握核心技能</p>
                    </div>
                    {isAdminOrMember && (
                        <Button onClick={handleCreateCourse}><Plus className="w-4 h-4" /> 创建课程</Button>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer" onClick={() => handleSelectCourse(course)}>
                            <div className="h-40 w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                                <BookOpen className="w-12 h-12 opacity-80" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.level || '入门'}</span>
                                    <span className="text-xs text-gray-400">{course.duration}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                                
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">{course.instructorName?.[0]}</div>
                                        <span>{course.instructorName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {course.students} 人学习
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {courses.length === 0 && <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">暂无课程，管理员可点击右上角创建。</div>}
            </div>
        );
    }

    // Detail View
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Sidebar - Course Outline */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm mb-4"><ChevronLeft className="w-4 h-4" /> 返回课程列表</button>
                    {isEditing ? (
                        <div className="space-y-2">
                            <input className="w-full border p-2 rounded text-sm font-bold" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                            <textarea className="w-full border p-2 rounded text-xs" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveCourseInfo}>保存</Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>取消</Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                             <h1 className="font-bold text-lg text-gray-900 leading-tight mb-2">{selectedCourse.title}</h1>
                             <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">讲师: {selectedCourse.instructorName}</div>
                                {isAdminOrMember && (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setIsEditing(true); setEditTitle(selectedCourse.title); setEditDesc(selectedCourse.description); }} className="text-xs text-blue-600 hover:underline">编辑</button>
                                        <button onClick={() => { if(window.confirm('确认删除整个课程？')) { onDeleteCourse(selectedCourse.id); handleBack(); } }} className="text-xs text-red-600 hover:underline">删除</button>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-6">
                    {selectedCourse.modules.map((module, idx) => (
                        <div key={module.id} className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                {module.title}
                                {isAdminOrMember && <button onClick={() => handleDeleteResource(module.id, 'module_itself')} className="text-red-400 hover:text-red-600" title="删除整章"><X className="w-3 h-3" /></button>}
                            </h4>
                            <div className="space-y-1">
                                {module.resources.map(res => (
                                    <div key={res.id} className="flex items-center gap-3 p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all group text-sm text-gray-700">
                                        <div className="text-gray-400">
                                            {res.type === 'video' && <Video className="w-4 h-4" />}
                                            {res.type === 'ppt' && <Monitor className="w-4 h-4" />}
                                            {res.type === 'pdf' && <FileText className="w-4 h-4" />}
                                            {res.type === 'quiz' && <Check className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 truncate">{res.title}</div>
                                        <div className="text-xs text-gray-400">{res.duration || res.size}</div>
                                        {isAdminOrMember && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(module.id, res.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isAdminOrMember && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                                        <button onClick={() => handleAddResource(module.id, 'video')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 视频</button>
                                        <button onClick={() => handleAddResource(module.id, 'ppt')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 课件</button>
                                        <button onClick={() => handleAddResource(module.id, 'pdf')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 文档</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isAdminOrMember && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input 
                                    value={newModuleTitle} 
                                    onChange={e => setNewModuleTitle(e.target.value)} 
                                    placeholder="新章节标题..." 
                                    className="flex-1 text-xs border p-1.5 rounded"
                                />
                                <Button size="sm" onClick={handleAddModule} disabled={!newModuleTitle.trim()}>添加章节</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-64 flex items-center justify-center flex-col gap-4">
                         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                             <Play className="w-8 h-8 fill-current" />
                         </div>
                         <p>选择左侧资源开始学习</p>
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">课程简介</h2>
                        <p className="leading-relaxed">{selectedCourse.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Profile View ---
const ProfileView = ({ user, onUpdateUser, showNotification, tutorials = [], onNavigate }) => {
    const [formData, setFormData] = useState({ name: user.name || '', bio: user.bio || '', title: user.title || '', password: '', newPassword: '' });
    const [activeTab, setActiveTab] = useState('info');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const isGuest = user.role === 'guest';
    const avatarFileInputRef = useRef(null);
    const cardImageFileInputRef = useRef(null);

    const myPosts = tutorials.filter(t => t.authorId === user.id);
    const myLikes = tutorials.filter(t => t.likedBy?.includes(user.id));

    const tabs = [
        { id: 'info', label: '个人资料' },
        ...(user.role !== 'guest' ? [{ id: 'posts', label: `我的发布 (${myPosts.length})` }] : []),
        { id: 'likes', label: `我的收藏 (${myLikes.length})` },
        { id: 'msgs', label: `消息提醒 (${(user.notifications || []).length})` }
    ];

    const handleSave = () => {
        if (formData.newPassword && (formData.newPassword.length < 6 || !/[a-zA-Z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword))) {
            showNotification('新密码至少6位且包含字母和数字', 'error'); return;
        }
        const updates = { name: formData.name, bio: formData.bio, title: formData.title };
        if (formData.newPassword) updates.password = formData.newPassword;
        onUpdateUser(user.id, updates);
        showNotification('个人资料已更新', 'success');
        setFormData(prev => ({...prev, password: '', newPassword: ''}));
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 800 * 1024) { // 800KB limit
                 showNotification('图片大小不能超过 800KB', 'error');
                 return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                onUpdateUser(user.id, { [field]: ev.target.result });
                if(field === 'avatar') setShowAvatarPicker(false);
                showNotification(field === 'avatar' ? '头像已更新' : '封面图已更新', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        onUpdateUser(user.id, { avatar: randomSeed }); 
        setShowAvatarPicker(false);
        showNotification('已生成新随机头像', 'success');
    };

    const handleNavToTutorial = (id) => {
        if (onNavigate) onNavigate(id);
    };
    
    const handleClearNotifications = () => {
        onUpdateUser(user.id, { notifications: [] });
        showNotification('通知已清空', 'success');
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Professional ID Card Layout */}
            <div className="relative mb-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible group">
                 {/* 1. Cover Image Area */}
                 <div className="h-56 w-full bg-gradient-to-r from-slate-50 to-gray-100 rounded-t-2xl relative overflow-hidden">
                     {user.cardImage ? (
                         <img src={user.cardImage} className="w-full h-full object-cover" alt="Cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300">
                             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
                             <ImageIcon className="w-16 h-16 opacity-50" />
                         </div>
                     )}
                     
                     {/* Cover Upload Button */}
                     {!isGuest && (
                         <label className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-20" title="更换封面">
                             <Camera className="w-5 h-5" />
                             <input ref={cardImageFileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cardImage')} className="hidden" />
                         </label>
                     )}
                 </div>

                 {/* 2. Info Area */}
                 <div className="px-8 pb-8 pt-2 flex flex-col-reverse md:flex-row gap-8 items-start">
                    
                    {/* Left: Text Information */}
                    <div className="flex-1 mt-4 md:mt-0 w-full">
                        <div className="flex flex-col gap-1 mb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                                <Badge role={user.role} />
                            </div>
                            <p className="text-lg text-blue-600 font-medium">
                                {user.title || (user.role === 'admin' ? 'Principal Investigator' : (user.role === 'guest' ? 'Visitor' : 'Researcher'))}
                            </p>
                        </div>

                        {/* Bio Section - Supports Multiline */}
                        <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-6 max-w-2xl">
                            {user.bio || "暂无简介..."}
                        </div>

                        {/* Footer Info */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </div>
                            {user.role !== 'guest' && (
                                <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <FileText className="w-4 h-4" />
                                    {myPosts.length} 篇文章
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Floating Avatar */}
                    <div className="relative -mt-24 md:-mt-32 shrink-0 self-center md:self-auto">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white bg-white shadow-lg flex items-center justify-center overflow-hidden relative z-10">
                            <UserAvatar user={user} size="full" className="w-full h-full" />
                        </div>
                        
                        {/* Avatar Edit Button */}
                        {!isGuest && (
                            <div 
                                onClick={() => setShowAvatarPicker(!showAvatarPicker)} 
                                className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white text-gray-700 p-2.5 rounded-full shadow-md cursor-pointer hover:text-blue-600 border border-gray-200 z-20 transition-transform hover:scale-105"
                                title="修改头像"
                            >
                                <Edit className="w-5 h-5" />
                            </div>
                        )}

                        {/* Avatar Selection Dropdown */}
                        {showAvatarPicker && (
                            <div className="absolute top-full right-0 mt-3 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 flex flex-col gap-2 animate-in fade-in zoom-in-95">
                                 <button onClick={handleRandomizeAvatar} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors w-full font-medium">
                                    <RefreshCw className="w-4 h-4 text-blue-500" /> 随机生成头像
                                 </button>
                                 <div className="border-t border-gray-100 my-1"></div>
                                 <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer w-full font-medium">
                                    <Upload className="w-4 h-4 text-green-600" /> 上传图片
                                    <input ref={avatarFileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} className="hidden" />
                                 </label>
                            </div>
                        )}
                    </div>

                 </div>
            </div>

            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ... (tab contents: info, posts, likes, msgs) ... */}
             {activeTab === 'info' && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6 max-w-2xl">
                    {isGuest && (
                        <div className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <div><strong>访客模式限制</strong><p>作为访客，您无法修改个人资料或密码。请联系管理员申请正式账号。</p></div>
                        </div>
                    )}
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">姓名</label><input disabled={isGuest} className={`w-full border p-2 rounded ${isGuest ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label><textarea disabled={isGuest} className={`w-full border p-2 rounded h-24 resize-none ${isGuest ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
                    {!isGuest && (
                        <div className="pt-4 border-t border-gray-100"><h4 className="text-sm font-bold text-gray-900 mb-4">修改密码 (选填)</h4><div className="space-y-3"><input type="password" placeholder="新密码" className="w-full border p-2 rounded" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} /></div></div>
                    )}
                    {!isGuest && <div className="flex justify-end"><Button onClick={handleSave}><Check className="w-4 h-4" /> 保存修改</Button></div>}
                </div>
            )}
            {activeTab === 'posts' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {myPosts.length > 0 ? myPosts.map(post => (
                        <div key={post.id} onClick={() => handleNavToTutorial(post.id)} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 cursor-pointer transition-all group shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 mb-2 transition-colors">{post.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                                        <span>发布于 {new Date(post.lastModified || post.id/1).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> {post.likes || 0}</span>
                                    <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    )) : <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无发布内容</div>}
                </div>
            )}
            {activeTab === 'likes' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {myLikes.length > 0 ? myLikes.map(post => (
                        <div key={post.id} onClick={() => handleNavToTutorial(post.id)} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 cursor-pointer transition-all group shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 mb-2 transition-colors">{post.title}</h4>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <User className="w-3 h-3" /> 作者: {post.authorName || 'Unknown'}
                                    </p>
                                </div>
                                <div className="text-pink-500 text-xs flex items-center gap-1.5 font-bold bg-pink-50 px-3 py-1 rounded-full">
                                    <ThumbsUp className="w-3.5 h-3.5 fill-current" /> 已收藏
                                </div>
                            </div>
                        </div>
                    )) : <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无收藏内容</div>}
                </div>
            )}
            {activeTab === 'msgs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {(user.notifications || []).length > 0 && (<div className="flex justify-end mb-2"><button onClick={handleClearNotifications} className="text-xs text-gray-500 hover:text-red-600 underline hover:bg-red-50 px-2 py-1 rounded transition-colors">清空所有通知</button></div>)}
                    {(user.notifications || []).length === 0 && <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无新消息</div>}
                    {(user.notifications || []).map((notif) => (
                        <div key={notif.id} className="bg-white p-4 rounded-xl border border-blue-100 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                            <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Bell className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{notif.content}</p>
                                <span className="text-xs text-gray-400 block mt-2">{notif.date}</span>
                            </div>
                        </div>
                    ))}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 items-start opacity-70">
                        <div className="mt-1 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0"><Info className="w-4 h-4" /></div>
                        <div>
                            <p className="text-sm text-gray-700 font-medium">系统通知</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">欢迎加入实验室！请完善您的个人资料，并查看新手指南。</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Tutorial/Docs Sidebar Layout
const TutorialLayout = ({ tutorials, selectedId, onSelect, user, onSave, onDelete, isAdminOrMember, onRenameCategory, showNotification, onNotify }) => {
  const categories = [...new Set(tutorials.map(t => t.category))];
  const sortedTutorials = categories.flatMap(cat => tutorials.filter(t => t.category === cat));
  const selectedTutorial = tutorials.find(t => t.id === selectedId);
  const currentIndex = sortedTutorials.findIndex(t => t.id === selectedId);
  const prevTutorial = sortedTutorials[currentIndex - 1];
  const nextTutorial = sortedTutorials[currentIndex + 1];

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('markdown');
  const [editCategory, setEditCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const universalInputRef = useRef(null);

  const isOwner = user?.id === selectedTutorial?.authorId;
  const isAdmin = user?.role === 'admin';
  const canManageCurrent = isAdmin || isOwner;

  useEffect(() => {
    if (selectedTutorial && !isEditing) {
      setEditTitle(selectedTutorial.title);
      setEditContent(selectedTutorial.content);
      setEditType(selectedTutorial.type);
      setEditCategory(selectedTutorial.category);
      setShowDeleteConfirm(false); setShowAiPanel(false);
    }
  }, [selectedTutorial, isEditing]);

  const handleCancel = () => { setIsEditing(false); if (isCreating && selectedTutorial) { /* if canceled creation, we rely on user to not have saved it yet, but here we assume 'create' starts edit mode immediately. */ } setIsCreating(false); };
  
  const handleSave = () => {
    const tutorialToSave = isCreating 
        ? { 
            id: Date.now().toString(), 
            title: editTitle, 
            category: editCategory, 
            content: editContent, 
            type: editType, 
            authorId: user?.id, 
            authorName: user?.name, 
            likes: 0, 
            likedBy: [], 
            comments: [],
            lastModified: new Date().toISOString()
          }
        : { ...selectedTutorial, title: editTitle, content: editContent, type: editType, category: editCategory, lastModified: new Date().toISOString() };
    
    onSave(tutorialToSave);
    if(isCreating) onSelect(tutorialToSave.id);
    setIsEditing(false); setIsCreating(false); showNotification('保存成功', 'success');
  };

  const handleCreate = () => {
    setEditTitle('新文档');
    setEditContent('# 新文档\n开始编写...');
    setEditType('markdown');
    setEditCategory('未分类');
    setIsCreating(true);
    setIsEditing(true);
    // Note: We don't save to DB yet, only when they click Save.
    // To show the UI, we temporarily mock a selected tutorial.
    // But since the UI depends on 'selectedTutorial', we handle this by just setting isCreating=true and using form values.
  };

  const handleUniversalUpload = (e) => {
    const file = e.target.files[0];
    const inputEl = e.target;
    if (file) {
      const fileName = file.name.toLowerCase();
      const isMarkdown = fileName.endsWith('.md');
      const isIpynb = fileName.endsWith('.ipynb');
      if (!isMarkdown && !isIpynb) { showNotification('仅支持 .md 或 .ipynb 格式文件', 'error'); inputEl.value = ''; return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const isDefault = !editContent || editContent === '# 新文档\n开始编写...';
        const typeLabel = isMarkdown ? 'Markdown' : 'Jupyter Notebook';
        if (isIpynb) { try { JSON.parse(content); } catch(e) { showNotification("Jupyter Notebook 文件格式错误", 'error'); inputEl.value = ''; return; } }
        if (isDefault || window.confirm(`导入文件将覆盖当前内容并切换为 ${typeLabel} 模式，是否继续？`)) {
            setEditContent(content); setEditType(isMarkdown ? 'markdown' : 'ipynb'); if (isDefault) setEditTitle(file.name.replace(/\.(md|ipynb)$/i, '')); showNotification(`${typeLabel} 导入成功！`, 'success');
        }
        inputEl.value = '';
      };
      reader.readAsText(file);
    }
  };
  const handleIpynbUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => { setEditContent(ev.target.result); e.target.value = ''; showNotification('文件已替换', 'success'); }; reader.readAsText(file); }
  };
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: aiPrompt }] }], systemInstruction: { parts: [{ text: "你是专业的学术科研助手。请根据用户的提示生成详细的技术教程内容（如果是代码请包含注释），使用中文，格式为Markdown。只输出正文内容，不要寒暄。" }] } }) });
      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) { setEditContent(prev => prev + "\n\n" + generatedText); setAiPrompt(''); setShowAiPanel(false); showNotification('AI 内容生成成功', 'success'); }
    } catch (e) { showNotification('AI 生成请求失败，请稍后再试', 'error'); } finally { setIsAiLoading(false); }
  };
  const startRenameCat = (cat) => { setEditingCat(cat); setNewCatName(cat); };
  const submitRenameCat = () => { if (newCatName && newCatName !== editingCat) { onRenameCategory(editingCat, newCatName); showNotification('分类重命名成功', 'success'); } setEditingCat(null); };
  const handleLike = () => {
      const likedBy = selectedTutorial.likedBy || [];
      const hasLiked = likedBy.includes(user.id);
      const newLikedBy = hasLiked ? likedBy.filter(id => id !== user.id) : [...likedBy, user.id];
      onSave({ ...selectedTutorial, likes: newLikedBy.length, likedBy: newLikedBy });
      if (!hasLiked && selectedTutorial.authorId && selectedTutorial.authorId !== user.id) { onNotify(selectedTutorial.authorId, `${user.name} 点赞了你的文章 "${selectedTutorial.title}"`); }
  };
  let notebookStats = null;
  if (editType === 'ipynb' && editContent) { try { const data = JSON.parse(editContent); notebookStats = { cells: data.cells?.length || 0, size: (editContent.length / 1024).toFixed(1) + ' KB' }; } catch(e) {} }

  // Special case: Creating mode without a selected tutorial
  if (isCreating && !selectedTutorial) {
      // Mock a tutorial object for the editor
  }
  
  const displayTutorial = isCreating ? { title: editTitle, content: editContent, type: editType, category: editCategory } : selectedTutorial;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-y-auto hidden md:flex shrink-0">
        <div className="p-4">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="搜索文档..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {categories.map(cat => (
            <div key={cat} className="mb-4">
               <div className="px-3 mb-2 flex items-center justify-between group">
                 {editingCat === cat ? (
                    <input autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onBlur={submitRenameCat} onKeyDown={(e) => e.key === 'Enter' && submitRenameCat()} className="text-xs font-bold text-gray-700 bg-white border border-blue-300 rounded px-1 w-full" />
                 ) : (
                    <><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat}</h3>{isAdminOrMember && (<button onClick={() => startRenameCat(cat)} className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-3 h-3" /></button>)}</>
                 )}
               </div>
              <div className="space-y-0.5">
                {sortedTutorials.filter(t => t.category === cat).map(t => (
                  <button key={t.id} onClick={() => { onSelect(t.id); setIsEditing(false); setIsCreating(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group ${selectedId === t.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <span className="truncate">{t.title}</span>{t.type === 'ipynb' && <Code className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {isAdminOrMember && (<div className="p-4 border-t border-gray-200"><Button variant="primary" className="w-full text-sm" onClick={handleCreate}><Plus className="w-4 h-4" /> 新建教程</Button></div>)}
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        {(selectedTutorial || isCreating) ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white shrink-0">
               <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{isCreating ? editCategory : selectedTutorial.category}</span><ChevronRight className="w-4 h-4" /><span className="font-medium text-gray-900 truncate max-w-xs">{isCreating ? editTitle : selectedTutorial.title}</span>{!isCreating && selectedTutorial.authorName && (<span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded ml-2 border border-blue-100">By {selectedTutorial.authorName}</span>)}
               </div>
               {(canManageCurrent || isCreating) && (
                 <div className="flex gap-2">
                   {isEditing ? (
                     <><Button variant="secondary" size="sm" onClick={handleCancel}>取消</Button><Button variant="primary" size="sm" onClick={handleSave}><Check className="w-4 h-4" /> 保存</Button></>
                   ) : (
                     <><Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4" /> 编辑</Button>
                       {showDeleteConfirm ? (
                         <div className="flex items-center gap-2 bg-red-50 px-2 rounded border border-red-100 animation-fadeIn"><span className="text-xs text-red-600 font-bold">确定删除?</span><button onClick={() => { onDelete(selectedTutorial.id); setShowDeleteConfirm(false); }} className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 bg-white rounded border border-red-200">是</button><button onClick={() => setShowDeleteConfirm(false)} className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1">否</button></div>
                       ) : (<Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}><Trash className="w-4 h-4" /></Button>)}
                     </>
                   )}
                 </div>
               )}
            </div>
            {isEditing ? (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50">
                  <div className="p-4 border-b border-gray-200 bg-white grid grid-cols-2 gap-4">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="文档标题" className="border p-2 rounded text-sm font-bold"/>
                    <input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="分类" className="border p-2 rounded text-sm"/>
                    <div className="col-span-2 flex flex-wrap items-center gap-3 text-sm mt-2">
                        <Button variant={editType === 'markdown' ? 'primary' : 'secondary'} size="sm" onClick={() => setEditType('markdown')} className="text-xs"><FileText className="w-3.5 h-3.5" /> 撰写</Button>
                        <div className="relative"><Button variant="secondary" size="sm" onClick={() => universalInputRef.current?.click()} className="text-xs"><Plus className="w-3.5 h-3.5" /> 导入</Button><input ref={universalInputRef} type="file" accept=".md,.ipynb" onChange={handleUniversalUpload} className="hidden" /></div>
                        <Button variant={showAiPanel ? 'ai' : 'secondary'} size="sm" onClick={() => setShowAiPanel(!showAiPanel)} className="text-xs"><User className="w-3.5 h-3.5" /> AI 辅助</Button>
                    </div>
                  </div>
                  {showAiPanel && (
                    <div className="bg-purple-50 p-4 border-b border-purple-100 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-purple-800 mb-2 flex items-center gap-1"><User className="w-3 h-3" /> 智能生成内容</label>
                      <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="描述你想写的内容..." className="flex-1 border border-purple-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}/><Button variant="ai" size="sm" onClick={handleAiGenerate} disabled={isAiLoading || !aiPrompt.trim()}>{isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '生成'}</Button></div>
                    </div>
                  )}
                  {editType === 'markdown' ? (
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm bg-gray-50 text-gray-800" placeholder="# 请在此输入 Markdown 内容..."/>
                  ) : (
                    <div className="flex-1 flex flex-col bg-gray-50 p-6 overflow-y-auto">
                      {notebookStats ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                           <FileText className="w-16 h-16 text-green-500" /><div className="text-center"><h3 className="text-lg font-bold text-gray-900">Notebook 已加载</h3><p className="text-sm text-gray-500">包含 {notebookStats.cells} 个单元格 • 大小 {notebookStats.size}</p></div>
                           <div className="flex gap-3 mt-4">
                             <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm"><Settings className="w-4 h-4" /> 替换文件<input type="file" accept=".ipynb" onChange={handleIpynbUpload} className="hidden" /></label>
                             <button onClick={() => setEditContent('')} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm border border-transparent hover:border-red-200">清除</button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-300 rounded-lg m-4"><Plus className="w-12 h-12 mb-4 text-gray-300" /><p className="mb-2 font-medium text-gray-600">拖入或点击上传 .ipynb 文件</p><p className="text-xs text-gray-400 mb-6">支持 Jupyter Notebook 格式</p><div className="flex gap-2"><label className="cursor-pointer"><span className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 shadow-sm">导入 Notebook</span><input type="file" accept=".ipynb" onChange={handleIpynbUpload} className="hidden" /></label></div></div>
                      )}
                    </div>
                  )}
                </div>
                <div className="w-1/2 overflow-y-auto bg-white p-8 border-l border-gray-100">
                  <div className="uppercase tracking-wide text-xs font-bold text-gray-400 mb-4 flex items-center gap-2"><Search className="w-3 h-3" /> 实时预览</div>
                  {editType === 'markdown' ? <MarkdownRenderer content={editContent} /> : (
                    notebookStats ? <IpynbRenderer content={editContent} /> : <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2"><FileText className="w-10 h-10 opacity-20" /><span className="text-sm">请先上传有效的 Notebook 文件</span></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-white px-8 py-10 max-w-5xl mx-auto w-full pb-32">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{selectedTutorial.title}</h1>
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                    <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTutorial.likedBy?.includes(user.id) ? 'bg-pink-100 text-pink-600 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Plus className={`w-4 h-4 ${selectedTutorial.likedBy?.includes(user.id) ? 'fill-current' : ''}`} />{selectedTutorial.likes || 0} 点赞</button>
                    <span className="text-xs text-gray-400">更新于 {new Date(selectedTutorial.lastModified || Date.now()).toLocaleDateString()}</span>
                </div>
                {selectedTutorial.type === 'ipynb' ? <IpynbRenderer content={selectedTutorial.content} /> : <MarkdownRenderer content={selectedTutorial.content} />}
                <div className="grid grid-cols-2 gap-4 mt-16 pt-8 border-t border-gray-100">
                    {prevTutorial ? (
                        <button onClick={() => onSelect(prevTutorial.id)} className="group flex flex-col items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"><span className="text-xs text-gray-400 mb-1 flex items-center gap-1 group-hover:text-blue-500"><ChevronLeft className="w-3 h-3" /> 上一篇</span><span className="font-bold text-gray-800 group-hover:text-blue-700 line-clamp-1">{prevTutorial.title}</span></button>
                    ) : <div className="p-4"></div>}
                    {nextTutorial ? (
                        <button onClick={() => onSelect(nextTutorial.id)} className="group flex flex-col items-end p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-right"><span className="text-xs text-gray-400 mb-1 flex items-center gap-1 group-hover:text-blue-500">下一篇 <ChevronRight className="w-3 h-3" /></span><span className="font-bold text-gray-800 group-hover:text-blue-700 line-clamp-1">{nextTutorial.title}</span></button>
                    ) : <div className="p-4"></div>}
                </div>
                <CommentSection tutorial={selectedTutorial} onUpdate={onSave} user={user} isAdmin={isAdmin} onNotify={onNotify} />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4"><BookOpen className="w-16 h-16 opacity-20" /><p>请从左侧选择一个文档查看</p></div>
        )}
      </div>
    </div>
  );
};

// ... (AdminPanel, LoginView) ...
const AdminPanel = ({ users, onUpdateUser, registrationCode, onUpdateCode, onDeleteUser, currentUser, onNotify }) => {
    // ... (implementation same as before)
    const [newCode, setNewCode] = useState(registrationCode);
  const [isEditingCode, setIsEditingCode] = useState(false);

  // Sync state when prop updates
  useEffect(() => {
      setNewCode(registrationCode);
  }, [registrationCode]);

  const grantAccess = (userId) => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    onUpdateUser(userId, { tempAccessUntil: expiry.toISOString() });
    onNotify(userId, '管理员授予了您 24 小时的临时访问权限。');
  };

  const revokeAccess = (userId) => {
    onUpdateUser(userId, { tempAccessUntil: "" });
  };

  const changeRole = (userId, newRole) => {
    onUpdateUser(userId, { role: newRole });
    const roleNames = { admin: '管理员', member: '正式成员', alumni: '校友' };
    onNotify(userId, `您的身份已变更为 ${roleNames[newRole] || newRole}。`);
  };

  const handleSaveCode = () => {
    if (newCode.trim().length < 4) {
      alert('口令码至少需要4个字符');
      return;
    }
    onUpdateCode(newCode);
    setIsEditingCode(false);
    alert('注册口令已更新');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-bold text-gray-900">管理控制台</h2><p className="text-gray-500">管理成员权限与系统设置</p></div>
        <Lock className="w-10 h-10 text-blue-600 opacity-20" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-8 p-6">
        <div className="flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-bold text-gray-900">系统设置</h3></div>
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">注册验证口令</label><p className="text-xs text-gray-500">用于验证新用户是否为课题组成员。请定期更换以防外泄。</p></div>
          <div className="flex items-center gap-2">
            {isEditingCode ? (
              <><input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="border border-blue-300 rounded px-3 py-1.5 text-sm font-mono w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" /><Button onClick={handleSaveCode} variant="primary" className="text-xs py-1.5 px-3">保存</Button><Button onClick={() => { setIsEditingCode(false); setNewCode(registrationCode); }} variant="secondary" className="text-xs py-1.5 px-3">取消</Button></>
            ) : (
              <><code className="bg-gray-200 px-3 py-1.5 rounded text-sm font-mono font-bold text-gray-700">{registrationCode}</code><Button onClick={() => setIsEditingCode(true)} variant="secondary" className="text-xs py-1.5 px-3">修改</Button></>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">用户列表</h3></div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">临时权限状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => {
              const hasTempAccess = u.role === 'guest' && u.tempAccessUntil && new Date(u.tempAccessUntil) > new Date();
              return (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center"><div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"><UserAvatar user={u} size="sm" /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{u.name}</div><div className="text-sm text-gray-500">{u.email}</div></div></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge role={u.role} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.role === 'guest' ? (hasTempAccess ? (<span className="text-green-600 flex items-center gap-1"><Clock className="w-3 h-3" /> 有效至 {new Date(u.tempAccessUntil).toLocaleTimeString()}</span>) : '无权限') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 items-center">
                    {u.role === 'guest' && (hasTempAccess ? (<button type="button" onClick={() => revokeAccess(u.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1 font-bold"><X className="w-3 h-3" /> 取消权限</button>) : (<button type="button" onClick={() => grantAccess(u.id)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1"><Check className="w-3 h-3" /> 授予24h权限</button>))}
                    {u.role === 'member' && (<button onClick={() => changeRole(u.id, 'alumni')} className="text-orange-600 hover:text-orange-900 ml-2 border border-orange-200 rounded px-2 py-0.5 bg-orange-50">🎓 转为校友</button>)}
                    {u.role === 'alumni' && (<button onClick={() => changeRole(u.id, 'member')} className="text-green-600 hover:text-green-900 ml-2 border border-green-200 rounded px-2 py-0.5 bg-green-50">↩️ 恢复成员</button>)}
                    {u.role !== 'admin' && <button onClick={() => changeRole(u.id, 'admin')} className="text-purple-600 hover:text-purple-900 ml-2">提权</button>}
                    {u.role === 'admin' && <button onClick={() => changeRole(u.id, 'member')} className="text-gray-600 hover:text-gray-900 ml-2">降级</button>}
                    {u.id !== currentUser?.id && (<button onClick={() => onDeleteUser(u.id)} className="text-red-600 hover:text-red-900 ml-2 flex items-center gap-1" title="删除用户"><Trash className="w-4 h-4" /></button>)}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoginView = ({ users, onLogin, onRegister }) => {
  const isFirstRun = users.length === 0;
  const [isLogin, setIsLogin] = useState(!isFirstRun);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', code: '' });

  const submit = (e) => {
    e.preventDefault();
    if (isLogin) onLogin(formData.email, formData.password);
    else onRegister(formData.name, formData.email, formData.password, formData.code);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 relative">
        {isFirstRun && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div><strong>系统初始化</strong><p>暂无用户。首位注册用户将自动获得<span className="font-bold">超级管理员</span>权限。</p></div>
          </div>
        )}
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? '成员登录' : '申请加入课题组'}</h2>
        <form onSubmit={submit} className="space-y-4">
          {!isLogin && <div><label className="block text-sm font-medium text-gray-700">姓名</label><input required className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>}
          <div><label className="block text-sm font-medium text-gray-700">邮箱</label><input type="email" required className="w-full border p-2 rounded" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">密码</label><input type="password" required className="w-full border p-2 rounded" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} /></div>
          {!isLogin && <p className="text-xs text-gray-500 mt-1 ml-1">* 密码至少6位，需包含字母和数字</p>}
          {!isLogin && <div><label className="block text-sm font-medium text-gray-700 mt-4">课题组口令码 <span className="text-gray-400 font-normal">{isFirstRun ? '(无需填写)' : '(首位无需填写)'}</span></label><input className="w-full border p-2 rounded disabled:bg-gray-100" placeholder={isFirstRun ? "首位注册，免口令" : "管理员提供的口令"} value={formData.code} onChange={e=>setFormData({...formData, code:e.target.value})} disabled={isFirstRun}/></div>}
          <Button className="w-full mt-6">{isLogin ? '登录' : '注册并登录'}</Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {!isFirstRun && <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">{isLogin ? '没有账号？申请加入' : '已有账号？登录'}</button>}
        </div>
      </Card>
    </div>
  );
};

// ... (App implementation) ...
const App = () => {
    // State management
    const [firebaseUser, setFirebaseUser] = useState(null); // Auth user for DB connection
    const [users, setUsers] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
    const [registrationCode, setRegistrationCode] = useState(DEFAULT_CODE);
    const [notification, setNotification] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // App-level user
    const [currentView, setCurrentView] = useState('home'); 
    const [selectedTutorialId, setSelectedTutorialId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Initialize Firebase Auth
    useEffect(() => {
        const initAuth = async () => {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(auth, __initial_auth_token);
            } else {
              await signInAnonymously(auth);
            }
          } catch (err) {
            console.error("Auth Error:", err);
            showNotification("连接云服务失败，请尝试刷新", "error");
          }
        };
        initAuth();
        return onAuthStateChanged(auth, setFirebaseUser);
    }, []);

    // 2. Sync Data with Firestore (Snapshot Listeners)
    useEffect(() => {
        if (!firebaseUser) return;
        setIsLoading(true);

        // Helper to sync collection to state
        const syncCollection = (colName, setState, initialData = null) => {
            const ref = collection(db, ...getPath(colName));
            return onSnapshot(ref, (snap) => {
                if (snap.empty && initialData) {
                   // Seed database if empty
                   const batch = writeBatch(db);
                   initialData.forEach(item => {
                       const docRef = doc(db, ...getPath(colName), item.id);
                       batch.set(docRef, item);
                   });
                   // Also seed settings if this is first run
                   if (colName === 'users') {
                       const settingsRef = doc(db, ...getPath('settings'), 'config');
                       batch.set(settingsRef, { registrationCode: DEFAULT_CODE });
                   }
                   batch.commit().catch(e => console.error("Seeding failed", e));
                } else {
                    const data = snap.docs.map(d => d.data());
                    setState(data);
                }
            });
        };

        const unsubUsers = syncCollection('users', setUsers, INITIAL_USERS);
        const unsubTutorials = syncCollection('tutorials', setTutorials, INITIAL_TUTORIALS);
        const unsubCourses = syncCollection('courses', setCourses, INITIAL_COURSES);
        const unsubNews = syncCollection('news', setNews, INITIAL_NEWS);
        
        // Sync Settings (Special case: single document)
        const settingsRef = doc(db, ...getPath('settings'), 'config');
        const unsubSettings = onSnapshot(settingsRef, (doc) => {
            if (doc.exists()) {
                setRegistrationCode(doc.data().registrationCode);
            }
        });

        setIsLoading(false);

        return () => {
            unsubUsers();
            unsubTutorials();
            unsubCourses();
            unsubNews();
            unsubSettings();
        };
    }, [firebaseUser]);
  
    // 3. Keep current user synced with latest data
    useEffect(() => {
      if (currentUser) {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(updatedUser);
        }
      }
    }, [users, currentUser]);

    // --- Action Handlers (Now interacting with Firestore) ---

    const showNotification = (message, type = 'info') => {
      setNotification({ message, type });
    };
  
    // App Logic: Login
    const handleLogin = (email, password) => {
      const userByEmail = users.find(u => u.email === email);
      if (!userByEmail) {
          showNotification('该邮箱尚未注册，请先注册。', 'error');
          return;
      }
      if (userByEmail.password !== password) {
          showNotification('密码错误，请重试。', 'error');
          return;
      }
      setCurrentUser(userByEmail);
      setCurrentView('home');
      showNotification(`欢迎回来，${userByEmail.name}`, 'success');
    };
  
    // App Logic: Register (Writes to Firestore)
    const handleRegister = async (name, email, password, code) => {
      if (!firebaseUser) return;
      if (users.find(u => u.email === email)) {
        showNotification('该邮箱已被注册，请直接登录。', 'error');
        return;
      }
      
      if (password.length < 6) {
          showNotification('密码长度至少需要6位。', 'error');
          return;
      }
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      if (!hasLetter || !hasNumber) {
          showNotification('密码过于简单！请确保密码同时包含字母和数字。', 'error');
          return;
      }
  
      let role = 'guest';
      const hasAdmin = users.some(u => u.role === 'admin');
      if (users.length === 0 || !hasAdmin) role = 'admin';
      else role = code === registrationCode ? 'member' : 'guest';
      
      const randomAvatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
      const newUser = { 
          id: Date.now().toString(), 
          name, 
          email, 
          password, 
          role, 
          bio: '新加入成员', 
          avatar: randomAvatar,
          notifications: [] 
      };

      try {
          await setDoc(doc(db, ...getPath('users'), newUser.id), newUser);
          setCurrentUser(newUser);
          setCurrentView('home');
          if (role === 'admin') showNotification(`欢迎！作为系统首位用户，您已自动获得管理员权限。`, 'success');
          else if (role === 'member') showNotification('认证成功！您已成为课题组成员。', 'success');
          else showNotification('注册成功。您当前身份为游客，权限受限。', 'success');
      } catch (e) {
          console.error(e);
          showNotification('注册失败，请检查网络', 'error');
      }
    };
  
    const hasAccess = (section) => {
      if (!currentUser) return false;
      if (['admin', 'member', 'alumni'].includes(currentUser.role)) return true;
      if (currentUser.role === 'guest' && currentUser.tempAccessUntil && new Date(currentUser.tempAccessUntil) > new Date()) return true;
      return false;
    };
    const isAdmin = currentUser?.role === 'admin';
  
    // Update User (Firestore)
    const handleUpdateUser = async (id, data) => {
      if (!firebaseUser) return;
      try {
          // 1. Update User
          await setDoc(doc(db, ...getPath('users'), id), { ...users.find(u => u.id === id), ...data });

          // 2. If name/avatar changed, we should update related content (Tutorial Authors/Comments)
          // This simulates a relational update. In a real app, you'd use Cloud Functions or store minimal user data.
          if (data.name || data.avatar || data.title) {
            const batch = writeBatch(db);
            let hasBatchOps = false;

            tutorials.forEach(t => {
                let tModified = false;
                let newT = { ...t };

                if (t.authorId === id && data.name) {
                    newT.authorName = data.name;
                    tModified = true;
                }

                if (newT.comments?.length) {
                    const newComments = newT.comments.map(c => {
                        let cModified = false;
                        let newC = { ...c };
                        if (c.userId === id) {
                            if (data.name) newC.userName = data.name;
                            if (data.avatar) newC.userAvatar = data.avatar;
                            cModified = true;
                        }
                        if (c.replies?.length) {
                            const newReplies = c.replies.map(r => {
                                if (r.userId === id) {
                                    cModified = true;
                                    return { 
                                        ...r, 
                                        userName: data.name || r.userName,
                                        userAvatar: data.avatar || r.userAvatar
                                    };
                                }
                                return r;
                            });
                            newC.replies = newReplies;
                        }
                        if (cModified) tModified = true;
                        return newC;
                    });
                    newT.comments = newComments;
                }

                if (tModified) {
                    batch.set(doc(db, ...getPath('tutorials'), t.id), newT);
                    hasBatchOps = true;
                }
            });

            if (hasBatchOps) await batch.commit();
          }

      } catch (e) {
          console.error("Update user failed", e);
          showNotification("更新失败", "error");
      }
    };
    
    const handleDeleteUser = async (id) => {
        if (!firebaseUser) return;
        if(window.confirm('确认删除该用户吗？此操作不可逆。')) {
            await deleteDoc(doc(db, ...getPath('users'), id));
            showNotification('用户删除成功', 'success');
        }
    };

    const handleNotify = async (targetUserId, content) => {
        if (!firebaseUser) return;
        const targetUser = users.find(u => u.id === targetUserId);
        if (!targetUser) return;

        const newNotification = {
            id: Date.now().toString(),
            content,
            date: new Date().toLocaleDateString(),
            read: false
        };
        const updatedNotifications = [newNotification, ...(targetUser.notifications || [])];
        await handleUpdateUser(targetUserId, { notifications: updatedNotifications });
    };

    // Tutorial Operations (Firestore)
    const handleSaveTutorial = async (tutorial) => {
      if (!firebaseUser) return;
      try {
        await setDoc(doc(db, ...getPath('tutorials'), tutorial.id), tutorial);
      } catch (e) {
        console.error("Save tutorial failed", e);
        showNotification('保存文档失败', 'error');
      }
    };

    const handleDeleteTutorial = async (id) => {
      if (!firebaseUser) return;
      try {
        await deleteDoc(doc(db, ...getPath('tutorials'), id));
        if (selectedTutorialId === id) setSelectedTutorialId(null);
        showNotification('文档已删除', 'success');
      } catch(e) { showNotification('删除失败', 'error'); }
    };
    
    const handleRenameCategory = async (oldName, newName) => {
        if (!firebaseUser || !oldName || !newName) return;
        const batch = writeBatch(db);
        tutorials.filter(t => t.category === oldName).forEach(t => {
            const docRef = doc(db, ...getPath('tutorials'), t.id);
            batch.update(docRef, { category: newName, lastModified: new Date().toISOString() });
        });
        await batch.commit();
        showNotification('分类重命名成功', 'success');
    };

    // Course Operations (Firestore)
    const handleSaveCourse = async (course) => {
        if (!firebaseUser) return;
        try {
            await setDoc(doc(db, ...getPath('courses'), course.id), course);
        } catch (e) {
            console.error(e);
            showNotification('课程保存失败', 'error');
        }
    };
    
    const handleDeleteCourse = async (id) => {
        if (!firebaseUser) return;
        try {
            await deleteDoc(doc(db, ...getPath('courses'), id));
            showNotification('课程已删除', 'success');
        } catch (e) { showNotification('删除失败', 'error'); }
    };
  
    // Config Operations
    const handleUpdateCode = async (newCode) => {
        if (!firebaseUser) return;
        const settingsRef = doc(db, ...getPath('settings'), 'config');
        await setDoc(settingsRef, { registrationCode: newCode }, { merge: true });
    };
    

    // --- Loading Screen ---
    if (!firebaseUser && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p>正在连接 TIA Lab 云端数据库...</p>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 relative">
        {notification && (<Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />)}
        <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 backdrop-blur-lg bg-opacity-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                  <span className="font-bold text-xl tracking-tight">TIA Lab</span>
                  <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200"><Cloud className="w-3 h-3" /> Online</span>
                </div>
                <div className="hidden md:flex space-x-1">
                  {[{ id: 'home', label: '首页', icon: null }, { id: 'tutorials', label: '技术教程', icon: BookOpen }, { id: 'courses', label: '教学课程', icon: BookOpen }, { id: 'news', label: '新闻动态', icon: FileText }, { id: 'team', label: '团队成员', icon: Users }].map(nav => (
                    <button key={nav.id} onClick={() => setCurrentView(nav.id)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView === nav.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                      {nav.icon && <nav.icon className="w-4 h-4" />}{nav.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {currentUser ? (
                  <div className="flex items-center gap-4">
                    {isAdmin && <button onClick={() => setCurrentView('admin')} className="text-gray-500 hover:text-blue-600"><Settings className="w-5 h-5" /></button>}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('profile')}>
                      <UserAvatar user={currentUser} size="sm" />
                      <div className="hidden lg:block text-sm"><p className="font-medium leading-none">{currentUser.name}</p><p className="text-xs text-gray-500 mt-0.5"><Badge role={currentUser.role} /></p></div>
                    </div>
                    <button onClick={() => { setCurrentUser(null); setCurrentView('home'); }} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
                  </div>
                ) : <Button variant="primary" className="text-sm" onClick={() => setCurrentView('login')}>成员登录 / 注册</Button>}
              </div>
            </div>
          </div>
        </nav>
        <main>
          {currentView === 'home' && (
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">计算病理学与<span className="text-blue-600">人工智能</span>实验室</h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">致力于利用先进的深度学习技术解决生物医学图像分析中的挑战性问题。</p>
                <div className="mt-8 flex justify-center gap-4"><Button onClick={() => setCurrentView('tutorials')}>浏览教程</Button><Button variant="secondary" onClick={() => setCurrentView('team')}>了解团队</Button></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                 {news.slice(0,3).map(n => (<Card key={n.id} className="p-6 hover:shadow-md transition-shadow"><div className="text-sm text-blue-600 mb-2">{n.date}</div><h3 className="font-bold text-lg mb-2">{n.title}</h3><p className="text-gray-500 text-sm line-clamp-3">{n.content}</p></Card>))}
              </div>
              <div className="mt-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><span className="text-orange-500">🔥</span> 热门技术教程</h2>
                    <button onClick={() => setCurrentView('tutorials')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">查看更多 <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {tutorials.length > 0 ? [...tutorials].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3).map(t => (
                        <div key={t.id} onClick={() => { setSelectedTutorialId(t.id); setCurrentView('tutorials'); }} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">{t.category}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Plus className="w-3 h-3" /> {t.likes || 0}</span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{t.title}</h3>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <UserAvatar user={{name: t.authorName || 'A', avatar: null}} size="xs" className="bg-gray-100 text-gray-500" />
                                <span className="text-xs text-gray-500">{t.authorName || 'Unknown'}</span>
                                <span className="text-xs text-gray-300 ml-auto">{new Date(t.lastModified || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )) : <div className="col-span-3 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无教程数据</div>}
                </div>
              </div>
            </div>
          )}
          {currentView === 'tutorials' && (
            hasAccess('tutorials') ? (
              <TutorialLayout 
                tutorials={tutorials} 
                selectedId={selectedTutorialId} 
                onSelect={setSelectedTutorialId}
                user={currentUser}
                onSave={handleSaveTutorial}
                onDelete={handleDeleteTutorial}
                isAdminOrMember={['admin', 'member'].includes(currentUser?.role)}
                onRenameCategory={handleRenameCategory}
                showNotification={showNotification}
                onNotify={handleNotify}
              />
            ) : (
              <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4"><Lock className="w-20 h-20 text-gray-300 mb-6" /><h2 className="text-2xl font-bold text-gray-900 mb-2">访问受限</h2><p className="text-gray-500 max-w-md mb-8">该内容仅对课题组成员开放。</p>{!currentUser && <Button onClick={() => setCurrentView('login')}>登录 / 注册</Button>}</div>
            )
          )}
          {currentView === 'courses' && (
             <CourseView 
                courses={courses} 
                user={currentUser} 
                isAdminOrMember={['admin', 'member'].includes(currentUser?.role)} 
                onSaveCourse={handleSaveCourse}
                onDeleteCourse={handleDeleteCourse}
                showNotification={showNotification}
             />
          )}
          {currentView === 'team' && (
           <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
             {/* 1. Principal Investigators & Admins */}
             <div>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">实验室负责人 & 管理员</h2>
                    <p className="text-gray-500 mt-2">Leading the future of AI for Science</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    {users.filter(u => u.role === 'admin').map(member => (
                         <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
                            <div className="h-32 w-full bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                                {member.cardImage && <img src={member.cardImage} className="w-full h-full object-cover" alt="Cover" />}
                            </div>
                            <div className="px-8 pb-8 pt-0 flex flex-col items-center relative w-full">
                                <div className="w-24 h-24 -mt-12 mb-4 rounded-full border-4 border-white p-1 bg-white shadow-sm z-10 shrink-0">
                                    <UserAvatar user={member} size="full" className="w-full h-full" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                <div className="mt-1 mb-4 text-sm text-blue-600 font-medium">{member.title || "Principal Investigator"}</div>
                                <p className="text-gray-500 text-sm text-center leading-relaxed line-clamp-3 h-16 overflow-hidden whitespace-pre-wrap">{member.bio || "暂无简介"}</p>
                                <div className="pt-4 border-t border-gray-50 w-full flex justify-center">
                                  <div className="text-gray-400 flex items-center gap-2 text-xs font-medium select-all cursor-text hover:text-blue-600">
                                     <Mail className="w-4 h-4" /> <span>{member.email}</span>
                                  </div>
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
             </div>

             {/* 2. Research Members */}
             <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> 在读成员</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                {users.filter(u => u.role === 'member').length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {users.filter(u => u.role === 'member').map(member => (
                            <div key={member.id} className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group relative">
                                {/* Card Image Section */}
                                <div className="h-40 w-full bg-gray-50 relative overflow-hidden">
                                     {member.cardImage ? (
                                       <img src={member.cardImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cover" />
                                     ) : (
                                       <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-300">
                                         <User className="w-12 h-12 opacity-20" />
                                       </div>
                                     )}
                                     {/* Role Tag */}
                                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50">
                                        {member.title || "PhD Student"}
                                     </div>
                                </div>
                                
                                {/* Content Section */}
                                <div className="p-6 pt-12 relative flex-1 flex flex-col">
                                   {/* Avatar floating */}
                                   <div className="absolute -top-10 left-6 border-4 border-white rounded-full shadow-sm z-10 w-20 h-20 shrink-0">
                                      <UserAvatar user={member} size="full" className="w-full h-full" />
                                   </div>

                                   <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                                   <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1 whitespace-pre-wrap">
                                     {member.bio || "暂无简介"}
                                   </p>
                                   
                                   <div className="pt-4 border-t border-gray-50 flex items-center justify-center mt-auto text-gray-500 text-xs">
                                      <div className="flex items-center gap-2 select-all cursor-text hover:text-blue-600 transition-colors">
                                         <Mail className="w-3.5 h-3.5" />
                                         <span className="truncate">{member.email}</span>
                                      </div>
                                   </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                        暂无在读成员
                    </div>
                )}
             </div>
             
             {/* Alumni Section */}
              {users.some(u => u.role === 'alumni') && (
                 <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <h3 className="text-xl font-bold text-gray-500 flex items-center gap-2"><BookOpen className="w-5 h-5" /> 毕业校友</h3>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {users.filter(u => u.role === 'alumni').map(member => (
                            <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col items-center text-center hover:bg-gray-50 transition-colors group">
                                <UserAvatar user={member} size="md" className="mb-2 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
                                <h4 className="font-medium text-sm text-gray-700 group-hover:text-gray-900">{member.name}</h4>
                                <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 w-full">{member.title || "Alumni"}</p>
                            </div>
                        ))}
                    </div>
                 </div>
             )}
           </div>
        )}
          {currentView === 'admin' && isAdmin && <AdminPanel users={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} registrationCode={registrationCode} onUpdateCode={handleUpdateCode} currentUser={currentUser} onNotify={handleNotify} />}
          {currentView === 'login' && <LoginView onLogin={handleLogin} onRegister={handleRegister} users={users} />}
          {currentView === 'profile' && <ProfileView user={currentUser} onUpdateUser={handleUpdateUser} showNotification={showNotification} tutorials={tutorials} onNavigate={(id) => { setSelectedTutorialId(id); setCurrentView('tutorials'); }} />}
          {(currentView === 'news') && <div className="max-w-4xl mx-auto px-4 py-12 text-center"><div className="bg-blue-50 p-12 rounded-2xl"><h2 className="text-2xl font-bold text-blue-900 mb-4">新闻动态建设中</h2><p className="text-blue-700">更多新闻即将上线。</p></div></div>}
        </main>
      </div>
    );
  };
  
  export default App;
