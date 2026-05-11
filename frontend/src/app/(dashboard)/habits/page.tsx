"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Clock,
  Plus, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Target, 
  Flame, 
  Calendar,
  Settings2,
  BarChart3,
  Dumbbell,
  Book,
  Code,
  Coffee,
  Moon,
  Sun,
  Smile,
  Heart,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getHabits, createHabit, toggleHabit, deleteHabit } from "@/services/placementos-api";
import { useAuth } from "@clerk/nextjs";

const PRESET_ICONS = [
  { icon: Zap,      label: "Energy" },
  { icon: Dumbbell, label: "Workout" },
  { icon: Book,     label: "Read" },
  { icon: Code,     label: "Code" },
  { icon: Coffee,   label: "Ritual" },
  { icon: Moon,     label: "Sleep" },
  { icon: Sun,      label: "Morning" },
  { icon: Smile,    label: "Mood" },
  { icon: Heart,    label: "Health" },
  { icon: Brain,    label: "Focus" },
];

const COLORS = [
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#f43f5e", // rose
  "#a78bfa", // violet
  "#fb7185", // rose-light
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", icon: "Zap", color: "#8b5cf6", target_time: "" });
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isLoaded, userId } = useAuth();

  // Get last 7 days including today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const data = await getHabits(token || undefined);
      setHabits(data);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchHabits();
    }
  }, [isLoaded, userId]);

  const handleToggle = async (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Optimistic UI update
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const exists = h.logs.find((l: any) => l.date.split('T')[0] === dateStr);
        if (exists) {
          return { ...h, logs: h.logs.filter((l: any) => l.date.split('T')[0] !== dateStr) };
        } else {
          return { ...h, logs: [...h.logs, { date: date.toISOString(), completed: true }] };
        }
      }
      return h;
    }));

    try {
      const token = await getToken();
      await toggleHabit(habitId, dateStr, token || undefined);
    } catch (err) {
      fetchHabits(); // Rollback
    }
  };

  const handleAdd = async () => {
    if (!newHabit.name.trim()) return;
    try {
      const token = await getToken();
      const res = await createHabit(newHabit, token || undefined);
      setHabits(p => [...p, res]);
      setNewHabit({ name: "", icon: "Zap", color: "#8b5cf6", target_time: "" });
      setIsAdding(false);
    } catch (err) {
      alert("Failed to create habit");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Proceeding with deletion of:", id);
      const token = await getToken();
      setHabits(p => p.filter(h => h.id !== id));
      await deleteHabit(id, token || undefined);
      console.log("Deletion successful for:", id);
    } catch (err) {
      console.error("Deletion failed:", err);
      fetchHabits(); // Rollback
    }
  };

  const calculateStreak = (logs: any[]) => {
    if (!logs || logs.length === 0) return 0;
    const completedDates = new Set(logs.map(l => {
      const d = new Date(l.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (completedDates.has(dateStr)) streak++;
      else if (i === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        if (!completedDates.has(yestStr)) return 0;
        continue;
      } else break;
    }
    return streak;
  };

  const totalXP = habits.reduce((acc, h) => acc + (h.logs?.length || 0) * 50, 0);
  const systemLevel = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;

  return (
    <div className="flex flex-col h-screen overflow-hidden vibe-solar bg-void">
      {/* Header */}
      <div className="shrink-0 px-6 md:px-10 py-6 border-b border-white/[0.03] flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#080604]/80 backdrop-blur-2xl">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                 <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
              </div>
              <span className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em]">Ritual Matrix</span>
           </div>
           <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">Life Rituals</h1>
           <p className="text-slate-600 font-bold text-[9px] uppercase tracking-widest max-w-lg leading-relaxed mt-1 opacity-60">
             High-frequency consistency is the catalyst for professional evolution.
           </p>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80">Solar Level {systemLevel}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{xpInLevel}/500 XP</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/[0.05]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpInLevel/500) * 100}%` }}
                  className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                />
              </div>
           </div>
           
           <button
             onClick={() => setIsAdding(true)}
             className="flex items-center gap-2 bg-amber-500 text-void px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-amber-500/20"
           >
             <Plus className="w-3.5 h-3.5" /> Initialize Ritual
           </button>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-10 pb-32">
        {isLoading && habits.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-56 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-8 opacity-40">
             <Sun className="w-16 h-16 text-amber-500/20 animate-pulse" />
             <div>
                <p className="text-xl font-black text-white uppercase tracking-tighter">Zero active rituals detected</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Deploy your first ritual to begin synchronization</p>
             </div>
             <button onClick={() => setIsAdding(true)} className="px-8 py-4 rounded-2xl border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-all">
                Boot Ritual Engine
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {habits.map((habit) => {
              const streak = calculateStreak(habit.logs);
              return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="vibe-card flex flex-col gap-4 group !p-6"
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                        style={{ background: `${habit.color}15`, borderWidth: '1px', borderStyle: 'solid', borderColor: `${habit.color}35`, color: habit.color, boxShadow: `0 10px 30px ${habit.color}10` }}>
                        {(() => {
                          const Icon = PRESET_ICONS.find(i => i.label.toLowerCase() === habit.icon?.toLowerCase())?.icon || Zap;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">{habit.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                           <div className="flex items-center gap-2">
                              <Flame className={cn("w-4 h-4", streak > 0 ? "text-amber-500" : "text-slate-800")} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {streak} Day Sequence
                              </span>
                           </div>
                           {habit.target_time && (
                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                               <Clock className="w-3.5 h-3.5 text-slate-600" />
                               <span className="text-[10px] font-bold tracking-tighter text-slate-400">
                                 {habit.target_time}
                               </span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(habit.id); }} 
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Matrix Control */}
                  <div className="grid grid-cols-7 gap-2">
                    {last7Days.map((day, idx) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const isCompleted = habit.logs.find((l: any) => l.date.split('T')[0] === dateStr);
                      const isToday = idx === 6;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-4">
                          <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", isToday ? "text-amber-500" : "text-slate-700")}>
                            {day.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                          </span>
                          <button
                            onClick={() => handleToggle(habit.id, day)}
                            className={cn(
                              "w-full aspect-square rounded-2xl border transition-all flex items-center justify-center relative overflow-hidden group/btn",
                              isCompleted 
                                ? "shadow-2xl" 
                                : "bg-white/[0.01] border-white/[0.03] hover:border-white/10 hover:bg-white/[0.03]"
                            )}
                            style={isCompleted ? { background: habit.color, borderColor: habit.color, boxShadow: `0 12px 24px ${habit.color}40` } : {}}
                          >
                            {isCompleted && <Check className="w-6 h-6 text-void stroke-[4] animate-scale-in" />}
                            {!isCompleted && isToday && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-ping" />
                               </div>
                            )}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Advanced Analytics Bar */}
                  <div className="mt-4 pt-6 border-t border-white/[0.03] flex items-center justify-between">
                     <div className="flex gap-1.5">
                        {Array.from({ length: 14 }).map((_, i) => (
                           <div key={i} className={cn("w-2 h-1 rounded-full", i < streak ? "bg-amber-500" : "bg-white/[0.02]")} />
                        ))}
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Telemetry Active</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl vibe-card !p-12 space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-[#0a0a0f] border-white/[0.03]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500">
                   <Sun className="w-4 h-4 animate-spin-slow" />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em]">Solar Initialization</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">Deploy Ritual</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Ritual Designation</label>
                  <input
                    autoFocus
                    placeholder="E.G. NEURAL REWIRING (DSA)"
                    value={newHabit.name}
                    onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-8 py-6 text-white font-bold placeholder:text-slate-700/40 focus:border-amber-500/30 outline-none transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Temporal Target</label>
                      <div className="relative group">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                        <input
                          type="time"
                          value={newHabit.target_time}
                          onChange={e => setNewHabit(p => ({ ...p, target_time: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-16 pr-6 py-6 text-white font-bold focus:border-amber-500/20 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Core Identity</label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_ICONS.slice(0, 5).map(i => {
                          const Icon = i.icon;
                          const isActive = newHabit.icon === i.label;
                          return (
                            <button key={i.label} onClick={() => setNewHabit(p => ({ ...p, icon: i.label }))}
                              className={cn(
                                "w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
                                isActive ? "bg-amber-500 border-amber-500 text-void" : "bg-white/[0.03] border-white/[0.06] text-slate-700 hover:text-white"
                              )}>
                              <Icon className="w-5 h-5" />
                            </button>
                          );
                        })}
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Signature Spectrum</label>
                  <div className="flex gap-4">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setNewHabit(p => ({ ...p, color: c }))}
                        className={cn(
                          "w-10 h-10 rounded-2xl transition-all relative overflow-hidden",
                          newHabit.color === c ? "scale-110 ring-4 ring-amber-500/20 border-2 border-white/20" : "opacity-30 hover:opacity-100"
                        )}
                        style={{ background: c }}
                      >
                         {newHabit.color === c && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleAdd} className="flex-1 bg-amber-500 text-void py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-2xl shadow-amber-500/20">
                  Execute Deployment
                </button>
                <button onClick={() => setIsAdding(false)} className="px-8 py-6 border border-white/[0.06] rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-white hover:bg-white/[0.02] transition-all">
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
