"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  ChevronRight, 
  Plus, 
  Activity, 
  Target, 
  Search,
  X,
  Zap,
  ArrowRight,
  Database,
  Globe,
  Shield,
  Cpu,
  Loader2,
  CheckCircle2, Check,
  Circle,
  Clock,
  BarChart3,
  Layers,
  Lock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "@/services/placementos-api";
import { useAuth } from "@clerk/clerk-react";

const PLACEMENT_CURRICULUM: Record<string, { title: string; questions: number }[]> = {
  "operating systems": [
    { title: "Processes & Threads", questions: 14 },
    { title: "CPU Scheduling Algorithms", questions: 12 },
    { title: "Inter-Process Communication", questions: 9 },
    { title: "Memory Management & Paging", questions: 13 },
    { title: "Virtual Memory & Page Replacement", questions: 11 },
    { title: "File Systems & I/O", questions: 10 },
    { title: "Deadlocks - Detection & Avoidance", questions: 10 },
    { title: "Synchronization & Semaphores", questions: 11 },
  ],
  "database systems": [
    { title: "ER Diagrams & Relational Schema", questions: 10 },
    { title: "Normalization (1NF, 2NF, 3NF, BCNF)", questions: 15 },
    { title: "SQL - Joins, Aggregates, Subqueries", questions: 20 },
    { title: "Transactions & ACID Properties", questions: 12 },
    { title: "Concurrency Control & Locking", questions: 10 },
    { title: "Indexing, B-Trees & Hashing", questions: 11 },
    { title: "Query Optimization & Execution Plans", questions: 9 },
    { title: "NoSQL - MongoDB, Redis Basics", questions: 8 },
  ],
  "dbms": [
    { title: "ER Diagrams & Relational Schema", questions: 10 },
    { title: "Normalization (1NF, 2NF, 3NF, BCNF)", questions: 15 },
    { title: "SQL - Joins, Aggregates, Subqueries", questions: 20 },
    { title: "Transactions & ACID Properties", questions: 12 },
    { title: "Concurrency Control & Locking", questions: 10 },
    { title: "Indexing, B-Trees & Hashing", questions: 11 },
    { title: "Query Optimization", questions: 9 },
    { title: "NoSQL Basics", questions: 8 },
  ],
  "computer networks": [
    { title: "OSI & TCP/IP Model - All Layers", questions: 14 },
    { title: "IP Addressing & Subnetting (CIDR)", questions: 13 },
    { title: "Routing - OSPF, BGP, RIP", questions: 10 },
    { title: "TCP vs UDP - Flow & Congestion Control", questions: 12 },
    { title: "DNS, DHCP & ARP", questions: 9 },
    { title: "HTTP/HTTPS, REST & WebSockets", questions: 10 },
    { title: "Network Security - TLS, Firewalls", questions: 9 },
    { title: "CDN & Load Balancing", questions: 8 },
  ],
  "system design": [
    { title: "Scalability - Horizontal vs Vertical", questions: 10 },
    { title: "Load Balancers & Reverse Proxies", questions: 10 },
    { title: "Databases at Scale - Sharding & Replication", questions: 12 },
    { title: "Caching - Redis, Memcached, CDN", questions: 11 },
    { title: "Message Queues - Kafka, RabbitMQ", questions: 9 },
    { title: "Rate Limiting & API Gateway", questions: 8 },
    { title: "Microservices vs Monolith", questions: 8 },
    { title: "Case Studies - URL Shortener, Twitter, Netflix", questions: 15 },
  ],
  "object oriented programming": [
    { title: "Classes, Objects & Encapsulation", questions: 10 },
    { title: "Inheritance & Polymorphism", questions: 12 },
    { title: "Abstraction & Interfaces", questions: 9 },
    { title: "SOLID Principles", questions: 11 },
    { title: "Design Patterns - Creational", questions: 10 },
    { title: "Design Patterns - Structural & Behavioral", questions: 10 },
    { title: "Exception Handling & Generics", questions: 8 },
    { title: "Memory Management & GC", questions: 8 },
  ],
  "oop": [
    { title: "Classes, Objects & Encapsulation", questions: 10 },
    { title: "Inheritance & Polymorphism", questions: 12 },
    { title: "Abstraction & Interfaces", questions: 9 },
    { title: "SOLID Principles", questions: 11 },
    { title: "Design Patterns - Creational", questions: 10 },
    { title: "Design Patterns - Structural & Behavioral", questions: 10 },
  ],
  "algorithms": [
    { title: "Time & Space Complexity (Big-O)", questions: 12 },
    { title: "Sorting - QuickSort, MergeSort, HeapSort", questions: 14 },
    { title: "Searching - Binary Search Variants", questions: 12 },
    { title: "Divide & Conquer", questions: 10 },
    { title: "Greedy Algorithms", questions: 11 },
    { title: "Dynamic Programming - 1D & 2D", questions: 18 },
    { title: "Graph Algorithms - BFS, DFS, Dijkstra", questions: 14 },
    { title: "Backtracking", questions: 10 },
  ],
  "data structures": [
    { title: "Arrays & Strings", questions: 14 },
    { title: "Linked Lists - Singly & Doubly", questions: 12 },
    { title: "Stacks & Queues", questions: 10 },
    { title: "Trees - BST, AVL, Segment Tree", questions: 14 },
    { title: "Heaps & Priority Queues", questions: 10 },
    { title: "Hashing & Hash Maps", questions: 11 },
    { title: "Graphs - Representations & Traversals", questions: 13 },
    { title: "Tries & Advanced Structures", questions: 9 },
  ],
  "compiler design": [
    { title: "Phases of a Compiler", questions: 9 },
    { title: "Lexical Analysis & Regular Expressions", questions: 11 },
    { title: "Parsing – LL, LR, LALR", questions: 13 },
    { title: "Syntax-Directed Translation", questions: 10 },
    { title: "Semantic Analysis & Symbol Tables", questions: 9 },
    { title: "Intermediate Code Generation", questions: 8 },
    { title: "Code Optimization Techniques", questions: 9 },
    { title: "Code Generation & Register Allocation", questions: 8 },
  ],
  "theory of computation": [
    { title: "DFA & NFA - Construction & Conversion", questions: 12 },
    { title: "Regular Expressions & Languages", questions: 11 },
    { title: "Context-Free Grammars", questions: 11 },
    { title: "Pushdown Automata (PDA)", questions: 9 },
    { title: "Turing Machines", questions: 10 },
    { title: "Decidability & Undecidability", questions: 10 },
    { title: "Complexity Classes - P, NP, NP-Hard", questions: 11 },
  ],
  "computer architecture": [
    { title: "Number Systems & Boolean Algebra", questions: 11 },
    { title: "Combinational Circuits", questions: 10 },
    { title: "Sequential Circuits & Flip-Flops", questions: 10 },
    { title: "CPU Design & Instruction Set", questions: 12 },
    { title: "Pipelining & Hazards", questions: 13 },
    { title: "Memory Hierarchy - Cache, RAM, Disk", questions: 12 },
    { title: "I/O & Interrupt Handling", questions: 8 },
  ],
  "software engineering": [
    { title: "SDLC Models - Agile, Waterfall, Scrum", questions: 10 },
    { title: "Requirements Engineering", questions: 8 },
    { title: "UML Diagrams", questions: 10 },
    { title: "Design Patterns", questions: 12 },
    { title: "Testing – Unit, Integration, E2E", questions: 11 },
    { title: "Version Control - Git Internals", questions: 8 },
    { title: "DevOps & CI/CD Basics", questions: 9 },
    { title: "REST API Design Best Practices", questions: 9 },
  ],
  "discrete mathematics": [
    { title: "Set Theory & Relations", questions: 10 },
    { title: "Propositional & Predicate Logic", questions: 12 },
    { title: "Combinatorics - Permutations & Combinations", questions: 12 },
    { title: "Graph Theory - Basics & Theorems", questions: 13 },
    { title: "Trees & Spanning Trees", questions: 10 },
    { title: "Probability Fundamentals", questions: 10 },
    { title: "Number Theory & Modular Arithmetic", questions: 9 },
  ],
  "machine learning": [
    { title: "Linear & Logistic Regression", questions: 11 },
    { title: "Decision Trees & Random Forests", questions: 11 },
    { title: "SVM & Kernel Trick", questions: 9 },
    { title: "Clustering – K-Means, DBSCAN", questions: 9 },
    { title: "Neural Networks & Backprop", questions: 13 },
    { title: "CNN & RNN Architectures", questions: 10 },
    { title: "Model Evaluation – Bias, Variance, Metrics", questions: 10 },
    { title: "Feature Engineering & Regularization", questions: 9 },
  ],
  "deep learning": [
    { title: "Perceptron & Multi-Layer Networks", questions: 10 },
    { title: "Backpropagation & Optimizers", questions: 12 },
    { title: "Convolutional Neural Networks", questions: 12 },
    { title: "Recurrent Networks & LSTMs", questions: 11 },
    { title: "Attention & Transformers", questions: 12 },
    { title: "Transfer Learning & Fine-Tuning", questions: 9 },
    { title: "Regularization - Dropout, BatchNorm", questions: 8 },
  ],
  "cryptography": [
    { title: "Symmetric Encryption - AES, DES", questions: 10 },
    { title: "Asymmetric - RSA, ECC", questions: 11 },
    { title: "Hashing - SHA, MD5, bcrypt", questions: 10 },
    { title: "Digital Signatures & Certificates", questions: 9 },
    { title: "TLS/SSL Handshake", questions: 9 },
    { title: "Key Exchange - Diffie-Hellman", questions: 8 },
    { title: "Common Attacks & Defenses", questions: 10 },
  ],
  "web development": [
    { title: "HTML5 & Semantic Markup", questions: 8 },
    { title: "CSS - Flexbox, Grid & Responsive Design", questions: 10 },
    { title: "JavaScript - ES6+, Closures, Promises", questions: 14 },
    { title: "React - Hooks, State & Lifecycle", questions: 13 },
    { title: "REST vs GraphQL APIs", questions: 10 },
    { title: "Authentication - JWT & OAuth", questions: 10 },
    { title: "Performance - Caching, Lazy Loading", questions: 9 },
    { title: "Web Security - XSS, CSRF, CORS", questions: 9 },
  ],
  "cloud computing": [
    { title: "Cloud Service Models - IaaS, PaaS, SaaS", questions: 9 },
    { title: "AWS Core Services – EC2, S3, RDS", questions: 12 },
    { title: "Containerization – Docker & Kubernetes", questions: 12 },
    { title: "Serverless Architecture", questions: 9 },
    { title: "CI/CD Pipelines", questions: 9 },
    { title: "Cloud Security & IAM", questions: 9 },
    { title: "Monitoring & Observability", questions: 8 },
  ],
  "linux": [
    { title: "File System & Directory Structure", questions: 9 },
    { title: "Shell Scripting & Bash", questions: 12 },
    { title: "Process Management", questions: 10 },
    { title: "Permissions & User Management", questions: 9 },
    { title: "Networking Commands", questions: 9 },
    { title: "Package Management & Cron", questions: 7 },
    { title: "System Monitoring Tools", questions: 7 },
  ],
};

function getPlacementCurriculum(subject: string): { title: string; questions: number; done: boolean }[] {
  const key = subject.toLowerCase().trim();
  if (PLACEMENT_CURRICULUM[key]) {
    return PLACEMENT_CURRICULUM[key].map(c => ({ ...c, done: false }));
  }
  const fuzzyKey = Object.keys(PLACEMENT_CURRICULUM).find(
    k => key.includes(k) || k.includes(key) || key.split(" ").some(w => k.includes(w) && w.length > 3)
  );
  if (fuzzyKey) {
    return PLACEMENT_CURRICULUM[fuzzyKey].map(c => ({ ...c, done: false }));
  }
  return [
    { title: "Fundamentals & Core Theory", questions: 12, done: false },
    { title: "Important Algorithms & Techniques", questions: 14, done: false },
    { title: "Commonly Asked Interview Topics", questions: 12, done: false },
    { title: "Problem Solving Patterns", questions: 10, done: false },
    { title: "Advanced Concepts", questions: 10, done: false },
    { title: "Previous Year Questions", questions: 15, done: false },
  ];
}

export default function SubjectsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoaded, userId, getToken } = useAuth();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const data = await getSubjects(token || undefined);
      setSubjects(data);
      if (data.length > 0 && !selected) setSelected(data[0].id);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchHistory();
    }
  }, [isLoaded, userId]);
  
  const selectedSubject = subjects.find(s => s.id === selected);
  const totalProgress = subjects.length > 0 ? Math.round(subjects.reduce((a, s) => a + (s.progress || 0), 0) / subjects.length) : 0;
  const totalDone = subjects.flatMap(s => s.chapters || []).filter(c => c.done).length;
  const totalChapters = subjects.flatMap(s => s.chapters || []).length;

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setIsAnalyzing(true);
    try {
      const token = await getToken();
      const curriculum = getPlacementCurriculum(newSubject);
      const res = await createSubject({
        title: newSubject.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        chapters: curriculum
      }, token || undefined);
      setSubjects(prev => [...prev, res]);
      setSelected(res.id);
      setNewSubject("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add subject:", err);
      alert("Creation failed. Please check if the backend is running.");
      setIsAdding(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleChapter = async (subjectId: string, chapterIdx: number) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;

    const updatedChapters = sub.chapters.map((c: any, i: number) =>
      i === chapterIdx ? { ...c, done: !c.done } : c
    );
    
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, chapters: updatedChapters } : s));
    
    try {
      await updateSubject(subjectId, { chapters: updatedChapters });
    } catch (err) {
      fetchHistory();
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const token = await getToken();
      setSubjects(prev => prev.filter(s => s.id !== id));
      if (selected === id) setSelected(null);
      await deleteSubject(id, token || undefined);
    } catch (err) {
      fetchHistory();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden vibe-midnight relative">
      {/* Ethereal Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-8 py-6 border-b border-white/[0.03] flex items-center justify-between relative z-10"
        style={{ background: "rgba(10,10,18,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_100%)] animate-pulse" />
                 <BookOpen className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400/60">Grand Archive</p>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic pr-10 pb-2">
                 The <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 pr-2">Library</span>
              </h1>
            </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex gap-4">
               {[
                { label:"Mastery", value:`${totalProgress}%`, color:"#818cf8" },
                { label:"Archives", value:`${totalDone}/${totalChapters}`, color:"#fff" },
              ].map(s => (
                <div key={s.label} className="vibe-card !px-5 !py-2.5 bg-white/[0.01]">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mb-0.5">{s.label}</p>
                   <p className="text-xl font-black italic" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
           </div>
            <button onClick={() => setIsAdding(true)}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_15px_40px_rgba(79,70,229,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> EXPAND ARCHIVE
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Navigation Sidebar */}
        <div className="w-96 shrink-0 border-r border-white/[0.03] bg-black/30 flex flex-col p-8 gap-4 overflow-y-auto custom-scrollbar">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 mb-4 px-4">Subject Registry</p>
           {subjects.map(subject => {
             const isActive = selected === subject.id;
             return (
               <div key={subject.id} onClick={() => setSelected(subject.id)}
                 className={cn("vibe-card !p-6 w-full text-left transition-all group flex flex-col gap-6 relative overflow-hidden cursor-pointer",
                   isActive ? "border-indigo-600/40 bg-indigo-600/[0.03] shadow-[0_0_30px_rgba(79,70,229,0.05)]" : "bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.02]"
                 )}>
                  {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] rounded-full" />}
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                         isActive ? "bg-indigo-600/10 border-indigo-600/20 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]" : "bg-white/[0.02] border-white/[0.05] text-slate-700"
                       )}>
                          <BookOpen className="w-6 h-6" />
                       </div>
                       <div>
                          <p className={cn("text-[13px] font-black uppercase tracking-tight", isActive ? "text-white" : "text-slate-500 group-hover:text-white/60")}>{subject.title}</p>
                          <p className="text-[9px] font-bold text-slate-800 uppercase tracking-widest mt-0.5">{subject.chapters.length} Protocols</p>
                       </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/10 rounded-lg">
                       <X className="w-4 h-4 text-rose-500/40 hover:text-rose-500" />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">Mastery Index</span>
                        <span className={cn("text-sm font-black italic", isActive ? "text-indigo-400" : "text-slate-700")}>{subject.progress}%</span>
                     </div>
                     <div className="h-1 rounded-full bg-white/[0.02] overflow-hidden border border-white/[0.03]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${subject.progress}%` }} transition={{ duration:1 }}
                          className={cn("h-full", isActive ? "bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "bg-slate-800")} />
                     </div>
                  </div>
               </div>
             );
           })}
        </div>

        {/* Content Portal */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-black/10">
          <AnimatePresence mode="wait">
            {selectedSubject ? (
              <motion.div key={selectedSubject.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="max-w-5xl mx-auto space-y-12">
                 
                 {/* Portal Header */}
                 <div className="flex items-start justify-between">
                    <div className="space-y-6 flex-1">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-8 bg-indigo-500" />
                          <div>
                             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Subject Dossier</p>
                             <h2 className="text-6xl font-black uppercase tracking-tighter text-white italic">{selectedSubject.title}</h2>
                          </div>
                       </div>
                       <p className="text-[13px] font-bold text-slate-500 leading-relaxed max-w-2xl italic">
                          Comprehensive analysis of {selectedSubject.title} architecture, foundational patterns, and interview-critical sequences.
                       </p>
                    </div>

                    <div className="relative w-40 h-40 shrink-0">
                       <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" strokeWidth="2" stroke="rgba(255,255,255,0.03)" fill="none" />
                          <motion.circle cx="50" cy="50" r="45" strokeWidth="4" stroke="#818cf8" fill="none" strokeLinecap="round"
                            strokeDasharray="282.7" initial={{ strokeDashoffset: 282.7 }} animate={{ strokeDashoffset: 282.7 * (1 - selectedSubject.progress / 100) }} transition={{ duration:1.5, ease:"easeInOut" }}
                            style={{ filter: "drop-shadow(0 0 15px rgba(129,140,248,0.5))" }} />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-white italic leading-none">{selectedSubject.progress}%</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-2">COMPLETE</span>
                       </div>
                    </div>
                 </div>

                 {/* Protocols Grid */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-4 px-4">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-700">Sequence Registry</h3>
                       <span className="text-[10px] font-bold text-indigo-400/40 italic">{selectedSubject.chapters.length} Protocols Identified</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {selectedSubject.chapters.map((chapter: any, idx: number) => (
                         <motion.div key={chapter.title} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: idx * 0.05 }}
                           onClick={() => handleToggleChapter(selectedSubject.id, idx)}
                           className={cn("vibe-card !p-8 group cursor-pointer transition-all flex items-center justify-between",
                             chapter.done ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "bg-white/[0.01] hover:border-indigo-600/30"
                           )}>
                            <div className="flex items-center gap-6">
                               <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center border transition-all",
                                 chapter.done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/[0.02] border-white/[0.05] text-slate-800"
                               )}>
                                  {chapter.done ? <CheckCircle2 className="w-7 h-7" /> : <span className="text-[13px] font-black italic">{idx + 1}</span>}
                               </div>
                               <div>
                                  <p className={cn("text-[15px] font-black uppercase tracking-tight transition-colors", chapter.done ? "text-emerald-400/60" : "text-white")}>{chapter.title}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">{chapter.questions} INTELLIGENCE NODES</span>
                                     <div className="w-1 h-1 rounded-full bg-slate-800" />
                                     <span className={cn("text-[9px] font-black uppercase tracking-widest", chapter.done ? "text-emerald-500/40" : "text-indigo-400/40")}>{chapter.done ? "RESOLVED" : "PENDING"}</span>
                                  </div>
                               </div>
                            </div>
                            <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center transition-all",
                              chapter.done ? "bg-emerald-500 border-emerald-500 text-void shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/[0.01] border-white/[0.05] text-slate-900 group-hover:text-indigo-400 group-hover:border-indigo-600/30"
                            )}>
                               {chapter.done ? <Check className="w-8 h-8 stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 </div>

                 {/* Wisdom Panel */}
                 <div className="vibe-card !p-12 bg-indigo-600/[0.02] border-indigo-600/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Zap className="w-48 h-48 text-indigo-400" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                       <div className="flex-1 space-y-4">
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic leading-none">Insight Matrix</h3>
                          <p className="text-[13px] font-bold text-slate-500 italic leading-relaxed">
                             "True mastery of CS theory requires understanding the intersection of hardware constraints and software abstractions. Every protocol you resolve here strengthens your foundation for large-scale system architecture."
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4 shrink-0">
                          <div className="vibe-card !p-6 bg-white/[0.01] text-center w-32">
                             <p className="text-[24px] font-black text-indigo-400 leading-none mb-1">{selectedSubject.chapters.filter((c:any) => c.done).length}</p>
                             <p className="text-[8px] font-black uppercase text-slate-800 tracking-widest">Active Nodes</p>
                          </div>
                          <div className="vibe-card !p-6 bg-white/[0.01] text-center w-32">
                             <p className="text-[24px] font-black text-white leading-none mb-1">{Math.floor(Math.random()*100)}</p>
                             <p className="text-[8px] font-black uppercase text-slate-800 tracking-widest">Rank Index</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                 <div className="w-24 h-24 rounded-[3rem] bg-white/[0.01] border border-white/[0.03] flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-800" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-700 italic">Select Archive</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Initialize sequence to view data</p>
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isAnalyzing && setIsAdding(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-xl vibe-card !p-12 space-y-10 shadow-2xl bg-[#050508] border-indigo-600/20 overflow-hidden">
              
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <Globe className="w-64 h-64 text-indigo-600" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-1 h-4 bg-indigo-600" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Expansion Protocol</p>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">Register New Archive</h3>
                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed">Input subject designation to auto-generate placement-critical curriculum structure from the Grand Library.</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="relative group">
                  <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800 group-focus-within:text-indigo-400 transition-colors" />
                  <input autoFocus type="text" placeholder="SUBJECT DESIGNATION..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubject()} disabled={isAnalyzing}
                    className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[2rem] px-16 py-6 text-white font-black placeholder:text-slate-900 focus:border-indigo-600/40 outline-none transition-all italic text-sm" />
                </div>

                {isAnalyzing ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Archiving Sequences...</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-700 italic">PLEASE WAIT</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.02] w-full rounded-full overflow-hidden border border-white/[0.03]">
                      <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="h-full bg-indigo-600 w-1/2 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={handleAddSubject} className="flex-1 bg-indigo-600 text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)]">
                      AUTHORIZE ARCHIVE
                    </button>
                    <button onClick={() => setIsAdding(false)} className="px-10 py-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-white transition-all">
                      ABORT
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
