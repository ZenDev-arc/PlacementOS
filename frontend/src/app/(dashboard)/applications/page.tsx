"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, Clock, Zap, X, ChevronRight, Search, ExternalLink, AlertCircle, CheckCircle2, Briefcase, TrendingUp, Target, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInternshipApplications, createInternshipApplication, updateInternshipApplication, deleteInternshipApplication } from "@/services/placementos-api";
import { useAuth } from "@clerk/nextjs";

const STAGES = ["Identified","Applied","OA","Interview","Offer","Rejected"];
const STAGE_META: Record<string, { color: string; bg: string; border: string }> = {
  Identified: { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
  Applied:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)" },
  OA:         { color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)" },
  Interview:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" },
  Offer:      { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)" },
  Rejected:   { color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.2)" },
};

const getMeta = (status: string) => {
  const s = status === "OA" ? "OA" : (status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase());
  return STAGE_META[s] || STAGE_META["Identified"];
};

const DEFAULT_APPS = [
  { id:"1", company:"Stripe",   role:"Software Engineer",    status:"Applied",   date:"2024-05-01", match:92, link:"", notes:"Applied via referral.", salary:"28-35 LPA" },
  { id:"2", company:"Google",   role:"SDE Intern",           status:"OA",        date:"2024-04-25", match:78, link:"", notes:"OA due in 2 days.",     salary:"20-25 LPA" },
  { id:"3", company:"Vercel",   role:"Frontend Developer",   status:"Interview", date:"2024-04-28", match:88, link:"", notes:"L1 cleared. L2 pending.", salary:"25-32 LPA" },
  { id:"4", company:"Coinbase", role:"Backend Engineer",     status:"Identified",date:"2024-05-05", match:74, link:"", notes:"Check eligibility.",      salary:"30-40 LPA" },
  { id:"5", company:"Figma",    role:"Product Engineer",     status:"Offer",     date:"2024-04-20", match:95, link:"", notes:"Offer: 30 LPA CTC",       salary:"30 LPA" },
];

function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

export default function PipelinePage() {
  const [apps, setApps] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [selected, setSelected] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ company:"", role:"", link:"", salary:"", notes:"", status:"Identified" });

  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const data = await getInternshipApplications(token || undefined);
      const normalized = data.map(app => ({
        ...app,
        status: app.status ? (app.status.toUpperCase() === "OA" ? "OA" : app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()) : "Identified"
      }));
      setApps(normalized);
    } catch (err) {
      console.error("Failed to fetch apps:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchApps();
  }, []);

  const addApp = async () => {
    if (!form.company || !form.role) return;
    try {
      const token = await getToken();
      const res = await createInternshipApplication({
        company_name: form.company,
        role_title: form.role,
        platform: "direct",
        status: form.status as any,
        notes: form.notes,
        salary: form.salary,
        link: form.link
      }, token || undefined);
      const newApp = {
        ...res,
        status: res.status ? (res.status.toUpperCase() === "OA" ? "OA" : res.status.charAt(0).toUpperCase() + res.status.slice(1).toLowerCase()) : "Identified"
      };
      setApps(p => [newApp, ...p]);
      setForm({ company: "", role: "", link: "", salary: "", notes: "", status: "Identified" });
      setIsAdding(false);
    } catch (err) {
      alert("Failed to add application");
    }
  };

  const moveStage = async (id: string, dir: number) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    const idx = STAGES.indexOf(app.status);
    const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, idx + dir))];
    
    try {
      const token = await getToken();
      setApps(p => p.map(a => a.id === id ? { ...a, status: next } : a));
      await updateInternshipApplication(id, { status: next } as any, token || undefined);
    } catch (err) {
      fetchApps();
    }
  };

  const deleteApp = async (id: string) => {
    try {
      const token = await getToken();
      setApps(p => p.filter(a => a.id !== id));
      setSelected(null);
      await deleteInternshipApplication(id, token || undefined);
    } catch (err) {
      fetchApps();
    }
  };

  const filtered = apps
    .filter(a => filterStage === "All" || (a.status || "").toLowerCase() === filterStage.toLowerCase())
    .filter(a => 
      (a.company_name || "").toLowerCase().includes(search.toLowerCase()) || 
      (a.role_title || "").toLowerCase().includes(search.toLowerCase())
    );

  const byStage = (s: string) => filtered.filter(a => (a.status || "").toLowerCase() === s.toLowerCase());
  const totalApplied = apps.filter(a => !["identified","rejected"].includes((a.status || "").toLowerCase())).length;
  const interviews = apps.filter(a => (a.status || "").toLowerCase() === "interview").length;
  const offers = apps.filter(a => (a.status || "").toLowerCase() === "offer").length;
  const successRate = totalApplied > 0 ? Math.round((offers / totalApplied) * 100) : 0;

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden vibe-crimson relative">
      {/* Power Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-600/20 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-10 py-8 border-b border-white/[0.03] flex items-center justify-between relative z-10"
        style={{ background: "rgba(6,6,8,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-6">
           <div className="w-1.5 h-8 bg-rose-600 shadow-[0_0_15px_#e11d48]" />
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500/60 mb-1">Execution Pipeline</p>
             <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">Job Hunter</h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {[
              { label:"Applied", value: totalApplied, color:"#e11d48" },
              { label:"Offers", value: offers, color:"#10b981" },
              { label:"Success", value:`${successRate}%`, color:"#fff" },
            ].map(s => (
              <div key={s.label} className="vibe-card !px-5 !py-3 bg-white/[0.01]">
                <p className="text-2xl font-black tracking-tighter" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-white transition-all bg-rose-600 shadow-[0_10px_30px_rgba(225,29,72,0.25)] hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" /> Add Job
          </button>
        </div>
      </div>

      {/* Command Bar */}
      <div className="shrink-0 px-10 py-5 border-b border-white/[0.03] flex items-center justify-between bg-[#08080a]/40 relative z-10">
        <div className="flex items-center gap-8">
           <div className="relative group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Target Entity..."
                className="pl-11 pr-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-300 outline-none transition-all w-72 bg-white/[0.01] border border-white/[0.05] focus:border-rose-500/30" 
              />
           </div>
           <div className="flex gap-2">
             {["All", ...STAGES].map(s => (
               <button key={s} onClick={() => setFilterStage(s)}
                 className={cn("px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                   filterStage === s ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-transparent border-transparent text-slate-700 hover:text-slate-400"
                 )}
               >{s}</button>
             ))}
           </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#08080a]/20 relative z-10">
        <div className="flex gap-6 h-full p-10 min-w-max">
          {STAGES.filter(s => filterStage === "All" || filterStage === s).map(stage => {
            const meta = getMeta(stage);
            const cards = byStage(stage);
            return (
              <div key={stage} className="w-80 shrink-0 flex flex-col h-full">
                {/* Column header */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40 italic">{stage}</span>
                  </div>
                  <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-600">
                    {cards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  <AnimatePresence mode="popLayout">
                    {cards.map((app, i) => {
                      const days = app.date_applied ? daysSince(app.date_applied) : 0;
                      const overdue = days > 7 && app.status === "Applied";
                      return (
                        <motion.div key={app.id} layout initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} transition={{ delay: i * 0.05 }}
                          onClick={() => setSelected(app)}
                          className="vibe-card !p-6 cursor-pointer group hover:scale-[1.02] transition-all relative overflow-hidden"
                          style={{ borderLeft: selected?.id === app.id ? `4px solid ${meta.color}` : '1px solid rgba(255,255,255,0.03)' }}
                        >
                          {overdue && (
                            <div className="absolute top-0 right-0 p-2">
                               <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black shrink-0 bg-white/[0.02] border border-white/[0.05] group-hover:border-white/[0.1] transition-all"
                              style={{ color: meta.color }}>
                              {app.company_name.slice(0,2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-black text-white truncate uppercase tracking-tight">{app.company_name}</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate mt-0.5">{app.role_title}</p>
                            </div>
                          </div>

                          <div className="space-y-3 mb-5">
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">Match Probability</span>
                              <span className="text-sm font-black italic" style={{ color: meta.color }}>{app.match_score || 0}%</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden bg-white/[0.02] border border-white/[0.03]">
                              <motion.div initial={{ width:0 }} animate={{ width:`${app.match_score || 0}%` }} transition={{ duration:1 }}
                                className="h-full rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}40` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/[0.03] pt-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-800" />
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{!app.date_applied ? "INSTANT" : days === 0 ? "TODAY" : `${days}D ELAPSED`}</span>
                            </div>
                            {app.salary && <span className="text-[9px] font-black text-rose-500 italic bg-rose-500/5 px-2 py-1 rounded-lg">{app.salary}</span>}
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-6 pt-4 border-t border-white/[0.03] flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={e => { e.stopPropagation(); moveStage(app.id, 1); }}
                                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-rose-600 text-white shadow-xl hover:scale-105 active:scale-95">
                                ADVANCE <ArrowRight className="w-4 h-4" />
                             </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail HUD Overlay */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ type:"spring", damping:30, stiffness:200 }}
              className="relative w-full max-w-lg h-full flex flex-col bg-[#08080c] border-l border-white/[0.05] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              
              <div className="p-10 border-b border-white/[0.03] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-4 bg-rose-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">{selected.status} Phase</span>
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{selected.company_name}</h2>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">{selected.role_title}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white transition-all bg-white/[0.02] border border-white/[0.05]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                {/* Stats Matrix */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="vibe-card !p-6 bg-white/[0.01]">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 mb-3">Probability Index</p>
                      <p className="text-4xl font-black text-rose-500 italic">{selected.match_score || 0}%</p>
                   </div>
                   <div className="vibe-card !p-6 bg-white/[0.01]">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 mb-3">Compensation</p>
                      <p className="text-2xl font-black text-white truncate">{selected.salary || "N/A"}</p>
                   </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white opacity-30">Engagement Timeline</p>
                  <div className="space-y-1">
                    {[
                      ["Initial Contact", selected.date_applied ? new Date(selected.date_applied).toLocaleDateString() : "Just now"],
                      ["Current Latency", `${selected.date_applied ? daysSince(selected.date_applied) : 0} Cycles`],
                      ["Priority Level", "HIGH EXPOSURE"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center py-4 border-b border-white/[0.02]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{l}</span>
                        <span className="text-[11px] font-black text-slate-200 italic">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Intelligence */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white opacity-30">Mission Notes</p>
                  <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Briefcase className="w-16 h-16" />
                    </div>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed italic">
                       {selected.notes || "No additional intelligence provided for this target."}
                    </p>
                  </div>
                </div>

                {/* Action Protocols */}
                <div className="space-y-4 pt-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white opacity-30">System Protocols</p>
                   <div className="grid grid-cols-2 gap-3">
                      {selected.link && (
                        <a href={selected.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08]">
                          Link <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => deleteApp(selected.id)}
                        className="flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all bg-rose-600/5 border border-rose-600/20 hover:bg-rose-600/10">
                        Terminate <AlertCircle className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Target Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity:0, scale:0.9, y:40 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:40 }}
              className="relative w-full max-w-xl rounded-[3rem] p-12 bg-[#0a0a0e] border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden">
              
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Target className="w-32 h-32 text-rose-600" />
              </div>

              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1 h-3 bg-rose-600" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Operation: New Contact</p>
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Deploy Application</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Target Entity</label>
                      <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                        placeholder="Google, Apple, etc."
                        className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all bg-white/[0.02] border border-white/[0.05] focus:border-rose-500/40" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Designation</label>
                      <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                        placeholder="Lead Engineer"
                        className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all bg-white/[0.02] border border-white/[0.05] focus:border-rose-500/40" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Secure Link</label>
                   <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                     placeholder="https://careers.target.com/..."
                     className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all bg-white/[0.02] border border-white/[0.05] focus:border-rose-500/40" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Compensation</label>
                      <input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                        placeholder="e.g. 40 LPA"
                        className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all bg-white/[0.02] border border-white/[0.05] focus:border-rose-500/40" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Initial Vector</label>
                      <select 
                        value={form.status} 
                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all bg-[#0a0a0e] border border-white/[0.05] focus:border-rose-500/40 appearance-none"
                      >
                         {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Intelligence Brief</label>
                   <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                     placeholder="Additional details..."
                     rows={3}
                     className="w-full px-6 py-4 rounded-2xl text-[11px] font-black text-white outline-none transition-all bg-white/[0.02] border border-white/[0.05] focus:border-rose-500/40 resize-none italic" />
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button onClick={addApp}
                  className="flex-1 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all bg-rose-600 shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-95">
                  Authorize Deployment
                </button>
                <button onClick={() => setIsAdding(false)}
                  className="px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 transition-all bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05]">
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
