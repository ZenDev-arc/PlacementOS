"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Code2, TrendingUp, Rocket, CheckCircle2,
  Zap, Target, BookOpen, Layers, GitBranch, Clock,
  ChevronRight, Star, Trophy, Brain, BarChart3,
  Cpu, Shield, ArrowRight, Terminal, Briefcase, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardSnapshot } from "@/services/placementos-api";
import { useAuth } from "@clerk/nextjs";

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = value / (duration * 60);
    const t = setInterval(() => {
      s += step;
      if (s >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(s));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}</>;
}

const QUICK_LINKS = [
  { label: "DSA Arena",    href: "/dsa",          icon: Code2,     color: "#10b981", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.2)" },
  { label: "Foundations",  href: "/subjects",     icon: BookOpen,  color: "#06b6d4", bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.2)" },
  { label: "Projects",     href: "/projects",     icon: Layers,    color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",   border: "rgba(14,165,233,0.2)" },
  { label: "Pipeline",     href: "/applications", icon: Rocket,    color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)" },
  { label: "AI Mentor",    href: "/ai",           icon: Brain,     color: "#f43f5e", bg: "rgba(244,63,94,0.08)",    border: "rgba(244,63,94,0.2)" },
  { label: "Analytics",   href: "/pulse",         icon: BarChart3, color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
];

const PULSE_METRICS = [
  { id: "logic",     label: "Logic (DSA)",     icon: Brain,      color: "#8b5cf6", value: 85 },
  { id: "theory",    label: "Theory (Core)",    icon: Terminal,   color: "#10b981", value: 62 },
  { id: "projects",  label: "Forge (Builds)",   icon: Layers,     color: "#f59e0b", value: 78 },
  { id: "habits",    label: "Rituals (Consistency)", icon: Target, color: "#f43f5e", value: 92 },
  { id: "strategy",  label: "Strategy (Apps)",  icon: Briefcase,  color: "#a78bfa", value: 45 },
];

export default function Dashboard() {
  const { isLoaded, userId, getToken } = useAuth();
  const [dsaCount, setDsaCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aiHours, setAiHours] = useState(0);
  const [githubRepos, setGithubRepos] = useState(0);
  const [readiness, setReadiness] = useState(0);
  const [curvePath, setCurvePath] = useState("M 0 80 L 100 80");
  const [activityPoints, setActivityPoints] = useState<{x: number, y: number}[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pulseMetrics, setPulseMetrics] = useState(PULSE_METRICS);
  const [activeMetric, setActiveMetric] = useState(PULSE_METRICS[0]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [userName, setUserName] = useState("User");
  
  const fetchStats = async () => {
    if (!isLoaded || !userId) return;
    try {
      const token = await getToken();
      const data = await getDashboardSnapshot(token || undefined);
      if (!data) return;

      setUserName(data.user || "User");
      setReadiness(data.readiness_score || 0);
      setDsaCount(data.stats?.dsa_solved || 0);
      setStreak(data.stats?.streak || 0);
      setAiHours(data.stats?.ai_hours || 0);
      setGithubRepos(data.stats?.github_repos || 0);
      if (data.recent_logs) setLogs(data.recent_logs);
      
      if (data.pulse_metrics) {
        const merged = PULSE_METRICS.map(m => {
          const match = data.pulse_metrics.find((pm: any) => pm.id === m.id);
          return match ? { ...m, value: match.value } : m;
        });
        setPulseMetrics(merged);
        setActiveMetric(merged[0]);
      }
      
      // Activity Chart Data
      if (data.activity_chart && Array.isArray(data.activity_chart)) {
        const points = data.activity_chart.map((v: number, i: number) => ({ x: (i / 6) * 100, y: 100 - v }));
        setActivityPoints(points);
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cpX = (p0.x + p1.x) / 2;
          path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        setCurvePath(path);
      }

      if (data.today_plan && Array.isArray(data.today_plan)) {
        setTasks(data.today_plan.map((t: any, i: number) => ({
          id: i,
          title: t.task || t.title || t,
          tag: t.category || "Roadmap",
          msg: t.description || "Daily target from AI mentor",
          done: false,
          color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)"
        })));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) fetchStats();
  }, [isLoaded, userId]);

  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 17 ? "Good afternoon" : "Good evening";

  const addLog = (msg: string, type = "info") => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs(p => [{ time: t, msg, type }, ...p].slice(0, 6));
  };

  const toggleTask = (id: number) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) addLog(`Completed: ${task.title}`, "success");
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden vibe-obsidian bg-[#050508]">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-matte-blue/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header Bar */}
      <div className="relative z-10 shrink-0 px-8 py-4 border-b border-white/[0.03] flex items-center justify-between"
        style={{ background: "rgba(8,8,12,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-matte-blue flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-matte-blue">PlacementOS</p>
            <p className="text-[14px] font-bold text-slate-100 tracking-tight">{greeting}, {userName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-mono font-black text-slate-400 tracking-wider">
               {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
             </span>
          </div>
          <button onClick={() => { setIsScanning(true); setTimeout(() => setIsScanning(false), 2000); }}
            className="px-5 py-2 rounded-xl bg-matte-blue/10 border border-matte-blue/20 text-matte-blue text-[10px] font-black uppercase tracking-widest hover:bg-matte-blue hover:text-white transition-all">
            {isScanning ? "Scanning..." : "System Check"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 space-y-8">
        
        {/* Row 1: Readiness & Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-4 vibe-card relative group">
            <div className="flex flex-col h-full justify-between gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-matte-blue/10 border border-matte-blue/20 text-[9px] font-black text-matte-blue uppercase tracking-widest italic">Readiness Protocol</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter"><AnimatedCounter value={readiness} />%</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Placement Probability Index</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                  {readiness < 60 ? "Current vector insufficient. Accelerate DSA output." : "Optimal vector detected. Maintain current ritual frequency."}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-matte-blue">
                  <span>Progress to Alpha</span>
                  <span>{readiness}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${readiness}%` }} className="h-full bg-matte-blue shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="xl:col-span-8 vibe-card !p-0 flex flex-col md:flex-row overflow-hidden min-h-[340px]">
            <div className="flex-1 flex items-center justify-center p-8 bg-[#040406] relative border-r border-white/[0.03]">
               <svg width="260" height="260" viewBox="0 0 400 400" className="relative z-10">
                  <g transform="translate(200, 200)">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((l, i) => (
                      <circle key={i} cx="0" cy="0" r={140 * l} className="fill-none stroke-white/[0.04] stroke-[0.5]" strokeDasharray="4 4" />
                    ))}
                    {pulseMetrics.map((m, i) => {
                      const angle = (i * Math.PI * 2) / pulseMetrics.length - Math.PI / 2;
                      const isActive = activeMetric.id === m.id;
                      return (
                        <g key={i}>
                          <line x1="0" y1="0" x2={140 * Math.cos(angle)} y2={140 * Math.sin(angle)} 
                            className={cn("transition-all duration-700", isActive ? "stroke-white/20" : "stroke-white/[0.02]")} />
                          <text x={180 * Math.cos(angle)} y={180 * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle"
                            className={cn("text-[9px] font-black uppercase tracking-[0.2em] transition-all", isActive ? "fill-white" : "fill-slate-700")}>
                            {m.label.split(" ")[0]}
                          </text>
                        </g>
                      )
                    })}
                    <motion.polygon
                      animate={{
                        points: pulseMetrics.map((m, i) => {
                          const angle = (i * Math.PI * 2) / pulseMetrics.length - Math.PI / 2;
                          return `${140 * (m.value / 100) * Math.cos(angle)},${140 * (m.value / 100) * Math.sin(angle)}`;
                        }).join(" ")
                      }}
                      className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />

                    {/* Data Point Markers */}
                    {pulseMetrics.map((m, i) => {
                      const angle = (i * Math.PI * 2) / pulseMetrics.length - Math.PI / 2;
                      const isActive = activeMetric.id === m.id;
                      const dist = 140 * (m.value / 100);
                      return (
                        <motion.circle
                          key={i}
                          animate={{
                            cx: dist * Math.cos(angle),
                            cy: dist * Math.sin(angle),
                            r: isActive ? 4 : 2,
                            fill: isActive ? "#34d399" : "rgba(16,185,129,0.4)"
                          }}
                          className={cn("transition-all duration-300", isActive && "filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]")}
                        />
                      );
                    })}
                  </g>
               </svg>
            </div>
            <div className="w-full md:w-80 flex flex-col p-8 gap-3 bg-[#060609]">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 mb-2">Neural Diagnostics</h3>
               {pulseMetrics.map(m => (
                 <div key={m.id} onMouseEnter={() => setActiveMetric(m)}
                    className={cn("p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer",
                      activeMetric.id === m.id ? "bg-white/[0.04] border-white/[0.08]" : "bg-transparent border-transparent")}
                 >
                    <div className="flex items-center gap-4">
                       <m.icon className="w-4 h-4" style={{ color: m.color }} />
                       <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 group-hover:text-white">{m.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white italic">{m.value}%</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2: Activity & Quick Access */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="xl:col-span-8 vibe-card !p-0 overflow-hidden group">
            <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">System Throughput</h3>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-1">7-Day Activity Analysis</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-slate-800 uppercase tracking-tighter">Peak Vector</span>
                  <span className="text-[10px] font-black text-white italic">{Math.max(...activityPoints.map(p => Math.round(100 - p.y)))}%</span>
                </div>
                <div className="w-[1px] h-6 bg-white/[0.05]" />
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-slate-800 uppercase tracking-tighter">Mean Flow</span>
                  <span className="text-[10px] font-black text-white italic">{Math.round(activityPoints.reduce((a, b) => a + (100 - b.y), 0) / 7)}%</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase">Live Neural Link</span>
                </div>
              </div>
            </div>
            <div className="h-64 relative bg-[#040406] p-8 pb-12">
               <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
                     <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                   </linearGradient>
                 </defs>
                 
                 {/* Subtle Grid */}
                 {[0, 20, 40, 60, 80, 100].map(v => (
                    <line key={v} x1="0" y1={v} x2="100" y2={v} className="stroke-white/[0.03] stroke-[0.2]" />
                 ))}
                 {activityPoints.map((p, i) => (
                    <line key={i} x1={p.x} y1="0" x2={p.x} y2="100" className="stroke-white/[0.03] stroke-[0.2]" />
                 ))}

                 <motion.path d={`${curvePath} L 100 100 L 0 100 Z`} fill="url(#chartGradient)" />
                 <motion.path d={curvePath} fill="none" stroke="#8b5cf6" strokeWidth="0.8" strokeLinecap="round" />
                 
                 {/* Markers */}
                 {activityPoints.map((p, i) => (
                    <g key={i}>
                       <circle cx={p.x} cy={p.y} r="1.2" className="fill-matte-blue stroke-violet-400 stroke-[0.5]" />
                       <circle cx={p.x} cy={p.y} r="3" className="fill-violet-400/20 animate-pulse" />
                    </g>
                 ))}
               </svg>
               
               {/* Axis Labels */}
               <div className="absolute bottom-4 left-8 right-8 flex justify-between">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
                    <span key={day} className="text-[7px] font-black text-slate-800 tracking-tighter">{day}</span>
                  ))}
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="xl:col-span-4 vibe-card space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Jump Points</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map(link => (
                <a key={link.label} href={link.href} 
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: link.bg, borderColor: link.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${link.color}20` }}>
                    <link.icon className="w-5 h-5" style={{ color: link.color }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: link.color }}>{link.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Today's Focus & Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="xl:col-span-7 vibe-card space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Execution Pipeline</h3>
                <span className="text-[10px] font-black text-matte-blue italic">{tasks.filter(t => t.done).length} / {tasks.length} COMPLETE</span>
             </div>
             <div className="space-y-3">
                {tasks.map(task => (
                  <button key={task.id} onClick={() => toggleTask(task.id)}
                    className={cn("w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all",
                      task.done ? "bg-white/[0.01] border-white/[0.05] opacity-50" : "bg-matte-blue/[0.03] border-matte-blue/10 hover:border-matte-blue/30")}
                  >
                    <div className={cn("w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                      task.done ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-white/10")}>
                      {task.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-[13px] font-bold tracking-tight", task.done ? "text-slate-600 line-through" : "text-white")}>{task.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{task.tag}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-800" />
                  </button>
                ))}
             </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="xl:col-span-5 vibe-card !p-0 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/[0.03] bg-white/[0.01]">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Event Stream</h3>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-1">Real-time system events</p>
              </div>
              <div className="flex-1 p-8 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-4 items-start">
                       <span className="text-[9px] font-mono text-slate-700 shrink-0 mt-1">{log.time}</span>
                       <div className="flex items-start gap-3">
                         <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", 
                           log.type === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-matte-blue shadow-[0_0_8px_rgba(139,92,246,0.5)]")} />
                         <span className="text-[11px] font-bold text-slate-500 italic leading-relaxed">{log.msg}</span>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}
