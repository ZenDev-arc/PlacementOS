"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Star, GitFork, Eye, Clock, AlertCircle, X, ExternalLink, RefreshCw, Globe, Lock, Search, TrendingUp, Zap, Activity, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Repo { id: number; name: string; full_name: string; description: string | null; html_url: string; stargazers_count: number; forks_count: number; watchers_count: number; language: string | null; updated_at: string; created_at: string; open_issues_count: number; private: boolean; topics: string[]; default_branch: string; size: number; }
interface GithubUser { login: string; name: string; avatar_url: string; public_repos: number; followers: number; following: number; bio: string | null; }

const LANG_COLORS: Record<string, string> = { TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5", Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#563d7c", Vue: "#41b883", Kotlin: "#A97BFF", Swift: "#FA7343", Ruby: "#701516", Shell: "#89e051" };

function timeAgo(d: string) { const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); if (days === 0) return "Today"; if (days === 1) return "Yesterday"; if (days < 7) return `${days}d ago`; if (days < 30) return `${Math.floor(days / 7)}w ago`; if (days < 365) return `${Math.floor(days / 30)}mo ago`; return `${Math.floor(days / 365)}y ago`; }
function health(r: Repo) { let s = 50; s += Math.min(r.stargazers_count * 2, 20); s += Math.min(r.forks_count * 3, 15); const d = (Date.now() - new Date(r.updated_at).getTime()) / 86400000; if (d < 7) s += 15; else if (d < 30) s += 8; else if (d > 180) s -= 10; if (r.description) s += 5; s += Math.min(r.topics.length * 2, 10); if (r.open_issues_count > 10) s -= 5; return Math.min(Math.max(s, 5), 99); }

export default function ProjectsPage() {
  const [inputVal, setInputVal] = useState("");
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Repo | null>(null);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"updated"|"stars"|"forks">("updated");
  const [refreshing, setRefreshing] = useState(false);

  const fetchGithub = useCallback(async (uname: string, isRefresh = false) => {
    if (!uname.trim()) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [ur, rr] = await Promise.all([fetch(`https://api.github.com/users/${uname}`), fetch(`https://api.github.com/users/${uname}/repos?per_page=100&sort=updated`)]);
      if (!ur.ok) throw new Error(ur.status === 404 ? "User not found." : "GitHub API error.");
      setUser(await ur.json()); setRepos(await rr.json());
      localStorage.setItem("gh_username", uname);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { const s = localStorage.getItem("gh_username"); if (s) { setInputVal(s); fetchGithub(s); } }, []);

  const langs = ["All", ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[]];
  const filtered = repos.filter(r => langFilter === "All" || r.language === langFilter).filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase())).sort((a, b) => sortBy === "stars" ? b.stargazers_count - a.stargazers_count : sortBy === "forks" ? b.forks_count - a.forks_count : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const langDist = repos.reduce((acc: Record<string, number>, r) => { if (r.language) acc[r.language] = (acc[r.language] || 0) + 1; return acc; }, {});
  const topLangs = Object.entries(langDist).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const activeRepos = repos.filter(r => (Date.now() - new Date(r.updated_at).getTime()) / 86400000 < 30).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen overflow-hidden vibe-neural bg-void relative">
      {/* Neural Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Header */}
      <div className="px-6 md:px-10 py-5 border-b border-white/[0.03] flex items-center justify-between gap-6 shrink-0 z-10 bg-[#040a08]/80 backdrop-blur-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-emerald-400" />
             </div>
             <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.4em]">Neural Uplink Active</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic pb-1">Project Matrix</h1>
        </div>
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 vibe-card !px-3 !py-1.5 bg-emerald-500/5">
              <div className="relative shrink-0">
                <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-lg border border-emerald-500/30" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#040a08] animate-pulse" />
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-black text-white">{user.name || user.login}</p>
                <p className="text-[8px] text-emerald-500/40 font-bold uppercase tracking-widest">Node ID: {user.login}</p>
              </div>
            </div>
            <button onClick={() => fetchGithub(user.login, true)} disabled={refreshing} className="p-3.5 rounded-xl border border-white/5 text-slate-700 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
              <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin text-emerald-400")} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 z-10">
        {/* Connect Screen */}
        {!user && !loading && (
          <div className="flex items-center justify-center min-h-full px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-10">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mx-auto relative group">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all rounded-full" />
                  <Github className="w-12 h-12 text-emerald-400 relative z-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic pr-12 pb-2">Initialize Neural Link</h2>
                  <p className="text-[10px] font-bold text-emerald-500/30 uppercase tracking-[0.25em] max-w-sm mx-auto leading-relaxed">
                    Synchronize your external repositories with the PlacementOS core matrix.
                  </p>
                </div>
              </div>

              <div className="vibe-card !p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-1">GitHub Terminal Username</label>
                   <div className="relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/20" />
                      <input 
                        value={inputVal} 
                        onChange={e => setInputVal(e.target.value)} 
                        onKeyDown={e => e.key === "Enter" && fetchGithub(inputVal)} 
                        placeholder="e.g. neuro-sys-admin" 
                        className="w-full bg-[#08100e] border border-emerald-500/10 rounded-2xl pl-14 pr-6 py-5 text-emerald-400 font-bold placeholder:text-emerald-900/40 focus:border-emerald-500/30 outline-none transition-all text-sm" 
                      />
                   </div>
                </div>
                {error && <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-widest"><AlertCircle className="w-4 h-4" />{error}</div>}
                <button onClick={() => fetchGithub(inputVal)} className="w-full py-5 bg-emerald-500 text-[#040a08] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/20">
                  Execute Link Protocol
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[["Repos", "Live Sync"], ["Health", "Matrix Scan"], ["Stack", "DNA Extract"]].map(([t, d]) => (
                  <div key={t} className="p-4 vibe-card !py-6 text-center space-y-2">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t}</p>
                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.1em]">{d}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-full gap-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-24 h-24 rounded-full border-b-2 border-emerald-500/40" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Github className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Neural Handshake</p>
              <div className="flex gap-1 justify-center">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {user && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 md:px-10 py-6 space-y-8">

            {/* Neural Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-2 vibe-card !p-6 bg-emerald-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <TrendingUp className="w-24 h-24 text-emerald-500" />
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Matrix Overview</span>
                     </div>
                     <div className="flex items-end gap-10">
                        <div className="space-y-1">
                           <p className="text-3xl font-black text-white italic">{totalStars}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">Star Magnitude</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-3xl font-black text-emerald-500 italic">{activeRepos}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">Active Nodes</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-2 vibe-card !p-6 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Stack DNA</span>
                     </div>
                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{repos.length} Repositories</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white/5">
                    {topLangs.map(([lang, count]) => (
                      <motion.div 
                        key={lang} 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(count / repos.length) * 100}%` }} 
                        style={{ backgroundColor: LANG_COLORS[lang] || "#10b981" }} 
                        className="h-full cursor-pointer hover:brightness-125 transition-all" 
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {topLangs.map(([lang, count]) => (
                      <div key={lang} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || "#10b981" }} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{lang}</span>
                        <span className="text-[9px] text-slate-700 font-bold">{((count / repos.length) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Matrix Filters */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500/20 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Filter matrix nodes..." 
                  className="w-full bg-[#08100e] border border-white/[0.03] rounded-2xl pl-16 pr-6 py-3.5 text-white font-bold placeholder:text-slate-800 focus:border-emerald-500/20 outline-none transition-all text-xs" 
                />
              </div>
              <div className="flex gap-3 vibe-card !p-2 bg-[#08100e]">
                {(["updated","stars","forks"] as const).map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSortBy(s)} 
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", 
                      sortBy === s ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-700 hover:text-slate-400"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((repo, i) => {
                  const score = health(repo);
                  const isActive = (Date.now() - new Date(repo.updated_at).getTime()) / 86400000 < 7;
                  return (
                    <motion.button 
                      key={repo.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      transition={{ delay: i * 0.02 }} 
                      onClick={() => setSelected(repo)}
                      className="vibe-card !p-8 text-left hover:bg-emerald-500/[0.02] transition-all group space-y-6 relative"
                    >
                      {isActive && <div className="absolute top-8 right-8 flex items-center gap-2"><span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">Active Node</span><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" /></div>}
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black border-2 bg-emerald-500/5 border-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                              {repo.name.slice(0, 2).toUpperCase()}
                           </div>
                           <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors truncate italic pr-6 pb-1">{repo.name}</h3>
                              <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-1">{repo.language || "Agnostic"}</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2 h-10">{repo.description || "No transmission description available for this node."}</p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/[0.03]">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700">Integrity Scan</span>
                          <span className={cn("text-[10px] font-black", score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-500" : "text-slate-600")}>{score}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className={cn("h-full rounded-full", score >= 80 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : score >= 60 ? "bg-emerald-800" : "bg-slate-800")} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-slate-800" /><span className="text-[10px] font-black text-slate-600">{repo.stargazers_count}</span></div>
                          <div className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5 text-slate-800" /><span className="text-[10px] font-black text-slate-600">{repo.forks_count}</span></div>
                        </div>
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{timeAgo(repo.updated_at)}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && <div className="vibe-card !p-20 text-center text-slate-800 text-[10px] font-black uppercase tracking-[0.5em] italic">Zero nodes detected in filtered sector.</div>}
            
            <div className="text-center pt-8">
              <button onClick={() => { setUser(null); setRepos([]); localStorage.removeItem("gh_username"); }} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 hover:text-emerald-400 transition-all">De-authenticate Neural Uplink</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Neural Detail Side Panel */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 35, stiffness: 300 }} className="relative w-full max-w-lg bg-[#040a08] border-l border-emerald-500/10 h-full flex flex-col overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
              <div className="p-10 border-b border-white/[0.03] space-y-6 shrink-0 bg-emerald-500/[0.02]">
                <div className="flex items-start justify-between">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-xl font-black text-emerald-400">
                      {selected.name.slice(0, 2).toUpperCase()}
                   </div>
                   <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic pr-12 pb-2">{selected.name}</h2>
                   <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em]">{selected.full_name}</p>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{selected.description || "Node description: missing telemetry data."}</p>
              </div>

              <div className="p-10 space-y-10 flex-1">
                <div className="vibe-card !p-8 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/40">Integrity Coefficient</p>
                    <span className="text-3xl font-black text-emerald-400 italic">{health(selected)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#08100e] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${health(selected)}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[["Magnitude", selected.stargazers_count, Star], ["Forks", selected.forks_count, GitFork], ["Observers", selected.watchers_count, Eye], ["Anomalies", selected.open_issues_count, AlertCircle]].map(([l, v, Icon]: any) => (
                    <div key={l} className="vibe-card !p-6 flex items-center gap-4 bg-[#08100e]">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center">
                         <Icon className="w-4 h-4 text-emerald-500/40" />
                      </div>
                      <div>
                         <p className="text-[8px] font-black uppercase tracking-widest text-slate-700">{l}</p>
                         <p className="text-xl font-black text-white italic">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/40">Matrix Properties</h4>
                  <div className="vibe-card !p-0 bg-[#08100e] overflow-hidden divide-y divide-white/[0.03]">
                    {[["DNA Signature", selected.language || "Agnostic"], ["Master Node", selected.default_branch], ["Memory Weight", `${(selected.size / 1024).toFixed(1)} MB`], ["Created At", new Date(selected.created_at).toLocaleDateString()], ["Last Sync", timeAgo(selected.updated_at)]].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center p-5 group hover:bg-emerald-500/[0.01] transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 group-hover:text-emerald-900 transition-colors">{l}</span>
                        <span className="text-[10px] font-black text-slate-400 italic">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.topics.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/40">Neural Tags</p>
                    <div className="flex flex-wrap gap-2">{selected.topics.map(t => <span key={t} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-xl uppercase tracking-widest italic">{t}</span>)}</div>
                  </div>
                )}

                <a href={selected.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 w-full py-6 bg-emerald-500 text-[#040a08] rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/30">
                  <Github className="w-5 h-5" /> Access GitHub Node <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

