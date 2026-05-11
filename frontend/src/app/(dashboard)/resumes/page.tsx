"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Upload, Sparkles, Search, Trash2, Download, 
  Eye, CheckCircle2, AlertCircle, Loader2, FileSearch, Check, FileCheck, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resume {
  id: string;
  name: string;
  date: string;
  type: string;
  score: number;
  usage: number;
}

const DEFAULT_RESUMES: Resume[] = [
  { id: "1", name: "SDE_General.pdf", date: "May 04, 2026", type: "Full Stack", score: 88, usage: 12 },
  { id: "2", name: "Frontend_React.pdf", date: "Apr 22, 2026", type: "Frontend", score: 72, usage: 5 },
];

const API = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

export default function ResumePage() {
  const { getToken, isLoaded, userId } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>(DEFAULT_RESUMES);
  const [isUploading, setIsUploading] = useState(false);
  const [showReview, setShowReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [matchMode, setMatchMode] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [jdText, setJdText] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  const saveResumes = (newResumes: Resume[]) => {
    setResumes(newResumes);
  };

  const runMatch = async () => {
    if (!jdText || isMatching) return;
    setIsMatching(true);
    try {
      console.log("DEBUG: Starting match request...");
      const token = await getToken();
      if (!token) {
        alert("Session expired. Please log in again.");
        return;
      }

      const res = await fetch(`${API}/ai/match`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          jd_text: jdText,
          resume_id: showReview
        }),
      });

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(`Match failed (${res.status}): ${errData}`);
      }
      
      const data = await res.json();
      console.log("DEBUG: Match success", data);
      
      const scoreMatch = data.analysis.match(/Score:?\s*(\d+)/i) || data.analysis.match(/(\d+)%/);
      const matchScore = scoreMatch ? parseInt(scoreMatch[1]) : 85;

      setMatchResult({
        match_score: matchScore,
        analysis: data.analysis
      });
    } catch (err: any) {
      console.error(err);
      alert(`Match failed: ${err.message}`);
    } finally {
      setIsMatching(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API}/resumes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend fields to frontend interface if needed
        const backendResumes = data.map((r: any) => ({
          id: r.id,
          name: r.version_name,
          date: new Date(r.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) || "Just now",
          type: r.tailored_for || "General",
          score: 85, // Default score for now
          usage: 0
        }));
        setResumes([...DEFAULT_RESUMES, ...backendResumes]);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchResumes();
    }
  }, [isLoaded, userId]);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      alert("Only PDF files are currently supported.");
      return;
    }
    
    setIsUploading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version_name", file.name);
      formData.append("tailored_for", "General"); // Can be customized later

      const res = await fetch(`${API}/resumes/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed: ${errText}`);
      }
      
      await fetchResumes();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload resume to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteResume = (id: string) => {
    saveResumes(resumes.filter(r => r.id !== id));
  };

  const startReview = (id: string) => {
    setShowReview(id);
    setIsReviewing(true);
    setIsFixed(false);
    setTimeout(() => setIsReviewing(false), 2500);
  };

  const startAutoFix = () => {
    setIsAutoFixing(true);
    setTimeout(() => {
      const original = resumes.find(r => r.id === showReview);
      if (original) {
        const newResume: Resume = {
          id: Math.random().toString(36).substring(7),
          name: `[Fixed] ${original.name}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: original.type,
          score: Math.min(99, original.score + Math.floor(Math.random() * 10) + 10),
          usage: 0
        };
        saveResumes([newResume, ...resumes]);
      }
      setIsAutoFixing(false);
      setIsFixed(true);
    }, 2500);
  };

  const filteredResumes = resumes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050505]">
      {/* Header */}
      <div className="shrink-0 px-8 py-4 border-b border-white/[0.03] flex items-center justify-between relative z-10"
        style={{ background: "rgba(10,10,18,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_100%)] animate-pulse" />
                 <FileText className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400/60">Career Intelligence</p>
              </div>
               <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic pb-1">
                 Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Resumes</span>
               </h1>
            </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative group w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/30 group-focus-within:text-indigo-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Query document matrix..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-12 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-800 outline-none transition-all focus:border-indigo-500/30"
               />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
             {/* Upload Dropzone */}
              <div 
               className="group relative h-36 rounded-[2rem] border border-dashed flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer overflow-hidden bg-indigo-500/[0.01] border-white/[0.03] hover:border-indigo-500/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { 
                e.preventDefault(); 
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
             >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 bg-white/[0.02] border border-white/[0.05] group-hover:border-indigo-500/20 shadow-xl"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /> : <Upload className="w-6 h-6 text-indigo-400" />}
                </div>
                <div className="text-center relative z-10">
                  <p className="font-black text-[12px] uppercase tracking-[0.3em] text-white italic">{isUploading ? "Neural Parsing Active..." : "Deploy New Document"}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 mt-2">Vectorized PDF Protocol v4.0</p>
                </div>
             </div>

             {/* Resume List */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <AnimatePresence>
                   {filteredResumes.map((resume) => (
                    <motion.div 
                      key={resume.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => startReview(resume.id)}
                      className="vibe-card group !p-8 hover:bg-indigo-500/[0.02] transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                       <div className="flex justify-between items-start mb-8">
                         <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-400 transition-all bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 group-hover:border-indigo-500/40">
                           <FileCheck className="w-6 h-6" />
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="text-right">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mb-1">ATS INDEX</p>
                              <span className={cn("text-2xl font-black italic", resume.score >= 80 ? "text-emerald-400" : "text-yellow-500")}>
                                {resume.score}%
                              </span>
                           </div>
                         </div>
                       </div>

                       <div className="flex-1 space-y-2 mb-8">
                         <h3 className="text-xl font-black text-white italic truncate pr-6 pb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{resume.name}</h3>
                         <div className="flex items-center gap-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                              {resume.date}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">
                              {resume.type}
                            </p>
                         </div>
                       </div>

                       <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                         <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300 transition-colors">
                           <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Neural Audit
                         </div>
                         <div className="flex items-center gap-4">
                           <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-white/5 text-slate-700 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
                           <button onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-700 hover:text-rose-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             {showReview ? (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                 className="vibe-card sticky top-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden !p-0"
               >
                 <div className="flex p-2 bg-black/40 border-b border-white/[0.03]">
                    <button onClick={() => setMatchMode(false)}
                      className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", !matchMode ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg" : "text-slate-700 hover:text-slate-400")}>
                      Neural Audit
                    </button>
                    <button onClick={() => setMatchMode(true)}
                      className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", matchMode ? "bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-lg" : "text-slate-700 hover:text-slate-400")}>
                      Vector Match
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                   {!matchMode ? (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-white">ATS Analysis</h3>
                          </div>
                          <button onClick={() => setShowReview(null)} className="text-slate-500 hover:text-white"><AlertCircle className="w-4 h-4" /></button>
                        </div>
                         {isReviewing ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-32">
                            <div className="relative">
                               <Loader2 className="w-10 h-10 animate-spin text-indigo-500/20" />
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                               </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse">Running Neural Audit...</p>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/40">Success Indicators</h4>
                              <div className="space-y-3">
                                {["Strong action verbs detected", "High density of metric-driven success points"].map((s,i) => (
                                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:border-emerald-500/20 transition-all">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-tight">{s}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button onClick={startAutoFix} disabled={isAutoFixing || isFixed}
                              className={cn("w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl", 
                                isFixed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-600 text-white shadow-indigo-600/20 hover:scale-105")}>
                              {isAutoFixing ? <Loader2 className="w-5 h-5 animate-spin" /> : isFixed ? "NEURAL LOGS UPDATED" : "INITIATE AUTO-RECOVERY"}
                            </button>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2"><Target className="w-4 h-4 text-pink-400" /><h3 className="text-[11px] font-black uppercase tracking-widest text-white">Job Match</h3></div>
                          <button onClick={() => setShowReview(null)} className="text-slate-500 hover:text-white"><AlertCircle className="w-4 h-4" /></button>
                        </div>
                         {!matchResult ? (
                          <div className="space-y-6">
                            <div className="space-y-3">
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-500/40">Target Protocol</p>
                               <textarea 
                                 placeholder="Paste job description telemetry..." 
                                 value={jdText} 
                                 onChange={(e) => setJdText(e.target.value)}
                                 className="w-full h-64 bg-white/[0.01] border border-white/[0.03] rounded-3xl p-6 text-[12px] font-medium text-slate-300 outline-none focus:border-purple-500/30 transition-all resize-none custom-scrollbar" 
                               />
                            </div>
                            <button onClick={runMatch} disabled={isMatching || !jdText}
                              className="w-full py-5 rounded-[2rem] bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-600/20">
                              {isMatching ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "EXECUTE VECTOR MATCH"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-8 pb-32">
                            <div className="p-8 rounded-[2rem] bg-purple-500/5 border border-purple-500/10 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-12 h-12 text-purple-400" /></div>
                              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-500/60 mb-2">Neural Congruence</p>
                              <p className="text-5xl font-black text-white italic tracking-tighter">{matchResult.match_score}%</p>
                              <div className="mt-6 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${matchResult.match_score}%` }} className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                              </div>
                            </div>
                            <div className="space-y-4">
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">Analysis Telemetry</p>
                               <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400 font-bold uppercase tracking-tight">{matchResult.analysis}</div>
                            </div>
                            <button onClick={() => setMatchResult(null)} className="w-full py-4 rounded-2xl border border-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-white transition-all">Reset Matrix</button>
                          </div>
                        )}
                     </div>
                   )}
                 </div>
               </motion.div>
             ) : (
               <div className="smooth-card h-64 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-slate-800">
                 <FileSearch className="w-6 h-6 text-slate-700" />
                 <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Select a Resume</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
