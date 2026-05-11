"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  Zap, 
  ArrowUpRight,
  Flame,
  BarChart3,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const pastReports = [
  { id: "1", week: "Apr 28 - May 04", score: 84, delta: +4 },
  { id: "2", week: "Apr 21 - Apr 27", score: 80, delta: +6 },
  { id: "3", week: "Apr 14 - Apr 20", score: 74, delta: -2 },
];

export default function ReportsPage() {
  const [selectedId, setSelectedId] = useState("1");
  const [scoreCount, setScoreCount] = useState(0);

  useEffect(() => {
    const report = pastReports.find(r => r.id === selectedId);
    if (report) {
      setScoreCount(report.score - (report.delta > 0 ? report.delta : 0));
      const duration = 1000;
      const steps = 60;
      const final = report.score;
      const increment = (final - (report.score - (report.delta > 0 ? report.delta : 0))) / steps;
      let current = report.score - (report.delta > 0 ? report.delta : 0);
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= final) || (increment < 0 && current <= final)) {
          setScoreCount(final);
          clearInterval(timer);
        } else {
          setScoreCount(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [selectedId]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Sidebar Timeline */}
      <div className="w-64 border-r border-white/5 flex flex-col p-4 space-y-5 bg-black/20">
        <header className="space-y-1">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Weekly Reports</h2>
          <p className="text-[9px] text-pale-silver/20 font-black uppercase tracking-widest">Past Performance History</p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
           {pastReports.map((report) => (
             <div 
              key={report.id}
              onClick={() => setSelectedId(report.id)}
              className={cn(
                "relative pl-6 py-3 cursor-pointer group transition-all rounded-xl",
                selectedId === report.id ? "bg-white/[0.03] border border-white/5" : "opacity-40 hover:opacity-100"
              )}
             >
                <div className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
                  selectedId === report.id ? "bg-matte-blue scale-125" : "bg-white/10"
                )} />

                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-pale-silver/20 uppercase tracking-widest">{report.week}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-white/80">Score: {report.score}%</p>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest",
                      report.delta > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {report.delta > 0 ? `+${report.delta}` : report.delta}
                    </span>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Report Body */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <header className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between border-b border-white/5 pb-6">
              <div className="space-y-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-matte-blue/5 border border-matte-blue/10 rounded-full w-fit">
                    <Calendar className="w-3 h-3 text-matte-blue" />
                    <span className="text-[8px] font-black text-matte-blue uppercase tracking-widest">Report: {pastReports.find(r => r.id === selectedId)?.week}</span>
                 </div>
                 <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Readiness Report</h1>
               </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[8px] font-black text-pale-silver/20 uppercase tracking-[0.2em] mb-1">Global Score</p>
                  <div className="flex items-center gap-3">
                     <span className="text-4xl font-black tracking-tighter text-white">
                       {scoreCount}%
                     </span>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
                      pastReports.find(r => r.id === selectedId)?.delta! > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {pastReports.find(r => r.id === selectedId)?.delta! > 0 ? <TrendingUp className="w-3.5 h-3.5"/> : <TrendingDown className="w-3.5 h-3.5"/>}
                      {pastReports.find(r => r.id === selectedId)?.delta! > 0 ? `+${pastReports.find(r => r.id === selectedId)?.delta}` : pastReports.find(r => r.id === selectedId)?.delta}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="smooth-card !p-8 h-48 flex flex-col justify-between overflow-hidden group bg-white/[0.01]">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-pale-silver/20">Progress Trajectory</h3>
                  <BarChart3 className="w-4 h-4 text-white/5" />
               </div>
               <div className="flex-1 relative">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d="M 0 180 Q 250 160 500 100 T 1000 40" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#87ceeb" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
               </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                   <Target className="w-4 h-4 text-matte-blue" />
                   Category Breakdown
                 </h3>
                 <div className="space-y-4 smooth-card !p-6 bg-white/[0.01]">
                   <DomainBar label="DSA Practice" score={88} delta={+5} />
                   <DomainBar label="Core Knowledge" score={72} delta={-3} status="warning" />
                   <DomainBar label="System Design" score={45} delta={+12} />
                   <DomainBar label="Project Health" score={94} delta={+2} />
                 </div>
               </section>

               <section className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500" />
                   AI Insights
                 </h3>
                 <div className="smooth-card !p-6 bg-white/[0.01] space-y-6">
                    <p className="text-[11px] font-medium leading-relaxed text-pale-silver/60">
                      Significant improvement in <span className="text-white font-bold">DSA consistency</span>. Solve rate on Graphs is up to 68%. BFS/DFS patterns are now stable.
                    </p>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Focus Areas</p>
                        <p className="text-[9px] text-pale-silver/40 font-medium">Core CS scores (OS/DBMS) are lagging. Suggest adding 2 revision blocks for Virtual Memory and Indexing.</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-matte-blue font-black uppercase text-[8px] tracking-[0.3em] hover:text-white transition-colors">
                      Full Analysis <ArrowUpRight className="w-3 h-3" />
                    </button>
                 </div>
               </section>
            </div>

            <div className="flex gap-4">
               <div className="flex-1 p-6 smooth-card bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between group cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-matte-blue/5 flex items-center justify-center text-matte-blue border border-matte-blue/10">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-tight text-white/80">Study Plan</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-pale-silver/20">Updated study schedule</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-matte-blue transition-all" />
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DomainBar({ label, score, delta, status = "default" }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[8px] font-black text-pale-silver/40 uppercase tracking-widest block mb-0.5">{label}</span>
          <span className="text-xs font-black text-white">{score}%</span>
        </div>
        <span className={cn(
          "text-[8px] font-black",
          delta > 0 ? "text-emerald-500" : "text-rose-500"
        )}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1 }}
          className={cn(
            "h-full rounded-full relative",
            status === 'warning' ? "bg-amber-500/60" : "bg-matte-blue/60"
          )}
        />
      </div>
    </div>
  );
}
