"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Zap, 
  Brain, 
  Target, 
  Briefcase, 
  Layers, 
  Terminal, 
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Cpu,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Metrics Configuration
const METRICS = [
  { id: "logic",     label: "Logic (DSA)",     icon: Brain,      color: "#8b5cf6", value: 85 },
  { id: "theory",    label: "Theory (Core)",    icon: Terminal,   color: "#10b981", value: 62 },
  { id: "projects",  label: "Forge (Builds)",   icon: Layers,     color: "#f59e0b", value: 78 },
  { id: "habits",    label: "Rituals (Consistency)", icon: Target, color: "#f43f5e", value: 92 },
  { id: "strategy",  label: "Strategy (Apps)",  icon: Briefcase,  color: "#a78bfa", value: 45 },
];

export default function PulsePage() {
  const [activeMetric, setActiveMetric] = useState(METRICS[0]);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const overallScore = Math.round(METRICS.reduce((acc, m) => acc + (m.value || 0), 0) / METRICS.length);

  // Radar Chart Helpers
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / METRICS.length;

  const points = METRICS.map((m, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * ((m.value || 0) / 100) * Math.cos(angle);
    const y = center + radius * ((m.value || 0) / 100) * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-void">
      {/* Header */}
      <div className="shrink-0 px-6 md:px-10 py-8 border-b border-white/[0.06] flex flex-col md:flex-row md:items-end justify-between gap-6"
        style={{ background: "rgba(8,8,10,0.8)", backdropFilter: "blur(16px)" }}>
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="flex gap-1"><div className="w-1 h-3 bg-emerald-500/40" /></div>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">DIAGNOSTIC LINK</span>
           </div>
           <h1 className="text-5xl font-black uppercase tracking-tighter text-white">System Pulse</h1>
           <p className="text-slate-400/40 font-bold text-[10px] uppercase tracking-widest max-w-lg leading-relaxed">
             Real-time biometric and performance assessment of your placement readiness.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-center px-8 py-4 smooth-card bg-white/[0.01] border-white/[0.06] space-y-0.5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-400/20">Readiness Score</p>
              <p className="text-4xl font-black text-white">{overallScore}<span className="text-emerald-500 text-sm">%</span></p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Radar Visualization Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[500px] smooth-card bg-white/[0.01] border-white/[0.04] relative">
             <div className="absolute top-6 left-6 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Neural Graph Sync Active</span>
             </div>

             {isSyncing ? (
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Aggregating System Data...</span>
               </div>
             ) : (
               <div className="relative">
                  <svg width={size + 100} height={size + 100} className="filter drop-shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <g transform="translate(50, 50)">
                      {/* Grid Circles */}
                      {gridLevels.map((level, i) => (
                        <circle
                          key={i}
                          cx={center}
                          cy={center}
                          r={radius * level}
                          className="fill-none stroke-white/[0.03] stroke-[1]"
                        />
                      ))}
                      
                      {/* Grid Lines */}
                      {METRICS.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return (
                          <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={center + radius * Math.cos(angle)}
                            y2={center + radius * Math.sin(angle)}
                            className="stroke-white/[0.03] stroke-[1]"
                          />
                        );
                      })}

                      {/* Radar Polygon */}
                      <motion.polygon
                        points={points}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fill-emerald-500/10 stroke-emerald-500 stroke-[2]"
                      />

                      {/* Points */}
                      {METRICS.map((m, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const x = center + radius * ((m.value || 0) / 100) * Math.cos(angle);
                        const y = center + radius * ((m.value || 0) / 100) * Math.sin(angle);
                        return (
                          <motion.g key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill={m.color}
                              className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                            />
                            {/* Labels */}
                            <text
                              x={center + (radius + 35) * Math.cos(angle)}
                              y={center + (radius + 15) * Math.sin(angle)}
                              textAnchor="middle"
                              className="fill-slate-500 text-[8px] font-black uppercase tracking-widest"
                            >
                              {m.label}
                            </text>
                          </motion.g>
                        );
                      })}
                    </g>
                  </svg>
               </div>
             )}
          </div>

          {/* Diagnostics and Insights */}
          <div className="lg:col-span-5 space-y-6">
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">System Diagnosis</h3>
                {METRICS.map((metric) => (
                  <div 
                    key={metric.id}
                    onMouseEnter={() => setActiveMetric(metric)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer",
                      activeMetric.id === metric.id 
                        ? "bg-white/[0.03] border-white/[0.1] shadow-xl" 
                        : "bg-transparent border-white/[0.04] hover:border-white/[0.08]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${metric.color}15`, color: metric.color }}>
                             <metric.icon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white">{metric.label}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-current opacity-40" style={{ width: `${metric.value || 0}%`, color: metric.color }} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500">{metric.value || 0}%</span>
                             </div>
                          </div>
                       </div>
                       {(metric.value || 0) > 80 ? (
                         <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       ) : (metric.value || 0) < 50 ? (
                         <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                       ) : null}
                    </div>
                  </div>
                ))}
             </div>

             {/* AI Verdict */}
             <div className="smooth-card !p-6 bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/10 space-y-4">
                <div className="flex items-center gap-3 text-violet-400">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">AI Mentor Verdict</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 leading-relaxed">
                   <p className="text-white font-bold mb-2">INTELLIGENCE REPORT_</p>
                   {overallScore > 75 ? (
                     "Your system is highly stable. Performance in Logic and Rituals is exceptional. Strategizing for top-tier firm applications is the current bottleneck. Recommending immediate outreach to Senior Recruiters."
                   ) : (
                     "System stabilization required. Low engagement in Strategy and Theory detected. Critical path requires 15h of Foundation study and 5 active job applications to restore operational readiness."
                   )}
                </div>
                <button className="w-full py-3 rounded-xl bg-matte-blue/10 border border-matte-blue/20 text-[9px] font-black uppercase tracking-widest text-matte-blue hover:bg-matte-blue hover:text-white transition-all">
                   View Recommended Roadmap
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
