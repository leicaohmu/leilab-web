import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Plus, Trash2, CheckCircle, Circle, Loader2, Users, CloudLightning, LogOut,
  BookOpen, FileText, Search, ChevronRight, ChevronLeft, Lock, Trash, Edit,
  Settings, Upload, Code, MessageSquare, Clock, AlertCircle, Check, Play,
  Copy, Eye, Save, RefreshCw, User, Shield, ThumbsUp, Key, X, Info, Bell,
  Mail, ImageIcon, Camera, Video, Monitor, Cloud
} from 'lucide-react';

// ==========================================
// 0. Firebase Configuration (需替换为您的真实配置)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBP8q3x0ZnzEguw5W9SbTKRM_VaLhpmCxI",
  authDomain: "leilab-18ab6.firebaseapp.com",
  projectId: "leilab-18ab6",
  storageBucket: "leilab-18ab6.firebasestorage.app",
  messagingSenderId: "128874836864",
  appId: "1:128874836864:web:978a8e1d4f42cb66888765",
  measurementId: "G-5B4T2ZP25R"
};

// 初始化 Firebase
// (简单的防错检查，防止未配置时白屏)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 1. 图标组件 (Zero Dependency SVGs) - 保持原样
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
const Settings = (props) => <IconBase {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></IconBase>;
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
const Cloud = (props) => <IconBase {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></IconBase>;

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
    const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-16 h-16 text-3xl", xl: "w-24 h-24 text-4xl", full: "w-full h-full text-4xl" };
    const sizeClass = sizes[size] || sizes.md;
    const isCustomImage = user.avatar && user.avatar.startsWith('data:image');
    const isEmoji = user.avatar && !isCustomImage && user.avatar.length < 5;
    if (isEmoji) return <div onClick={onClick} className={`${sizeClass} rounded-full bg-gray-100 flex items-center justify-center shadow-sm shrink-0 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}>{user.avatar}</div>;
    const avatarSeed = user.avatar && !isCustomImage ? user.avatar : user.name;
    const avatarUrl = isCustomImage ? user.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`;
    return <div onClick={onClick} className={`${sizeClass} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}><img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${user.name}&background=random`}} /></div>;
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
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '复制'}</button>
          <button onClick={handleRunInColab} className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-2 py-0.5 rounded hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-colors" title="在 Colab 中运行">
            <Play className="w-3 h-3 fill-current" /> Run in Colab
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto bg-[#282c34] text-gray-100 font-mono text-sm leading-relaxed"><pre>{code}</pre></div>
    </div>
  );
};

const convertTableToHtml = (t) => { try { const r=t.trim().split('\n').map(x=>x.trim().replace(/^\||\|$/g,'').split('|').map(y=>y.trim()));if(r.length<2)return t;const h=r[0],b=r.slice(2);const f=x=>x.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded font-mono text-xs">$1</code>');const rr=(c,i=false)=>`<tr>${c.map(x=>`<${i?'th':'td'} class="${i?'px-4 py-2 bg-gray-50 border border-gray-200 font-bold text-left text-gray-700':'px-4 py-2 border border-gray-200 text-gray-600'}">${f(x)}</${i?'th':'td'}>`).join('')}</tr>`;return `<div class="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm"><table class="min-w-full border-collapse text-sm"><thead>${rr(h,true)}</thead><tbody class="bg-white divide-y divide-gray-200">${b.map(x=>rr(x)).join('')}</tbody></table></div>`; } catch(e){return t;}};

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
  try { const data = typeof content === 'string' ? JSON.parse(content) : content; cells = data.cells || []; } catch (e) { error = "文件格式错误"; }
  useEffect(() => { typeset(); }, [content]);
  if (error) return <div className="text-red-500">{error}</div>;
  return <div className="space-y-6">{cells.map((cell, idx) => (<div key={idx}>{cell.cell_type === 'markdown' ? <div className="prose prose-sm max-w-none px-4 py-2"><MarkdownRenderer content={Array.isArray(cell.source) ? cell.source.join('') : cell.source} /></div> : <CodeBlock language="python" code={Array.isArray(cell.source) ? cell.source.join('') : cell.source} />}</div>))}</div>;
};

// ==========================================
// 6. Functional Sections
// ==========================================

const CommentSection = ({ tutorial, onUpdate, user, isAdmin, onNotify }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); 
  const [replyContent, setReplyContent] = useState('');
  const comments = tutorial?.comments || []; 

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
    setReplyTo(null); setReplyContent('');
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
  const canDelete = (uid) => isAdmin || user.id === uid;

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
        {comments.map(c => (
          <div key={c.id} className="group">
            <div className="flex gap-3">
                <UserAvatar user={{name: c.userName, avatar: c.userAvatar}} size="sm" className="bg-gray-100 text-gray-600" />
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1"><span className="font-bold text-sm text-gray-900">{c.userName}</span><span className="text-xs text-gray-400">{c.date}</span></div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                        <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-xs text-gray-500 hover:text-blue-600 font-medium">回复</button>
                        {canDelete(c.userId) && <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-gray-400 hover:text-red-600">删除</button>}
                    </div>
                    {c.replies?.map(r => (
                        <div key={r.id} className="flex gap-2 mt-3 pl-4 border-l-2 border-gray-100">
                            <UserAvatar user={{name: r.userName, avatar: r.userAvatar}} size="xs" className="bg-gray-100 text-gray-500" />
                            <div className="flex-1">
                                <div className="bg-white border border-gray-100 rounded-lg p-2">
                                    <div className="flex justify-between items-start mb-1"><span className="font-bold text-xs text-gray-800">{r.userName}</span><span className="text-[10px] text-gray-400">{r.date}</span></div>
                                    <p className="text-xs text-gray-600">{r.content}</p>
                                </div>
                                {canDelete(r.userId) && <button onClick={() => handleDeleteComment(r.id, true, c.id)} className="text-[10px] text-gray-400 hover:text-red-600 mt-1 ml-1">删除</button>}
                            </div>
                        </div>
                    ))}
                    {replyTo === c.id && <div className="flex gap-2 mt-3 pl-4 border-l-2 border-blue-100 animate-in slide-in-from-top-1"><input autoFocus value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder={`回复 ${c.userName}...`} className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500" onKeyDown={e => e.key === 'Enter' && handleAddReply(c.id)} /><Button size="sm" onClick={() => handleAddReply(c.id)}>回复</Button></div>}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseView = ({ courses, user, isAdminOrMember, onUpdateCourses, showNotification }) => {
    const [viewMode, setViewMode] = useState('list'); 
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const handleSelectCourse = (course) => { setSelectedCourse(course); setViewMode('detail'); setIsEditing(false); };
    const handleBack = () => { setSelectedCourse(null); setViewMode('list'); };

    const handleCreateCourse = () => {
        const newCourse = { id: Date.now().toString(), title: '新课程', description: '课程描述...', instructorName: user.name, instructorId: user.id, level: '初级', duration: '待定', students: 0, modules: [] };
        onUpdateCourses([...courses, newCourse]);
        showNotification('新课程已创建，请编辑内容', 'success');
        handleSelectCourse(newCourse); setIsEditing(true); setEditTitle(newCourse.title); setEditDesc(newCourse.description);
    };

    const handleSaveCourseInfo = () => {
        if (!selectedCourse) return;
        const updatedCourse = { ...selectedCourse, title: editTitle, description: editDesc };
        onUpdateCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
        setSelectedCourse(updatedCourse); setIsEditing(false); showNotification('课程信息已保存', 'success');
    };

    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return;
        const newModule = { id: Date.now().toString(), title: newModuleTitle, resources: [] };
        const updatedCourse = { ...selectedCourse, modules: [...selectedCourse.modules, newModule] };
        onUpdateCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
        setSelectedCourse(updatedCourse); setNewModuleTitle(''); showNotification('章节已添加', 'success');
    };

    const handleAddResource = (moduleId, type) => {
        const title = prompt('请输入资源名称:');
        if (!title) return;
        const newResource = { id: Date.now().toString(), type, title, duration: type === 'video' ? '10:00' : null, size: type !== 'video' ? '2MB' : null };
        const updatedCourse = { ...selectedCourse, modules: selectedCourse.modules.map(m => m.id === moduleId ? { ...m, resources: [...m.resources, newResource] } : m) };
        onUpdateCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
        setSelectedCourse(updatedCourse);
    };

    const handleDeleteResource = (moduleId, resourceId) => {
        if (!window.confirm('确定要删除吗？')) return;
        let updatedModules;
        if (resourceId === 'module_itself') updatedModules = selectedCourse.modules.filter(m => m.id !== moduleId);
        else updatedModules = selectedCourse.modules.map(m => m.id === moduleId ? { ...m, resources: m.resources.filter(r => r.id !== resourceId) } : m);
        const updatedCourse = { ...selectedCourse, modules: updatedModules };
        onUpdateCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
        setSelectedCourse(updatedCourse);
    };
    
    const handleDeleteCourse = (id) => {
        if(!window.confirm('确定删除整个课程？')) return;
        onUpdateCourses(courses.filter(c => c.id !== id));
        handleBack();
    };

    if (viewMode === 'list') {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-10">
                    <div><h2 className="text-3xl font-extrabold text-gray-900">教学课程</h2><p className="text-gray-500 mt-2">系统化的学习路径，助你掌握核心技能</p></div>
                    {isAdminOrMember && <Button onClick={handleCreateCourse}><Plus className="w-4 h-4" /> 创建课程</Button>}
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer" onClick={() => handleSelectCourse(course)}>
                            <div className="h-40 w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white"><BookOpen className="w-12 h-12 opacity-80" /></div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.level || '入门'}</span><span className="text-xs text-gray-400">{course.duration}</span></div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">{course.instructorName?.[0]}</div><span>{course.instructorName}</span></div><div className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students} 人学习</div></div>
                            </div>
                        </div>
                    ))}
                </div>
                {courses.length === 0 && <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">暂无课程，管理员可点击右上角创建。</div>}
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm mb-4"><ChevronLeft className="w-4 h-4" /> 返回课程列表</button>
                    {isEditing ? (
                        <div className="space-y-2">
                            <input className="w-full border p-2 rounded text-sm font-bold" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                            <textarea className="w-full border p-2 rounded text-xs" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                            <div className="flex gap-2"><Button size="sm" onClick={handleSaveCourseInfo}>保存</Button><Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>取消</Button></div>
                        </div>
                    ) : (
                        <div>
                             <h1 className="font-bold text-lg text-gray-900 leading-tight mb-2">{selectedCourse.title}</h1>
                             <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">讲师: {selectedCourse.instructorName}</div>
                                {isAdminOrMember && <div className="flex gap-2"><button onClick={() => { setIsEditing(true); setEditTitle(selectedCourse.title); setEditDesc(selectedCourse.description); }} className="text-xs text-blue-600 hover:underline">编辑信息</button><button onClick={() => handleDeleteCourse(selectedCourse.id)} className="text-xs text-red-600 hover:underline">删除</button></div>}
                             </div>
                        </div>
                    )}
                </div>
                <div className="p-4 space-y-6">
                    {(selectedCourse.modules||[]).map((module, idx) => (
                        <div key={module.id} className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                {module.title}
                                {isAdminOrMember && <button onClick={() => handleDeleteResource(module.id, 'module_itself')} className="text-red-400 hover:text-red-600" title="删除整章"><X className="w-3 h-3" /></button>}
                            </h4>
                            <div className="space-y-1">
                                {(module.resources||[]).map(res => (
                                    <div key={res.id} className="flex items-center gap-3 p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all group text-sm text-gray-700">
                                        <div className="text-gray-400">{res.type === 'video' && <Video className="w-4 h-4" />}{res.type === 'ppt' && <Monitor className="w-4 h-4" />}{res.type === 'pdf' && <FileText className="w-4 h-4" />}{res.type === 'quiz' && <Check className="w-4 h-4" />}</div>
                                        <div className="flex-1 truncate">{res.title}</div>
                                        <div className="text-xs text-gray-400">{res.duration || res.size}</div>
                                        {isAdminOrMember && <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(module.id, res.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><X className="w-3 h-3" /></button>}
                                    </div>
                                ))}
                                {isAdminOrMember && <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100"><button onClick={() => handleAddResource(module.id, 'video')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 视频</button><button onClick={() => handleAddResource(module.id, 'ppt')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 课件</button><button onClick={() => handleAddResource(module.id, 'pdf')} className="flex-1 py-1 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded hover:border-blue-400 hover:text-blue-500">+ 文档</button></div>}
                            </div>
                        </div>
                    ))}
                    {isAdminOrMember && <div className="pt-4 border-t border-gray-200"><div className="flex gap-2"><input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="新章节标题..." className="flex-1 text-xs border p-1.5 rounded" /><Button size="sm" onClick={handleAddModule} disabled={!newModuleTitle.trim()}>添加章节</Button></div></div>}
                </div>
            </div>
            <div className="flex-1 bg-white flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-64 flex items-center justify-center flex-col gap-4"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500"><Play className="w-8 h-8 fill-current" /></div><p>选择左侧资源开始学习</p></div>
                    <div className="text-left"><h2 className="text-xl font-bold text-gray-900 mb-2">课程简介</h2><p className="leading-relaxed">{selectedCourse.description}</p></div>
                </div>
            </div>
        </div>
    );
};

const ProfileView = ({ user, onUpdateUser, showNotification, tutorials = [], onNavigate }) => {
    const [formData, setFormData] = useState({ name: user.name || '', bio: user.bio || '', title: user.title || '', password: '', newPassword: '' });
    const [activeTab, setActiveTab] = useState('info');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const isGuest = user.role === 'guest';
    const avatarFileInputRef = useRef(null);
    const cardImageFileInputRef = useRef(null);

    const myPosts = tutorials.filter(t => t.authorId === user.id);
    const myLikes = tutorials.filter(t => t.likedBy?.includes(user.id));
    const tabs = [{ id: 'info', label: '个人资料' }, ...(user.role !== 'guest' ? [{ id: 'posts', label: `我的发布 (${myPosts.length})` }] : []), { id: 'likes', label: `我的收藏 (${myLikes.length})` }, { id: 'msgs', label: `消息提醒 (${(user.notifications || []).length})` }];

    const handleSave = () => {
        if (formData.newPassword && (formData.newPassword.length < 6 || !/[a-zA-Z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword))) { showNotification('新密码至少6位且包含字母和数字', 'error'); return; }
        const updates = { name: formData.name, bio: formData.bio, title: formData.title };
        if (formData.newPassword) updates.password = formData.newPassword;
        onUpdateUser(user.id, updates);
        showNotification('个人资料已更新', 'success');
        setFormData(prev => ({...prev, password: '', newPassword: ''}));
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 800 * 1024) { showNotification('图片大小不能超过 800KB', 'error'); return; }
            const reader = new FileReader();
            reader.onload = (ev) => { onUpdateUser(user.id, { [field]: ev.target.result }); if(field === 'avatar') setShowAvatarPicker(false); showNotification(field === 'avatar' ? '头像已更新' : '封面图已更新', 'success'); };
            reader.readAsDataURL(file);
        }
    };
    const handleRandomizeAvatar = () => { onUpdateUser(user.id, { avatar: Math.random().toString(36).substring(7) }); setShowAvatarPicker(false); showNotification('已生成新随机头像', 'success'); };
    const handleNavToTutorial = (id) => { if (onNavigate) onNavigate(id); };
    const handleClearNotifications = () => { onUpdateUser(user.id, { notifications: [] }); showNotification('通知已清空', 'success'); };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="relative mb-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible group">
                 <div className="h-56 w-full bg-gradient-to-r from-slate-50 to-gray-100 rounded-t-2xl relative overflow-hidden">
                     {user.cardImage ? <img src={user.cardImage} className="w-full h-full object-cover" alt="Cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div><ImageIcon className="w-16 h-16 opacity-50" /></div>}
                     {!isGuest && (<label className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-20" title="更换封面"><Camera className="w-5 h-5" /><input ref={cardImageFileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cardImage')} className="hidden" /></label>)}
                 </div>
                 <div className="px-8 pb-8 pt-2 flex flex-col-reverse md:flex-row gap-8 items-start">
                    <div className="flex-1 mt-4 md:mt-0 w-full">
                        <div className="flex flex-col gap-1 mb-4"><div className="flex items-center gap-3"><h2 className="text-3xl font-bold text-gray-900">{user.name}</h2><Badge role={user.role} /></div><p className="text-lg text-blue-600 font-medium">{user.title || (user.role === 'admin' ? 'Principal Investigator' : (user.role === 'guest' ? 'Visitor' : 'Researcher'))}</p></div>
                        <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-6 max-w-2xl">{user.bio || "暂无简介..."}</div>
                        <div className="flex flex-wrap gap-4"><div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Mail className="w-4 h-4" />{user.email}</div>{user.role !== 'guest' && (<div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FileText className="w-4 h-4" />{myPosts.length} 篇文章</div>)}</div>
                    </div>
                    <div className="relative -mt-24 md:-mt-32 shrink-0 self-center md:self-auto"><div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white bg-white shadow-lg flex items-center justify-center overflow-hidden relative z-10"><UserAvatar user={user} size="full" className="w-full h-full" /></div>{!isGuest && (<div onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white text-gray-700 p-2.5 rounded-full shadow-md cursor-pointer hover:text-blue-600 border border-gray-200 z-20 transition-transform hover:scale-105" title="修改头像"><Edit className="w-5 h-5" /></div>)}{showAvatarPicker && (<div className="absolute top-full right-0 mt-3 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 flex flex-col gap-2 animate-in fade-in zoom-in-95"><button onClick={handleRandomizeAvatar} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors w-full font-medium"><RefreshCw className="w-4 h-4 text-blue-500" /> 随机生成头像</button><div className="border-t border-gray-100 my-1"></div><label className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer w-full font-medium"><Upload className="w-4 h-4 text-green-600" /> 上传图片<input ref={avatarFileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} className="hidden" /></label></div>)}</div>
                 </div>
            </div>
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>))}</div>
            {activeTab === 'info' && (<div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6 max-w-2xl">{isGuest && (<div className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /><div><strong>访客模式限制</strong><p>作为访客，您无法修改个人资料或密码。请联系管理员申请正式账号。</p></div></div>)}<div><label className="block text-sm font-medium text-gray-700 mb-1">姓名</label><input disabled={isGuest} className={`w-full border p-2 rounded ${isGuest ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label><textarea disabled={isGuest} className={`w-full border p-2 rounded h-24 resize-none ${isGuest ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>{!isGuest && (<div className="pt-4 border-t border-gray-100"><h4 className="text-sm font-bold text-gray-900 mb-4">修改密码 (选填)</h4><div className="space-y-3"><input type="password" placeholder="新密码" className="w-full border p-2 rounded" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} /></div></div>)}{!isGuest && <div className="flex justify-end"><Button onClick={handleSave}><Check className="w-4 h-4" /> 保存修改</Button></div>}</div>)}
            {activeTab === 'posts' && (<div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">{myPosts.length > 0 ? myPosts.map(post => (<div key={post.id} onClick={() => handleNavToTutorial(post.id)} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 cursor-pointer transition-all group shadow-sm hover:shadow-md"><div className="flex justify-between items-start"><div><h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 mb-2 transition-colors">{post.title}</h4><div className="flex items-center gap-3 text-xs text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span><span>发布于 {new Date(post.lastModified || post.id/1).toLocaleDateString()}</span></div></div><div className="flex items-center gap-3 text-gray-400 text-sm"><span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> {post.likes || 0}</span><span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {post.comments?.length || 0}</span></div></div></div>)) : <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无发布内容</div>}</div>)}
            {activeTab === 'likes' && (<div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">{myLikes.length > 0 ? myLikes.map(post => (<div key={post.id} onClick={() => handleNavToTutorial(post.id)} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 cursor-pointer transition-all group shadow-sm hover:shadow-md"><div className="flex justify-between items-start"><div><h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 mb-2 transition-colors">{post.title}</h4><p className="text-xs text-gray-500 flex items-center gap-2"><User className="w-3 h-3" /> 作者: {post.authorName || 'Unknown'}</p></div><div className="text-pink-500 text-xs flex items-center gap-1.5 font-bold bg-pink-50 px-3 py-1 rounded-full"><ThumbsUp className="w-3.5 h-3.5 fill-current" /> 已收藏</div></div></div>)) : <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无收藏内容</div>}</div>)}
            {activeTab === 'msgs' && (<div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">{(user.notifications || []).length > 0 && (<div className="flex justify-end mb-2"><button onClick={handleClearNotifications} className="text-xs text-gray-500 hover:text-red-600 underline hover:bg-red-50 px-2 py-1 rounded transition-colors">清空所有通知</button></div>)}{(user.notifications || []).length === 0 && <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">暂无新消息</div>}{(user.notifications || []).map((notif) => (<div key={notif.id} className="bg-white p-4 rounded-xl border border-blue-100 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow"><div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Bell className="w-4 h-4" /></div><div className="flex-1"><p className="text-sm text-gray-800 font-medium leading-relaxed">{notif.content}</p><span className="text-xs text-gray-400 block mt-2">{notif.date}</span></div></div>))}<div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 items-start opacity-70"><div className="mt-1 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0"><Info className="w-4 h-4" /></div><div><p className="text-sm text-gray-700 font-medium">系统通知</p><p className="text-xs text-gray-500 mt-1 leading-relaxed">欢迎加入实验室！请完善您的个人资料，并查看新手指南。</p></div></div></div>)}
        </div>
    );
};

const TutorialLayout = ({ tutorials, selectedId, onSelect, user, onUpdate, onDelete, onCreate, isAdminOrMember, onRenameCategory, showNotification, onNotify }) => {
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

  useEffect(() => { if (selectedTutorial && !isEditing) { setEditTitle(selectedTutorial.title); setEditContent(selectedTutorial.content); setEditType(selectedTutorial.type); setEditCategory(selectedTutorial.category); setShowDeleteConfirm(false); setShowAiPanel(false); } }, [selectedTutorial, isEditing]);
  const handleCancel = () => { setIsEditing(false); if (isCreating && selectedTutorial) { onDelete(selectedTutorial.id); } setIsCreating(false); };
  const handleSave = () => { onUpdate({ ...selectedTutorial, title: editTitle, content: editContent, type: editType, category: editCategory, lastModified: new Date().toISOString(), }); setIsEditing(false); setIsCreating(false); showNotification('保存成功', 'success'); };
  const handleCreate = () => { const newId = Date.now().toString(); const newTutorial = { id: newId, title: '新文档', category: '未分类', content: '# 新文档\n开始编写...', type: 'markdown', authorId: user?.id, authorName: user?.name, likes: 0, likedBy: [], comments: [] }; onUpdate(newTutorial, true); onSelect(newId); setEditTitle(newTutorial.title); setEditContent(newTutorial.content); setEditType(newTutorial.type); setEditCategory(newTutorial.category); setIsEditing(true); setIsCreating(true); };
  const handleUniversalUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { const content = ev.target.result; if(!editContent || editContent.startsWith('# 新') || window.confirm('覆盖当前内容？')) { setEditContent(content); showNotification('导入成功', 'success'); } }; reader.readAsText(file); } };
  const handleAiGenerate = async () => { if (!aiPrompt.trim()) return; setIsAiLoading(true); try { const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: aiPrompt }] }] }) }); const text = response.candidates?.[0]?.content?.parts?.[0]?.text; if (text) { setEditContent(prev => prev + "\n\n" + text); setAiPrompt(''); setShowAiPanel(false); showNotification('AI 内容生成成功', 'success'); } } catch (e) { showNotification('AI 生成失败', 'error'); } finally { setIsAiLoading(false); } };
  const startRenameCat = (cat) => { setEditingCat(cat); setNewCatName(cat); };
  const submitRenameCat = () => { if (newCatName && newCatName !== editingCat) { onRenameCategory(editingCat, newCatName); showNotification('分类重命名成功', 'success'); } setEditingCat(null); };
  const handleLike = () => { const likedBy = selectedTutorial.likedBy || []; const hasLiked = likedBy.includes(user.id); const newLikedBy = hasLiked ? likedBy.filter(id => id !== user.id) : [...likedBy, user.id]; onUpdate({ ...selectedTutorial, likes: newLikedBy.length, likedBy: newLikedBy }); };
  let notebookStats = null; if (editType === 'ipynb' && editContent) { try { const data = JSON.parse(editContent); notebookStats = { cells: data.cells?.length || 0, size: (editContent.length / 1024).toFixed(1) + ' KB' }; } catch(e) {} }
  
  // [Fix] Handle undefined/loading state to prevent crash
  if (selectedId && !selectedTutorial && !isCreating) return <div className="flex h-[calc(100vh-64px)] items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  if(!selectedTutorial && !isCreating) return <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white"><div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-y-auto hidden md:flex shrink-0"><div className="p-4"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="搜索文档..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex-1 overflow-y-auto px-2 space-y-1">{tutorials.map(t=><button key={t.id} onClick={()=>onSelect(t.id)} className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group text-gray-600 hover:bg-gray-100"><span className="truncate">{t.title}</span></button>)}</div>{isAdminOrMember && <div className="p-4 border-t border-gray-200"><Button variant="primary" className="w-full text-sm" onClick={handleCreate}><Plus className="w-4 h-4" /> 新建教程</Button></div>}</div><div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4"><BookOpen className="w-16 h-16 opacity-20" /><p>请从左侧选择一个文档查看</p></div></div>;

  // Safe fallback for render values
  const displayTitle = selectedTutorial ? selectedTutorial.title : editTitle;
  const displayCategory = selectedTutorial ? selectedTutorial.category : editCategory;
  const displayAuthor = selectedTutorial ? selectedTutorial.authorName : user?.name;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-y-auto hidden md:flex shrink-0">
        <div className="p-4"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="搜索文档..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
        <div className="flex-1 overflow-y-auto px-2">{categories.map(cat => (<div key={cat} className="mb-4"><div className="px-3 mb-2 flex items-center justify-between group">{editingCat === cat ? (<input autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onBlur={submitRenameCat} onKeyDown={(e) => e.key === 'Enter' && submitRenameCat()} className="text-xs font-bold text-gray-700 bg-white border border-blue-300 rounded px-1 w-full" />) : (<><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat}</h3>{isAdminOrMember && (<button onClick={() => startRenameCat(cat)} className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-3 h-3" /></button>)}</>)}</div><div className="space-y-0.5">{sortedTutorials.filter(t => t.category === cat).map(t => (<button key={t.id} onClick={() => { onSelect(t.id); setIsEditing(false); setIsCreating(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group ${selectedId === t.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><span className="truncate">{t.title}</span>{t.type === 'ipynb' && <Code className="w-3 h-3 text-orange-400 flex-shrink-0" />}</button>))}</div></div>))}</div>
        {isAdminOrMember && (<div className="p-4 border-t border-gray-200"><Button variant="primary" className="w-full text-sm" onClick={handleCreate}><Plus className="w-4 h-4" /> 新建教程</Button></div>)}
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white shrink-0">
             <div className="flex items-center gap-2 text-sm text-gray-500"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{displayCategory}</span><ChevronRight className="w-4 h-4" /><span className="font-medium text-gray-900 truncate max-w-xs">{displayTitle}</span>{displayAuthor && (<span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded ml-2 border border-blue-100">By {displayAuthor}</span>)}</div>
             {canManageCurrent && (<div className="flex gap-2">{isEditing ? (<><Button variant="secondary" size="sm" onClick={handleCancel}>取消</Button><Button variant="primary" size="sm" onClick={handleSave}><Check className="w-4 h-4" /> 保存</Button></>) : (<><Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4" /> 编辑</Button>{showDeleteConfirm ? (<div className="flex items-center gap-2 bg-red-50 px-2 rounded border border-red-100 animation-fadeIn"><span className="text-xs text-red-600 font-bold">确定删除?</span><button onClick={() => { onDelete(selectedTutorial.id); setShowDeleteConfirm(false); }} className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 bg-white rounded border border-red-200">是</button><button onClick={() => setShowDeleteConfirm(false)} className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1">否</button></div>) : (<Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}><Trash className="w-4 h-4" /></Button>)}</>)}</div>)}
          </div>
          {isEditing ? (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white grid grid-cols-2 gap-4"><input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="文档标题" className="border p-2 rounded text-sm font-bold"/><input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="分类" className="border p-2 rounded text-sm"/><div className="col-span-2 flex flex-wrap items-center gap-3 text-sm mt-2"><Button variant={editType === 'markdown' ? 'primary' : 'secondary'} size="sm" onClick={() => setEditType('markdown')} className="text-xs"><FileText className="w-3.5 h-3.5" /> 撰写</Button><div className="relative"><Button variant="secondary" size="sm" onClick={() => universalInputRef.current?.click()} className="text-xs"><Plus className="w-3.5 h-3.5" /> 导入</Button><input ref={universalInputRef} type="file" accept=".md,.ipynb" onChange={handleUniversalUpload} className="hidden" /></div><Button variant={showAiPanel ? 'ai' : 'secondary'} size="sm" onClick={() => setShowAiPanel(!showAiPanel)} className="text-xs"><User className="w-3.5 h-3.5" /> AI 辅助</Button></div></div>
                {showAiPanel && (<div className="bg-purple-50 p-4 border-b border-purple-100 animate-in slide-in-from-top-2 duration-200"><label className="block text-xs font-bold text-purple-800 mb-2 flex items-center gap-1"><User className="w-3 h-3" /> 智能生成内容</label><div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="描述你想写的内容..." className="flex-1 border border-purple-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}/><Button variant="ai" size="sm" onClick={handleAiGenerate} disabled={isAiLoading || !aiPrompt.trim()}>{isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '生成'}</Button></div></div>)}
                {editType === 'markdown' ? (<textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm bg-gray-50 text-gray-800" placeholder="# 请在此输入 Markdown 内容..."/>) : (<div className="flex-1 flex flex-col bg-gray-50 p-6 overflow-y-auto">{notebookStats ? (<div className="flex flex-col items-center justify-center h-full space-y-4"><FileText className="w-16 h-16 text-green-500" /><div className="text-center"><h3 className="text-lg font-bold text-gray-900">Notebook 已加载</h3><p className="text-sm text-gray-500">包含 {notebookStats.cells} 个单元格 • 大小 {notebookStats.size}</p></div></div>) : (<div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-300 rounded-lg m-4"><Plus className="w-12 h-12 mb-4 text-gray-300" /><p className="mb-2 font-medium text-gray-600">导入 .ipynb 文件</p></div>)}</div>)}
              </div>
              <div className="w-1/2 overflow-y-auto bg-white p-8 border-l border-gray-100"><div className="uppercase tracking-wide text-xs font-bold text-gray-400 mb-4 flex items-center gap-2"><Search className="w-3 h-3" /> 实时预览</div>{editType === 'markdown' ? <MarkdownRenderer content={editContent} /> : <IpynbRenderer content={editContent} />}</div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-white px-8 py-10 max-w-5xl mx-auto w-full pb-32">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{selectedTutorial.title}</h1>
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100"><button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTutorial.likedBy?.includes(user.id) ? 'bg-pink-100 text-pink-600 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Plus className={`w-4 h-4 ${selectedTutorial.likedBy?.includes(user.id) ? 'fill-current' : ''}`} />{selectedTutorial.likes || 0} 点赞</button><span className="text-xs text-gray-400">更新于 {new Date(selectedTutorial.lastModified || Date.now()).toLocaleDateString()}</span></div>
              {selectedTutorial.type === 'ipynb' ? <IpynbRenderer content={selectedTutorial.content} /> : <MarkdownRenderer content={selectedTutorial.content} />}
              <div className="grid grid-cols-2 gap-4 mt-16 pt-8 border-t border-gray-100">{prevTutorial ? (<button onClick={() => onSelect(prevTutorial.id)} className="group flex flex-col items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"><span className="text-xs text-gray-400 mb-1 flex items-center gap-1 group-hover:text-blue-500"><ChevronLeft className="w-3 h-3" /> 上一篇</span><span className="font-bold text-gray-800 group-hover:text-blue-700 line-clamp-1">{prevTutorial.title}</span></button>) : <div className="p-4"></div>}{nextTutorial ? (<button onClick={() => onSelect(nextTutorial.id)} className="group flex flex-col items-end p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-right"><span className="text-xs text-gray-400 mb-1 flex items-center gap-1 group-hover:text-blue-500">下一篇 <ChevronRight className="w-3 h-3" /></span><span className="font-bold text-gray-800 group-hover:text-blue-700 line-clamp-1">{nextTutorial.title}</span></button>) : <div className="p-4"></div>}</div>
              <CommentSection tutorial={selectedTutorial} onUpdate={onUpdate} user={user} isAdmin={isAdmin} onNotify={onNotify} />
            </div>
          )}
      </div>
    </div>
  );
};

const LoginView = ({ onLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const submit = (e) => { e.preventDefault(); isLogin ? onLogin(email, password) : onRegister(name, email, password, code); };
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md p-8 relative">
                <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? '成员登录' : '申请加入课题组'}</h2>
                <form onSubmit={submit} className="space-y-4">
                    {!isLogin && <div><label className="block text-sm font-medium text-gray-700">姓名</label><input required className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} /></div>}
                    <div><label className="block text-sm font-medium text-gray-700">邮箱</label><input type="email" required className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">密码</label><input type="password" required className="w-full border p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} /></div>
                    {!isLogin && <div><label className="block text-sm font-medium text-gray-700">邀请码 (选填)</label><input className="w-full border p-2 rounded" value={code} onChange={e=>setCode(e.target.value)} placeholder="LAB2025" /></div>}
                    <Button className="w-full mt-6">{isLogin ? '登录' : '注册并登录'}</Button>
                </form>
                <div className="mt-4 text-center text-sm"><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">{isLogin ? '没有账号？申请加入' : '已有账号？登录'}</button></div>
            </Card>
        </div>
    );
};

const AdminPanel = ({ users, onDeleteUser }) => (
    <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-bold text-gray-900">管理控制台</h2><p className="text-gray-500">管理成员权限与系统设置</p></div><Lock className="w-10 h-10 text-blue-600 opacity-20" /></div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">用户列表</h3></div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(u=>(<tr key={u.id}><td className="px-6 py-4 whitespace-nowrap flex items-center gap-3"><UserAvatar user={u} size="sm" /><div className="text-sm font-medium text-gray-900">{u.name}<div className="text-xs text-gray-500 font-normal">{u.email}</div></div></td><td className="px-6 py-4 whitespace-nowrap"><Badge role={u.role}/></td><td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={()=>onDeleteUser(u.id)} className="text-red-600 hover:text-red-900 text-sm font-bold">删除</button></td></tr>))}
                </tbody>
            </table>
        </div>
    </div>
);

// ==========================================
// 7. MAIN APP (Firebase Integrated)
// ==========================================
const App = () => {
    // Local State (mirrors DB data)
    const [users, setUsers] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
    const [registrationCode, setRegistrationCode] = useState(DEFAULT_CODE);
    
    // UI State
    const [notification, setNotification] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [selectedTutorialId, setSelectedTutorialId] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 1. Auth Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, wait for 'users' listener to populate data
                // We rely on the real-time listener below to set 'users' state
                // The effect dependent on [users, auth.currentUser] will set currentUser
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- 2. Real-time Data Sync (Firestore) ---
    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const list = snap.docs.map(d => d.data());
            setUsers(list);
        });
        const unsubTutorials = onSnapshot(collection(db, "tutorials"), (snap) => {
            const list = snap.docs.map(d => d.data());
            setTutorials(list);
        });
        const unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
            const list = snap.docs.map(d => d.data());
            setCourses(list);
        });
        const unsubNews = onSnapshot(collection(db, "news"), (snap) => {
            const list = snap.docs.map(d => d.data());
            setNews(list);
        });

        return () => {
            unsubUsers();
            unsubTutorials();
            unsubCourses();
            unsubNews();
        };
    }, []);

    // --- 3. Sync Current User State ---
    useEffect(() => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser && users.length > 0) {
            const dbUser = users.find(u => u.id === firebaseUser.uid);
            if (dbUser) {
                setCurrentUser(dbUser);
            }
        }
    }, [users, auth.currentUser]);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // --- 4. Action Handlers (Firebase) ---

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showNotification('登录成功', 'success');
            setCurrentView('home');
        } catch (error) {
            console.error(error);
            showNotification('登录失败：' + error.message, 'error');
        }
    };

    const handleRegister = async (name, email, password, code) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            
            let role = 'guest';
            const hasAdmin = users.some(u => u.role === 'admin');
            if (users.length === 0 || !hasAdmin) role = 'admin';
            else role = code === DEFAULT_CODE ? 'member' : 'guest';

            const randomAvatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
            
            const newUser = {
                id: uid,
                name,
                email,
                role,
                bio: '新加入成员',
                avatar: randomAvatar,
                notifications: []
            };

            await setDoc(doc(db, "users", uid), newUser);

            showNotification('注册成功！', 'success');
            setCurrentView('home');
        } catch (error) {
            console.error(error);
            showNotification('注册失败：' + error.message, 'error');
        }
    };

    const hasAccess = (section) => {
        if (!currentUser) return false;
        if (['admin', 'member', 'alumni'].includes(currentUser.role)) return true;
        if (currentUser.role === 'guest' && currentUser.tempAccessUntil && new Date(currentUser.tempAccessUntil) > new Date()) return true;
        return false;
    };
    const isAdmin = currentUser?.role === 'admin';

    const handleUpdateUser = async (id, data) => {
        try {
            await updateDoc(doc(db, "users", id), data);
            showNotification('更新成功', 'success');
        } catch (error) {
            showNotification('更新失败', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if(window.confirm('确定删除用户？')) {
             try {
                 await deleteDoc(doc(db, "users", id));
                 showNotification('用户资料已删除', 'success');
             } catch (error) {
                 showNotification('删除失败', 'error');
             }
        }
    };

    const handleUpdateTutorial = async (item, isCreate = false) => {
        try {
            await setDoc(doc(db, "tutorials", item.id), item);
            if (isCreate) setSelectedTutorialId(item.id);
            showNotification('保存成功', 'success');
        } catch (error) {
            console.error(error);
            showNotification('保存失败', 'error');
        }
    };

    const handleDeleteTutorial = async (id) => {
        if(window.confirm('确定删除？')) {
            try {
                await deleteDoc(doc(db, "tutorials", id));
                if (selectedTutorialId === id) setSelectedTutorialId(null);
                showNotification('删除成功', 'success');
            } catch (error) {
                showNotification('删除失败', 'error');
            }
        }
    };

    const handleUpdateCourses = async (newCoursesList) => {
        try {
            for (const course of newCoursesList) {
                await setDoc(doc(db, "courses", course.id), course);
            }
            const newIds = new Set(newCoursesList.map(c => c.id));
            const itemsToDelete = courses.filter(c => !newIds.has(c.id));
            for (const course of itemsToDelete) {
                await deleteDoc(doc(db, "courses", course.id));
            }
        } catch (error) {
            console.error(error);
            showNotification('更新失败', 'error');
        }
    };

    const handleNotify = async (targetUserId, content) => {
        const targetUser = users.find(u => u.id === targetUserId);
        if (targetUser) {
             const newNotification = {
                id: Date.now().toString(),
                content,
                date: new Date().toLocaleDateString(),
                read: false
             };
             const updatedNotifications = [newNotification, ...(targetUser.notifications || [])];
             await updateDoc(doc(db, "users", targetUserId), { notifications: updatedNotifications });
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
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
                    <button onClick={() => { 
                        signOut(auth); 
                        setCurrentView('home'); 
                    }} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
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
                onUpdate={handleUpdateTutorial} 
                onDelete={handleDeleteTutorial} 
                onCreate={() => {
                     // Custom create logic because TutorialLayout expects onCreate to be passed
                     const newId = Date.now().toString();
                     const newTutorial = { id: newId, title: '新文档', category: '未分类', content: '# 新文档\n开始编写...', type: 'markdown', authorId: currentUser.id, authorName: currentUser.name, likes: 0, likedBy: [], comments: [] };
                     handleUpdateTutorial(newTutorial, true);
                }}
                isAdminOrMember={['admin', 'member'].includes(currentUser?.role)}
                onRenameCategory={() => {}} 
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
                onUpdateCourses={handleUpdateCourses}
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
          {currentView === 'admin' && isAdmin && <AdminPanel users={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} registrationCode={registrationCode} onUpdateCode={setRegistrationCode} currentUser={currentUser} onNotify={handleNotify} />}
          {currentView === 'login' && <LoginView onLogin={handleLogin} onRegister={handleRegister} users={users} />}
          {currentView === 'profile' && <ProfileView user={currentUser} onUpdateUser={handleUpdateUser} showNotification={showNotification} tutorials={tutorials} onNavigate={(id) => { setSelectedTutorialId(id); setCurrentView('tutorials'); }} />}
          {(currentView === 'news') && <div className="max-w-4xl mx-auto px-4 py-12 text-center"><div className="bg-blue-50 p-12 rounded-2xl"><h2 className="text-2xl font-bold text-blue-900 mb-4">新闻动态建设中</h2><p className="text-blue-700">更多新闻即将上线。</p></div></div>}
        </main>
      </div>
    );
  };
  
  export default App;
