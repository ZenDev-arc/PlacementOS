"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal as TerminalIcon, 
  Search, 
  Zap, 
  Code2, 
  Target,
  Plus,
  TrendingUp,
  BrainCircuit,
  SearchCode,
  Layers,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Shield,
  Activity,
  ArrowRight,
  ChevronRight,
  Trophy,
  History as HistoryIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDsaProblems, createDsaProblem, getDsaStats } from "@/services/placementos-api";
import { useAuth } from "@clerk/clerk-react";

const TOPICS = ["Arrays", "Strings", "Trees", "Graphs", "DP", "Greedy", "Linked List", "Stack", "Queue", "Math"];

const MASTER_INTEL: any = {
  "Arrays": [
    { title: "Two Sum", difficulty: "Easy" }, { title: "Stock Buy/Sell", difficulty: "Easy" },
    { title: "Majority Element", difficulty: "Easy" }, { title: "Move Zeroes", difficulty: "Easy" },
    { title: "Merge Sorted", difficulty: "Easy" }, { title: "Kth Largest", difficulty: "Medium" },
    { title: "3Sum", difficulty: "Medium" }, { title: "Product Except Self", difficulty: "Medium" },
    { title: "Spiral Matrix", difficulty: "Medium" }, { title: "Merge Intervals", difficulty: "Medium" },
    { title: "Trapping Rain Water", difficulty: "Hard" }, { title: "Median Sorted Arrays", difficulty: "Hard" }
  ],
  "Strings": [
    { title: "Valid Palindrome", difficulty: "Easy" }, { title: "Valid Anagram", difficulty: "Easy" },
    { title: "Longest Common Prefix", difficulty: "Easy" }, { title: "Longest Substring No Repeat", difficulty: "Medium" },
    { title: "Group Anagrams", difficulty: "Medium" }, { title: "Decode String", difficulty: "Medium" },
    { title: "Reverse Words", difficulty: "Medium" }, { title: "Min Window Substring", difficulty: "Hard" }
  ],
  "Linked List": [
    { title: "Reverse LL", difficulty: "Easy" }, { title: "Detect Cycle", difficulty: "Easy" },
    { title: "Merge Sorted Lists", difficulty: "Easy" }, { title: "Middle of LL", difficulty: "Easy" },
    { title: "Add Two Numbers", difficulty: "Medium" }, { title: "Reorder List", difficulty: "Medium" },
    { title: "Merge K Sorted", difficulty: "Hard" }, { title: "Reverse in K-Groups", difficulty: "Hard" }
  ],
  "Stack/Queue": [
    { title: "Valid Parentheses", difficulty: "Easy" }, { title: "Min Stack", difficulty: "Medium" },
    { title: "Daily Temperatures", difficulty: "Medium" }, { title: "Largest Rectangle", difficulty: "Hard" },
    { title: "Sliding Window Max", difficulty: "Hard" }, { title: "LRU Cache", difficulty: "Hard" }
  ],
  "Trees": [
    { title: "Max Depth", difficulty: "Easy" }, { title: "Invert Tree", difficulty: "Easy" },
    { title: "Level Order", difficulty: "Medium" }, { title: "Validate BST", difficulty: "Medium" },
    { title: "LCA Binary Tree", difficulty: "Medium" }, { title: "Serialize/Deserialize", difficulty: "Hard" }
  ],
  "Graphs": [
    { title: "Number of Islands", difficulty: "Medium" }, { title: "Clone Graph", difficulty: "Medium" },
    { title: "Course Schedule", difficulty: "Medium" }, { title: "Word Ladder", difficulty: "Hard" },
    { title: "Critical Connections", difficulty: "Hard" }
  ],
  "DP": [
    { title: "Climbing Stairs", difficulty: "Easy" }, { title: "House Robber", difficulty: "Medium" },
    { title: "Coin Change", difficulty: "Medium" }, { title: "Longest Inc Subseq", difficulty: "Medium" },
    { title: "Edit Distance", difficulty: "Hard" }, { title: "Trapping Rain Water", difficulty: "Hard" }
  ]
};

const COMPANY_INTEL: any = {
  "Google": MASTER_INTEL["Arrays"].slice(0, 8).concat(MASTER_INTEL["Graphs"].slice(0, 4)),
  "Amazon": MASTER_INTEL["Arrays"].slice(0, 8).concat(MASTER_INTEL["Stack/Queue"].slice(0, 4)),
  "Meta": MASTER_INTEL["Strings"].slice(0, 8).concat(MASTER_INTEL["Trees"].slice(0, 4)),
  "Netflix": MASTER_INTEL["DP"].slice(0, 8).concat(MASTER_INTEL["Linked List"].slice(0, 4)),
  "Microsoft": MASTER_INTEL["Trees"].slice(0, 8).concat(MASTER_INTEL["Linked List"].slice(0, 4))
};

export default function DSACenter() {
  const [history, setHistory] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<"company" | "sheet" | "log">("log");
  const [searchCompany, setSearchCompany] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { getToken, isLoaded, userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    setMounted(true);
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const [historyData, statsData] = await Promise.all([
          getDsaProblems(token || undefined),
          getDsaStats(token || undefined)
        ]);
        
        if (historyData && Array.isArray(historyData)) {
          setHistory(historyData.map(d => ({
            ...d,
            timestamp: d.solved_on || new Date().toISOString()
          })));
        }
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch DSA data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, userId, history.length]);

  const streak = new Set(history.map(h => h.timestamp?.split('T')[0])).size || 0;
  
  const handleAddEntry = async (entry: any) => {
    try {
      const token = await getToken();
      const payload = {
        problem_name: entry.title || entry.problem_name,
        topic: entry.topic || "General",
        difficulty: (entry.difficulty || "easy").toLowerCase(),
        platform: "leetcode", 
        time_taken_mins: 30,
        notes: "Logged via DSA Arena"
      };
      const newProb = await createDsaProblem(payload as any, token || undefined);
      setHistory(prev => [{ ...newProb, timestamp: new Date().toISOString() }, ...prev]);
    } catch (err) {
      console.error("Failed to save problem:", err);
      // Fallback for UI if API fails but we want to show immediate result
      setHistory(prev => [{ ...entry, timestamp: new Date().toISOString() }, ...prev]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden vibe-cyberpunk relative">
      {/* Matrix Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-6 md:px-10 py-5 border-b border-white/[0.03] flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#060408]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
           <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <TerminalIcon className="w-6 h-6 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#050505] animate-pulse" />
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-pink-500" />
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-pink-500/60">Neural Combat Arena</p>
             </div>
             <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic leading-none">
                DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">Terminal</span>
             </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex gap-2">
              {[
                { id: "log", label: "History", icon: HistoryIcon },
                { id: "company", label: "Targeting", icon: SearchCode },
                { id: "sheet", label: "Protocol", icon: Layers }
              ].map((mode) => (
                <button key={mode.id} onClick={() => setActiveMode(mode.id as any)}
                  className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative group",
                    activeMode === mode.id ? "text-void" : "text-slate-500 hover:text-white"
                  )}
                >
                  {activeMode === mode.id && (
                    <motion.div layoutId="mode-bg" className="absolute inset-0 bg-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <mode.icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </span>
                </button>
              ))}
           </div>
           
           <div className="h-8 w-px bg-white/[0.05]" />
           
           <div className="vibe-card !px-4 !py-2 bg-white/[0.01]">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mb-0.5">Arena Streak</p>
              <p className="text-xl font-black text-white italic">{streak}<span className="text-cyan-400 text-[10px] ml-1 uppercase">Cycles</span></p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative z-10">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-black/20">
          <div className="max-w-6xl mx-auto space-y-10">
            <AnimatePresence mode="wait">
              {activeMode === "log" && (
                <motion.div key="log" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="space-y-10">
                  <div className="vibe-card !p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                       <Zap className="w-48 h-48 text-pink-500" />
                    </div>
                    <LogEntryForm onSubmit={handleAddEntry} />
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-1 h-5 bg-cyan-400" />
                           <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Execution Logs</h2>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">{history.length} Sequences</span>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {history.slice(0, 8).map((h, i) => (
                           <motion.div key={h.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}
                             className="vibe-card !p-4 flex items-center justify-between hover:border-pink-500/30 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all",
                                  h.difficulty === "hard" ? "border-red-500/20 text-red-500 bg-red-500/5" :
                                  h.difficulty === "medium" ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : "border-cyan-500/20 text-cyan-500 bg-cyan-500/5"
                                )}>
                                   {h.difficulty.slice(0,1).toUpperCase()}
                                </div>
                                <div>
                                   <p className="text-[12px] font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{h.problem_name}</p>
                                   <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">{h.topic} // {new Date(h.timestamp).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                             </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeMode === "company" && (
                <motion.div key="company" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="space-y-10">
                  <div className="vibe-card !p-8 bg-white/[0.01]">
                     <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-3">
                           <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-500 text-[7px] font-black uppercase tracking-widest">Protocol Search</span>
                              <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Target Recon</h2>
                           </div>
                           <div className="relative group">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-cyan-400 transition-colors" />
                              <input value={searchCompany} onChange={e => setSearchCompany(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-12 py-4 text-xs text-white font-black placeholder:text-slate-800 focus:border-cyan-400/30 outline-none transition-all italic"
                                placeholder="IDENTIFY TARGET (E.G. GOOGLE, META)..." />
                           </div>
                        </div>
                        <div className="w-full md:w-64 h-24 rounded-xl border border-white/[0.03] bg-white/[0.01] flex flex-col items-center justify-center p-4 text-center">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mb-1">Systems Online</p>
                           <p className="text-[9px] font-bold text-slate-400 italic">"Focus on enterprise patterns."</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchCompany ? (
                      (() => {
                        const matchedKey = Object.keys(COMPANY_INTEL).find(k => k.toLowerCase().includes(searchCompany.toLowerCase()));
                        const problems = matchedKey ? COMPANY_INTEL[matchedKey] : null;
                        return problems?.map((prob: any, i: number) => (
                          <ProblemCard key={i} prob={prob} onSync={handleAddEntry} />
                        ));
                      })()
                    ) : (
                      Object.keys(COMPANY_INTEL).map(c => (
                        <button key={c} onClick={() => setSearchCompany(c)}
                          className="vibe-card !p-6 hover:border-cyan-400/30 hover:bg-cyan-400/[0.02] transition-all flex flex-col items-center gap-3 group">
                           <div className="w-12 h-12 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-center text-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-400/20 transition-all">
                              <Target className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">{c}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeMode === "sheet" && (
                <motion.div key="sheet" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {Object.keys(MASTER_INTEL).map((topic, i) => (
                     <div key={topic} onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                       className={cn("vibe-card !p-6 flex flex-col justify-between group transition-all cursor-pointer relative overflow-hidden",
                         expandedTopic === topic ? "border-cyan-400/40 bg-cyan-400/[0.02] col-span-1 md:col-span-2 lg:col-span-3" : "hover:border-pink-500/30"
                       )}
                     >
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <span className="text-2xl font-black text-pink-500/10 group-hover:text-pink-500/20 transition-all italic">0{i+1}</span>
                              <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">{topic}</h3>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <div className={cn("w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center transition-all", expandedTopic === topic && "bg-cyan-400 border-cyan-400 text-void rotate-180")}>
                                 <ChevronDown className="w-4 h-4" />
                              </div>
                              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded-lg">{MASTER_INTEL[topic].length} Items</span>
                           </div>
                        </div>
                        
                        {expandedTopic === topic && (
                          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                             {MASTER_INTEL[topic].map((p: any) => (
                               <div key={p.title} className="vibe-card !p-4 flex items-center justify-between group/item hover:border-cyan-400/20 bg-white/[0.01]">
                                  <div className="min-w-0 pr-2">
                                     <p className="text-[10px] font-black uppercase text-slate-400 group-hover/item:text-white transition-colors truncate">{p.title}</p>
                                     <p className="text-[7px] font-black uppercase tracking-widest text-slate-700 mt-0.5">Lv: {p.difficulty}</p>
                                  </div>
                                  <div className={cn("w-1.5 h-1.5 rounded-full",
                                    p.difficulty === "Hard" ? "bg-red-500" :
                                    p.difficulty === "Medium" ? "bg-amber-500" : "bg-cyan-500"
                                  )} />
                               </div>
                             ))}
                          </div>
                        )}
                        {!expandedTopic && (
                          <div className="mt-6 h-0.5 bg-white/[0.03] rounded-full overflow-hidden">
                             <div className="h-full bg-pink-500/20 w-1/3" />
                          </div>
                        )}
                     </div>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Intelligence Panel */}
        <div className="w-80 shrink-0 border-l border-white/[0.03] bg-black/40 p-8 flex flex-col gap-8">
           <div className="vibe-card !p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <BrainCircuit className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                 <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Cognitive Stats</h2>
                 <Activity className="w-3.5 h-3.5 text-pink-500" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 <div>
                    <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest block mb-1">Completion Index</span>
                    <div className="flex items-end gap-2">
                       <p className="text-3xl font-black text-white italic">{stats?.total_solved || history.length}</p>
                       <p className="text-[9px] font-black text-cyan-400 uppercase mb-1">Solved</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3 pt-3 border-t border-white/[0.03]">
                    {TOPICS.slice(0, 5).map(topic => {
                       const mastery = stats?.topic_stats?.[topic] || 0;
                       return (
                        <div key={topic} className="space-y-1">
                           <div className="flex justify-between text-[7px] font-black text-slate-600 uppercase tracking-[0.1em]">
                              <span>{topic}</span>
                              <span className="text-white">{mastery}%</span>
                           </div>
                           <div className="h-0.5 bg-white/[0.02] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 opacity-60" style={{ width: `${mastery}%` }} />
                           </div>
                        </div>
                       );
                    })}
                 </div>
              </div>
           </div>

           <div className="flex-1 vibe-card !p-6 bg-pink-500/[0.02] border-pink-500/10 flex flex-col justify-center text-center group">
              <Trophy className="w-10 h-10 text-pink-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">Rank: Vanguard</h3>
              <p className="text-[9px] font-bold text-slate-600 italic">"Keep executing."</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function LogEntryForm({ onSubmit }: { onSubmit: (entry: any) => void }) {
  const [formData, setFormData] = useState({ title: "", topic: "Arrays", difficulty: "Easy" });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit({ id: Math.random().toString(36).substr(2, 9), ...formData, timestamp: new Date().toISOString() });
    setFormData({ title: "", topic: "Arrays", difficulty: "Easy" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
         <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            <Plus className="w-6 h-6" />
         </div>
         <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white italic">DSA Matrix</h1>
            <p className="text-slate-600 font-bold text-[8px] uppercase tracking-widest mt-0.5 opacity-60">
              Logic is the architecture of problem-solving.
            </p>
         </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
         <div className="md:col-span-6">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl px-6 py-4 text-xs text-white font-black placeholder:text-slate-800 focus:border-pink-500/40 outline-none transition-all italic" 
              placeholder="PROBLEM TITLE (E.G. TWO SUM)..." />
         </div>
         
         <div className="md:col-span-3">
            <Selector value={formData.topic} options={TOPICS} onChange={(v) => setFormData({...formData, topic: v})} placeholder="TOPIC" />
         </div>
         
         <div className="md:col-span-2">
            <Selector value={formData.difficulty} options={["Easy", "Medium", "Hard"]} onChange={(v) => setFormData({...formData, difficulty: v})} placeholder="LEVEL" />
         </div>
         
         <div className="md:col-span-1">
            <button type="submit" className="w-full h-full bg-pink-600 text-void rounded-2xl py-5 flex items-center justify-center group/btn shadow-[0_10px_30px_rgba(219,39,119,0.2)] hover:scale-105 active:scale-95 transition-all">
               <ArrowRight className="w-6 h-6" />
            </button>
         </div>
      </form>
    </div>
  );
}

function Selector({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (v: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative group">
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.01] border border-white/[0.05] rounded-2xl px-8 py-5 text-[10px] text-white font-black flex items-center justify-between group-hover:border-cyan-400/30 transition-all">
        <span className={cn("uppercase tracking-widest", value ? "text-white" : "text-slate-700")}>{value || placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-700 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              className="absolute top-full left-0 right-0 mt-3 z-[101] bg-[#050505] border border-white/[0.1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden py-3 backdrop-blur-3xl">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {options.map(opt => (
                  <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
                    className={cn("w-full px-8 py-4 text-[9px] font-black uppercase tracking-widest text-left transition-all border-l-4",
                      value === opt ? "bg-cyan-400/10 text-cyan-400 border-cyan-400" : "text-slate-600 border-transparent hover:bg-white/[0.03] hover:text-white"
                    )}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProblemCard({ prob, onSync }: { prob: any, onSync: (p: any) => void }) {
  const [synced, setSynced] = useState(false);
  const handleSync = () => { setSynced(true); onSync(prob); setTimeout(() => setSynced(false), 2000); };

  return (
    <div className="vibe-card !p-5 flex flex-col gap-6 group hover:border-cyan-400/30 transition-all bg-white/[0.01]">
       <div className="flex items-start justify-between">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
            prob.difficulty === "Hard" ? "bg-red-500/5 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
            prob.difficulty === "Medium" ? "bg-amber-500/5 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
            "bg-cyan-500/5 border-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          )}>
             <Target className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <div className={cn("px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest",
             prob.difficulty === "Hard" ? "bg-red-500/10 text-red-500" :
             prob.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-cyan-500/10 text-cyan-500"
          )}>{prob.difficulty}</div>
       </div>
       
       <div>
          <h4 className="text-[13px] font-black uppercase text-white group-hover:text-cyan-400 transition-colors truncate mb-1">{prob.title}</h4>
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Protocol: {prob.topic || "CORE"}</p>
       </div>

       <button onClick={handleSync} disabled={synced}
         className={cn("w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all relative overflow-hidden",
           synced ? "bg-cyan-400 border-cyan-400 text-void shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "bg-white/[0.02] border-white/[0.05] text-slate-600 hover:text-white hover:border-white/10"
         )}>
          {synced ? "SECURED" : "SYNC"}
       </button>
    </div>
  );
}

