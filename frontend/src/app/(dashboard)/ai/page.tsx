"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User as UserIcon, Sparkles, RotateCcw,
  Plus, ChevronRight, Brain, Code2, BookOpen, Settings2, ChevronDown,
  Layers, Loader2, Zap, MessageSquare, Clock, X, Copy, Check, Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAiSessions, getAiSession, deleteAiSession } from "@/services/placementos-api";

interface Message { role: "user" | "assistant"; content: string; ts?: string; }
interface Session  { id: string; topic: string; subject: string; mode: string; date: string; preview: string; }

const MODES = [
  { id: "teaching",    label: "Tutor",     icon: Brain,    desc: "Socratic guidance — learn by doing",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)"  },
  { id: "interview",   label: "Interview", icon: Zap,      desc: "Mock interview with real pressure",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  { id: "code_review", label: "Review",   icon: Code2,    desc: "Paste code, get expert feedback",       color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  { id: "explain",     label: "Explain",  icon: BookOpen, desc: "Deep-dive on any concept",              color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.2)"  },
  { id: "roadmap",     label: "Roadmap",  icon: Map,      desc: "Get a custom career study plan",         color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)" },
];

const MODE_PROMPTS: Record<string, { label: string; icon: string }[]> = {
  teaching: [
    { label: "Explain Binary Search",      icon: "01" },
    { label: "What is CAP Theorem?",       icon: "02" },
    { label: "DBMS vs NoSQL differences",  icon: "03" },
    { label: "Explain OS scheduling",      icon: "04" },
    { label: "System design: URL shorter", icon: "05" },
    { label: "BFS vs DFS — when to use?",  icon: "06" },
  ],
  interview: [
    { label: "Mock Interview: Google",     icon: "GI" },
    { label: "Mock Interview: Amazon",     icon: "AZ" },
    { label: "System Design Round",        icon: "SD" },
    { label: "LeetCode Hard Challenge",    icon: "LH" },
    { label: "Behavioral Prep: Star",     icon: "BP" },
    { label: "Frontend Engineer Quiz",    icon: "FE" },
  ],
  code_review: [
    { label: "Review my React Component",  icon: "RC" },
    { label: "Check my SQL Query",         icon: "SQ" },
    { label: "Optimize Python function",   icon: "PY" },
    { label: "Identify memory leaks",      icon: "ML" },
    { label: "Security audit this API",    icon: "SA" },
    { label: "Refactor for Clean Code",    icon: "CC" },
  ],
  explain: [
    { label: "How does SSL work?",        icon: "01" },
    { label: "Explain OAuth2 Flow",       icon: "02" },
    { label: "What is a Deadlock?",       icon: "03" },
    { label: "Explain Kubernetes",        icon: "04" },
    { label: "How Git works internally",  icon: "05" },
    { label: "WebSockets vs Polling",     icon: "06" },
  ],
  roadmap: [
    { label: "Roadmap for Stripe",        icon: "RS" },
    { label: "Roadmap for Microsoft",     icon: "RM" },
    { label: "4-Week DSA Masterplan",     icon: "DM" },
    { label: "Fullstack Career Path",     icon: "FS" },
    { label: "AI/ML Engineer Guide",      icon: "AI" },
    { label: "DevOps Learning Path",      icon: "DO" },
  ],
};

const API = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Simple markdown renderer for AI responses
function RenderContent({ text }: { text: string }) {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Handle Code Blocks
        if (line.trim().startsWith("```")) {
          if (inCodeBlock) {
            const block = codeBuffer.join("\n");
            inCodeBlock = false;
            codeBuffer = [];
            return (
              <pre key={i} className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-violet-300 overflow-x-auto whitespace-pre">
                {block}
              </pre>
            );
          }
          inCodeBlock = true;
          return null;
        }

        if (inCodeBlock) {
          codeBuffer.push(line);
          return null;
        }

        // Handle Headings
        if (line.trim().startsWith("#")) {
          const level = line.match(/^#+/)?.[0].length || 0;
          const cleanText = line.replace(/^#+\s*/, "");
          return (
            <p key={i} className={cn(
              "font-black text-white",
              level === 1 ? "text-lg mt-6 mb-2" : level === 2 ? "text-base mt-4 mb-2" : "text-sm mt-3 mb-1"
            )}>
              {cleanText}
            </p>
          );
        }

        // Handle Bold and List
        let content: any = line;
        
        // Basic bold replacement for **text**
        if (typeof content === "string" && content.includes("**")) {
          const parts = content.split(/(\*\*.*?\*\*)/g);
          content = parts.map((part, pi) => 
            part.startsWith("**") && part.endsWith("**") 
              ? <strong key={pi} className="font-black text-white">{part.slice(2, -2)}</strong>
              : part
          );
        }

        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 items-start ml-2 my-1">
              <div className="w-1.5 h-1.5 rounded-full bg-matte-blue mt-2 shrink-0" />
              <div className="text-sm text-slate-300 font-medium leading-relaxed">
                {typeof content === "string" ? content.replace(/^[-•]\s*/, "") : content}
              </div>
            </div>
          );
        }

        if (line.trim() === "") return <div key={i} className="h-1" />;
        
        return (
          <div key={i} className="text-sm text-slate-300 font-medium leading-relaxed">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default function MentorPage() {
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [mode,        setMode]        = useState(MODES[0]);
  const [subject,     setSubject]     = useState("");
  const [sessions,    setSessions]    = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [copied,      setCopied]      = useState<number | null>(null);
  const [showModes,   setShowModes]   = useState(false);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(true);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const isInternalUpdate = useRef(false);

  const { getToken, isLoaded, userId } = useAuth();

  const fetchSessions = async () => {
    try {
      const token = await getToken();
      const data = await getAiSessions(token || undefined);
      
      const mapped: Session[] = data.map((s: any) => {
        const modeObj = MODES.find(m => m.id === s.mode) || MODES[0];
        const sessionDate = s.updated_at || s.created_at || new Date().toISOString();
        
        return {
          id: s.id,
          topic: s.subject || "Untitled Session",
          subject: s.subject || "",
          mode: modeObj.label,
          date: new Date(sessionDate).toLocaleDateString(),
          preview: s.messages?.[s.messages.length - 1]?.content?.slice(0, 60) || "No messages yet"
        };
      });

      setSessions(mapped.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchSessions();
    }
  }, [isLoaded, userId, activeSession]);

  const loadSessionDetails = useCallback(async (id: string) => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await getToken();
      const session = await getAiSession(id, token || undefined);
      
      if (session && session.messages) {
        setMessages(session.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          ts: formatTime()
        })));
        setSubject(session.subject || "");
        const matchingMode = MODES.find(m => m.id === session.mode);
        if (matchingMode) setMode(matchingMode);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (activeSession) {
      loadSessionDetails(activeSession);
    }
  }, [activeSession, loadSessionDetails]);
  
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic UI update: remove from list immediately
    const previousSessions = [...sessions];
    setSessions(p => p.filter(s => s.id !== id));
    if (activeSession === id) {
      startNewChat();
    }

    try {
      const token = await getToken();
      await deleteAiSession(id, token || undefined);
      console.log(`DEBUG: Session ${id} successfully removed from backend.`);
    } catch (err: any) {
      // If error is 404, it means it was already deleted, so we can ignore it
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        console.warn(`DEBUG: Session ${id} already deleted from backend.`);
        return;
      }
      
      console.error("Failed to delete session:", err);
      // Rollback UI on real failure
      setSessions(previousSessions);
      alert(`Deletion failed: ${err.message || "Please check your connection."}`);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveSession(null);
    setSubject("");
    setInput("");
    setIsLoading(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (e?: React.FormEvent | string) => {
    if (e && typeof e !== "string") e.preventDefault();
    const text = typeof e === "string" ? e : input.trim();
    if (!text || isLoading) return;

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    const userMsg: Message = { role: "user", content: text, ts: formatTime() };
    setMessages(p => [...p, userMsg]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const baseUrl = API.endsWith("/") ? API.slice(0, -1) : API;
      
      let endpoint = "/ai/chat";
      let body: any = { 
        message: text, 
        mode: mode.id, 
        subject: subject || undefined,
        session_id: activeSession || undefined 
      };

      if (mode.id === "roadmap") {
        endpoint = "/ai/roadmap";
        body = { 
          target_company: text, 
          target_role: subject || "Software Engineer",
          session_id: activeSession || undefined
        };
      }

      const url = `${baseUrl}${endpoint}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      
      let rawReply = data.analysis || data.roadmap || data.response || data.reply || data.message || data;
      const reply = typeof rawReply === "string" ? rawReply : JSON.stringify(rawReply, null, 2);
      
      if (!reply || reply === "{}") {
        throw new Error("AI returned an empty response. Please try again.");
      }

      setMessages(p => [...p, { role: "assistant", content: reply, ts: formatTime() }]);

      if (data.session_id && !activeSession) {
        isInternalUpdate.current = true;
        setActiveSession(data.session_id);
      }
      
      fetchSessions();

    } catch (err: any) {
      console.error("[AI Error Detail]:", err);
      setMessages(p => [...p, { 
        role: "assistant", 
        content: `I'm having trouble: ${err.message || "Unknown connection error"}.`, 
        ts: formatTime() 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, mode, subject, getToken]);

  const copyMsg = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentMode = MODES.find(m => m.id === mode.id) || MODES[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#08080c] vibe-prism relative">
      {/* Prism Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
         <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-fuchsia-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── SIDEBAR ── */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 shrink-0 flex-col border-r border-white/[0.03] overflow-hidden transition-all duration-500 z-[60] lg:relative lg:translate-x-0",
        showHistory ? "translate-x-0 flex" : "-translate-x-full hidden lg:flex"
      )}
        style={{ background: "rgba(6,6,10,0.85)", backdropFilter: "blur(24px)" }}>

        {/* Brand */}
        <div className="px-8 py-6 border-b border-white/[0.03]">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-1 h-3 transition-colors duration-500" style={{ background: mode.color, boxShadow: `0 0 10px ${mode.color}` }} />
             <p className="text-[9px] font-black uppercase tracking-[0.4em] transition-colors duration-500" style={{ color: `${mode.color}cc` }}>Oracle System</p>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white italic pr-8 pb-1">AI Mentor</h1>
        </div>

        {/* New Session Button */}
        <div className="px-6 py-4">
          <button onClick={startNewChat}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: mode.color, boxShadow: `0 10px 30px ${mode.color}25` }}
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>

        {/* Mode Picker */}
        <div className="px-6 py-2 flex-1 overflow-y-auto custom-scrollbar space-y-2">
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-800 px-2 mb-3">Protocols</p>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left group border border-transparent",
                mode.id === m.id ? "bg-white/[0.03] border-white/[0.05]" : "hover:bg-white/[0.01]"
              )}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/[0.05] group-hover:border-white/[0.1] transition-all">
                <m.icon className="w-4 h-4 transition-colors" style={{ color: mode.id === m.id ? m.color : '#334155' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: mode.id === m.id ? '#fff' : '#475569' }}>{m.label}</p>
              </div>
              {mode.id === m.id && <motion.div layoutId="modeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full shadow-lg" style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}` }} />}
            </button>
          ))}

          {/* History divider */}
          <div className="pt-6 pb-4">
             <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-800 px-2 mb-3">Session Log</p>
             <div className="space-y-2 px-1">
               {sessions.map(s => (
                 <div key={s.id} className="relative group">
                   <button 
                     onClick={() => setActiveSession(s.id)}
                     className={cn(
                       "w-full text-left p-4 rounded-2xl transition-all border",
                       activeSession === s.id ? "bg-violet-500/5 border-violet-500/20" : "bg-transparent border-transparent hover:bg-white/[0.01]"
                     )}
                   >
                     <div className="flex items-center justify-between mb-1.5">
                       <span className="text-[7px] font-black uppercase tracking-widest transition-colors" style={{ color: `${mode.color}99` }}>
                         {s.mode}
                       </span>
                       <span className="text-[7px] font-black text-slate-800 italic">{s.date}</span>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors truncate">{s.topic}</p>
                   </button>
                   <button 
                     onClick={(e) => handleDeleteSession(s.id, e)}
                     className="absolute top-5 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-800"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* Chat top bar */}
        <div className="shrink-0 px-8 py-4 border-b border-white/[0.03] flex items-center justify-between bg-[#08080c]/80 backdrop-blur-3xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="lg:hidden p-3 rounded-xl hover:bg-white/5 transition-all text-slate-400"
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500"
                 style={{ backgroundColor: `${mode.color}15`, borderColor: `${mode.color}35` }}>
                  <currentMode.icon className="w-5 h-5 transition-colors duration-500" style={{ color: mode.color }} />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-white">{currentMode.label} Protocol</p>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500" style={{ backgroundColor: mode.color }} />
                  </div>
                  <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-0.5">Status: Operational</p>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="vibe-card !px-4 !py-2 bg-white/[0.01]">
               <input 
                 value={subject} 
                 onChange={e => setSubject(e.target.value)}
                 placeholder="Context Node..."
                 className="bg-transparent text-[10px] font-black uppercase tracking-widest text-violet-400 placeholder:text-slate-800 outline-none w-32 text-center" 
               />
            </div>
            {messages.length > 0 && (
              <button onClick={startNewChat} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-white transition-all bg-white/[0.02] border border-white/[0.05]">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-8 py-10">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                   <div className="absolute inset-0 blur-[50px] animate-pulse rounded-full opacity-10" style={{ backgroundColor: mode.color }} />
                   <div className="w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center relative bg-[#08080c]" 
                     style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${mode.color}33` }}>
                      <currentMode.icon className="w-8 h-8 transition-colors duration-500" style={{ color: mode.color }} />
                   </div>
                </div>
                <div className="space-y-1">
                   <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic pr-6">Initialize Mentorship</h2>
                   <p className="text-[8px] text-slate-700 font-bold uppercase tracking-[0.4em]">Awaiting input from master node</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {(MODE_PROMPTS[mode.id] || MODE_PROMPTS.teaching).map(qp => (
                  <motion.button key={qp.label} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(qp.label)}
                    className="vibe-card !p-4 text-left group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Sparkles className="w-8 h-8" style={{ color: mode.color }} />
                    </div>
                    <p className="text-[10px] font-black mb-1.5 italic" style={{ color: mode.color }}>#{qp.icon}</p>
                    <p className="text-[10px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest leading-tight truncate pr-4">{qp.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-6", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar */}
                  <div className={cn("w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-xl transition-colors duration-500")}
                    style={msg.role === "assistant"
                      ? { backgroundColor: `${mode.color}1a`, borderWidth: '1px', borderStyle: 'solid', borderColor: `${mode.color}4d` }
                      : { background: "rgba(255,255,255,0.02)", borderWidth: '1px', borderStyle: 'solid', borderColor: "rgba(255,255,255,0.05)" }
                    }>
                    {msg.role === "assistant"
                      ? <currentMode.icon className="w-5 h-5 transition-colors duration-500" style={{ color: mode.color }} />
                      : <UserIcon className="w-5 h-5 text-slate-600" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={cn("flex-1 max-w-[90%] group")}
                    style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div className={cn(
                      "relative px-6 py-5 rounded-3xl shadow-2xl transition-all duration-500",
                      msg.role === "assistant" ? "vibe-card !bg-[#0c0c12]/95" : ""
                    )}
                    style={msg.role === "user" ? { backgroundColor: `${mode.color}1a`, borderWidth: '1px', borderStyle: 'solid', borderColor: `${mode.color}33` } : {}}
                    >
                      {msg.role === "assistant"
                        ? <RenderContent text={msg.content} />
                        : <p className="text-sm font-bold text-slate-200 leading-relaxed italic" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                      }

                      {/* Copy button (assistant only) */}
                      {msg.role === "assistant" && (
                        <button onClick={() => copyMsg(i, msg.content)}
                          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05]">
                          {copied === i
                            ? <Check className="w-4 h-4 text-emerald-400" />
                            : <Copy className="w-4 h-4 text-slate-700" />
                          }
                        </button>
                      )}
                    </div>
                    {msg.ts && (
                      <p className={cn("text-[9px] font-black text-slate-800 mt-2 uppercase tracking-widest", msg.role === "user" ? "text-right mr-4" : "text-left ml-4")}>
                        {msg.ts} <span className="opacity-40 ml-1">· Transmission Verified</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-500"
                    style={{ backgroundColor: `${mode.color}1a`, borderWidth: '1px', borderStyle: 'solid', borderColor: `${mode.color}33` }}>
                    <currentMode.icon className="w-5 h-5 animate-pulse" style={{ color: mode.color }} />
                  </div>
                  <div className="vibe-card !px-6 !py-4 flex items-center gap-4 bg-[#0c0c12]/95 shadow-2xl">
                    <div className="flex gap-1.5">
                      {[0,1,2].map(d => (
                        <motion.div key={d} className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
                          style={{ backgroundColor: mode.color, boxShadow: `0 0 8px ${mode.color}` }}
                          animate={{ y: [0, -6, 0], opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Syncing Intelligence...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* ── INPUT BAR ── */}
        <div className="shrink-0 px-8 py-6 border-t border-white/[0.03] bg-[#08080c]/90 backdrop-blur-3xl z-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-[2rem] p-1.5 transition-all shadow-2xl bg-[#0c0c12] group"
               style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: input.trim() ? `${mode.color}33` : "rgba(255,255,255,0.05)" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Query ${currentMode.label.toLowerCase()} interface...`}
                className="w-full bg-transparent px-8 py-5 pr-20 text-sm font-bold text-slate-200 placeholder:text-slate-800 outline-none resize-none min-h-[60px] max-h-[160px]"
                rows={1}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                style={{ backgroundColor: mode.color, boxShadow: `0 10px 20px ${mode.color}4d` }}
              >
                {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white ml-0.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center px-8 mt-4">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-700">Encrypted Uplink</p>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-700">Mode: {currentMode.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
