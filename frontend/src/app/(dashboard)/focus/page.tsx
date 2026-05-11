"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Brain, 
  Coffee, 
  Moon, 
  Settings2,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "deep", label: "Deep Work", duration: 25 * 60, icon: Brain, color: "#8b5cf6" },
  { id: "short", label: "Short Break", duration: 5 * 60, icon: Coffee, color: "#10b981" },
  { id: "long", label: "Long Break", duration: 15 * 60, icon: Moon, color: "#0ea5e9" },
];

export default function FocusPage() {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(activeMode.duration);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [noiseNode, setNoiseNode] = useState<AudioNode | null>(null);

  // White Noise Generator logic
  const toggleNoise = useCallback(() => {
    if (!isMuted) {
      // Muting
      if (noiseNode) {
        noiseNode.disconnect();
        setNoiseNode(null);
      }
      setIsMuted(true);
    } else {
      // Unmuting / Starting
      try {
        const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) setAudioContext(ctx);

        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Integration creates Brown Noise (deeper, like airplane cabin)
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          output[i] = lastOut * 3.5; // Boosted because integration lowers volume
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const biquadFilter = ctx.createBiquadFilter();
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 1000; // Muffle the high frequencies like a cabin

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.1; // Comfortable volume

        whiteNoise.connect(biquadFilter);
        biquadFilter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        whiteNoise.start();
        setNoiseNode(whiteNoise);
        setIsMuted(false);
      } catch (e) {
        console.error("Audio failed", e);
      }
    }
  }, [isMuted, audioContext, noiseNode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (noiseNode) noiseNode.disconnect();
    };
  }, [noiseNode]);

  const [totalSessions, setTotalSessions] = useState(0);

  const handleSessionComplete = () => {
    setTotalSessions(prev => prev + 1);
    alert(`${activeMode.label} session completed!`);
  };

  // Update timer when mode changes
  useEffect(() => {
    setTimeLeft(activeMode.duration);
    setIsActive(false);
  }, [activeMode]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(activeMode.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / activeMode.duration) * 100;

  return (
    <div className="flex flex-col h-screen overflow-hidden vibe-deepsea bg-void relative">
      {/* Fluid Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '0s' }} />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="shrink-0 px-6 md:px-10 py-5 border-b border-white/[0.03] flex flex-col md:flex-row md:items-end justify-between gap-4 z-10 bg-[#04080a]/80 backdrop-blur-2xl">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                 <Timer className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
              <span className="text-sky-400/60 text-[10px] font-black uppercase tracking-[0.4em]">Deep Flow State</span>
           </div>
           <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">Chronos Focus</h1>
           <p className="text-slate-600 font-bold text-[9px] uppercase tracking-widest max-w-lg leading-relaxed mt-1 opacity-60">
             Eliminate all variables. Achieve maximum mental throughput.
           </p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end gap-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">Audio Environment</p>
               <button onClick={toggleNoise} className={cn(
                 "p-3 rounded-xl border transition-all flex items-center gap-3",
                 isMuted ? "bg-white/[0.02] border-white/[0.05] text-slate-700" : "bg-sky-500/10 border-sky-500/30 text-sky-400"
               )}>
                  {!isMuted && <span className="text-[9px] font-black uppercase tracking-widest">Cabin Ambience</span>}
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
               </button>
           </div>
        </div>
      </div>

      {/* Main Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 z-10">
        
        {/* Mode Selector */}
        <div className="flex gap-3 p-1.5 rounded-xl bg-[#080c10] border border-white/[0.03] mb-12 shadow-2xl">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode)}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                activeMode.id === mode.id 
                  ? "bg-white/5 text-white" 
                  : "text-slate-700 hover:text-slate-400"
              )}
            >
              {activeMode.id === mode.id && (
               <motion.div layoutId="activeMode" className="absolute inset-0" style={{ backgroundColor: `${activeMode.color}1a`, border: `1px solid ${activeMode.color}33` }} />
              )}
              <mode.icon className="w-4 h-4 relative z-10" style={{ color: activeMode.id === mode.id ? activeMode.color : undefined }} />
              <span className="relative z-10">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* The Timer HUD */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          {/* Animated Liquid Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="fill-none stroke-white/[0.02] stroke-[1]"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="46%"
              className="fill-none stroke-[6]"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ 
                strokeDasharray: `${(progress * 10).toFixed(0)} 1000`,
                stroke: activeMode.color
              }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 15px ${activeMode.color}80)` }}
            />
          </svg>

          {/* Time Display */}
          <div className="text-center space-y-2">
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-800 mb-1">T-Minus Remaining</span>
                <motion.div 
                  key={timeLeft}
                  initial={{ scale: 0.98, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl md:text-7xl font-black text-white tabular-nums tracking-tighter italic"
                >
                  {formatTime(timeLeft)}
                </motion.div>
             </div>
             <div className="flex items-center justify-center gap-3">
                <div className="flex gap-0.5">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${activeMode.color}66` }}>
                  Protocol Synchronized
                </span>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl border border-white/[0.03] text-slate-700 hover:text-white hover:bg-white/[0.03] transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button 
            onClick={toggleTimer}
            className={cn(
              "w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all scale-110 shadow-2xl relative group overflow-hidden",
              isActive 
                ? "bg-[#080c10] border border-white/5 text-white" 
                : "bg-white text-[#04080a]"
            )}
          >
            {isActive ? (
               <Pause className="w-10 h-10 relative z-10" />
            ) : (
               <Play className="w-10 h-10 relative z-10 ml-2 fill-current" />
            )}
            {!isActive && <div className="absolute inset-0 bg-sky-500/20 blur-2xl group-hover:bg-sky-500/40 transition-all" />}
          </button>

          <button 
            className="w-14 h-14 rounded-2xl border border-white/[0.03] text-slate-700 hover:text-white hover:bg-white/[0.03] transition-all flex items-center justify-center"
          >
            <Settings2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Analytics Footer */}
      <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6 z-10">
         <div className="vibe-card !p-6 flex items-center gap-8">
            <div className="space-y-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Total Neural Cycles</span>
               <p className="text-3xl font-black text-white italic">{totalSessions}</p>
            </div>
            <div className="w-[1px] h-10 bg-white/[0.05]" />
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flow State: Optimal</span>
               </div>
               <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: '85%' }} className="h-full bg-sky-500" />
               </div>
            </div>
         </div>

         <div className="vibe-card !px-8 !py-6 flex items-center gap-4 bg-sky-500/5 border-sky-500/10">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest text-white">System Evolution Active</span>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-sky-400/40 mt-1">XP Gain Multiplier: 1.5x</span>
            </div>
         </div>
      </div>
    </div>
  );
}
