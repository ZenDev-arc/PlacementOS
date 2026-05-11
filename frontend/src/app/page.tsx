"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  Flame as FlameIcon, 
  Target, 
  Activity,
  Cpu,
  Database,
  BarChart3,
  Layout,
  Zap,
  Globe,
  CheckCircle2,
  Code2,
  Shield,
  Terminal,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, SignInButton } from "@clerk/nextjs";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      staggerChildren: 0.1,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative h-screen bg-charcoal selection:bg-matte-blue/30 overflow-y-auto overflow-x-hidden custom-scrollbar"
    >
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-matte-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-matte-blue/5 blur-[120px] rounded-full" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-charcoal/80 backdrop-blur-3xl px-8 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-matte-blue rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--vibe-obsidian-glow)] text-charcoal">
            <Cpu className="w-5 h-5 fill-current" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-white">PLACEMENT<span className="text-matte-blue">.OS</span></span>
        </div>
        <div className="flex gap-4 items-center">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="btn-smooth-secondary !py-2 !px-6 !text-[10px] shadow-sm">
                Access System
              </button>
            </SignInButton>
          ) : (
            <Link href="/dashboard">
              <button className="btn-smooth !py-2 !px-6 !text-[10px] shadow-lg">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1600px] mx-auto">
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-matte-blue text-[9px] font-black uppercase tracking-[0.4em] rounded-full">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Operational Capacity V3.2
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase text-white">
            Forge Your <br />
            <span className="text-matte-blue italic">Legacy.</span>
          </h1>

          <p className="text-lg md:text-xl text-pale-silver/40 max-w-xl font-bold leading-relaxed">
            The premium career command center for elite engineers. High-density, tactical, and built for speed.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <Link href="/onboarding">
              <button className="btn-smooth !px-10 !py-4 text-base shadow-2xl">
                Initialize Workspace
                <ArrowRight className="w-4.5 h-4.5 ml-2" />
              </button>
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-smooth-secondary !px-10 !py-4 text-base"
            >
              System Specs
            </button>
          </div>
        </motion.div>

        {/* Hero Illustration (Smooth Infographic) */}
        <motion.div variants={itemVariants} className="relative group px-4">
           <div className="smooth-card !p-12 relative z-10">
              <div className="grid grid-cols-2 gap-10">
                 <InfographicBox label="Logic Resolved" value="4.8M" color="blue" icon={Code2} />
                 <InfographicBox label="Neural Sync" value="98%" color="blue" icon={CheckCircle2} />
                 <div className="col-span-2 pt-10 border-t border-white/5 space-y-6 text-white">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-pale-silver/30 uppercase tracking-[0.4em]">Trajectory Projection</span>
                       <span className="text-2xl font-black text-matte-blue">+24%</span>
                    </div>
                    <div className="h-32 flex items-end gap-2">
                       {[30, 45, 35, 60, 50, 80, 75, 90, 85, 100].map((h, i) => (
                         <motion.div 
                           key={i}
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           transition={{ duration: 1.5, delay: i * 0.05 }}
                           className="flex-1 bg-matte-blue/10 rounded-t-xl border-t-2 border-matte-blue/50 transition-all group-hover:bg-matte-blue/30"
                         />
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 border-t border-white/5 bg-white/[0.01] px-8 md:px-12">
        <div className="max-w-[1600px] mx-auto space-y-12">
          <header className="space-y-3">
            <span className="text-matte-blue text-[10px] font-black tracking-widest uppercase">Platform Stack</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Engineered for Dominance.</h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={Cpu} 
              title="Neural Mentor" 
              desc="Interactive socratic logic challenges that prioritize architectural first-principles." 
              tag="POS_01"
            />
            <FeatureItem 
              icon={Layout} 
              title="Project Matrix" 
              desc="High-density 3-column project grid for multi-thread technical execution." 
              tag="POS_02"
              active
            />
            <FeatureItem 
              icon={BarChart3} 
              title="Performance Audit" 
              desc="Real-time forensic analysis of your career trajectory based on verified metrics." 
              tag="POS_03"
            />
          </div>

          {/* Tactical Stats Row to fill space */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/5">
             {[
               { label: "Active Nodes", val: "12,402", icon: Layers },
               { label: "Neural Bridge", val: "Operational", icon: Shield },
               { label: "Build Sync", val: "99.9%", icon: Zap },
               { label: "Terminal State", val: "Encrypted", icon: Terminal }
             ].map((stat) => (
               <div key={stat.label} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-matte-blue group-hover:bg-matte-blue group-hover:text-charcoal transition-all">
                     <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-pale-silver/20 uppercase tracking-widest">{stat.label}</p>
                     <p className="text-lg font-black text-white">{stat.val}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-charcoal text-center text-white px-8">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-4">
             <Cpu className="w-6 h-6 text-matte-blue fill-current" />
             <span className="font-black text-xl tracking-tighter uppercase">PLACEMENT<span className="text-matte-blue">.OS</span></span>
          </div>
          <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em]">
             <span className="hover:text-matte-blue cursor-pointer transition-colors text-pale-silver/40">Core_Arch</span>
             <span className="hover:text-matte-blue cursor-pointer transition-colors text-pale-silver/40">Neural_API</span>
             <span className="hover:text-matte-blue cursor-pointer transition-colors text-pale-silver/40">Audit_021</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-pale-silver/20">© 2026 PLACEMENTOS_CORE_INTL</p>
        </div>
      </footer>
    </motion.div>
  );
}

function InfographicBox({ label, value, color, icon: Icon }: any) {
  return (
    <div className="space-y-4 group text-white">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-matte-blue bg-white/5 backdrop-blur-md transition-all group-hover:bg-matte-blue group-hover:text-charcoal">
             <Icon className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-black text-pale-silver/20 uppercase tracking-[0.3em]">{label}</span>
       </div>
       <div className="text-3xl font-black tracking-tighter">{value}</div>
       <div className="infographic-bar !h-1 bg-white/5">
          <div className="infographic-bar-inner bg-matte-blue shadow-[0_0_15px_var(--vibe-obsidian-glow)]" style={{ width: '85%' }} />
       </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc, tag, active = false }: any) {
  return (
    <div className={cn(
      "smooth-card !p-8 flex flex-col justify-between min-h-[320px] group transition-all duration-500",
      active 
        ? "bg-matte-blue text-charcoal border-matte-blue shadow-[0_20px_40px_var(--vibe-obsidian-glow)]" 
        : "hover:bg-white/5 text-white"
    )}>
      <div className="flex justify-between items-start">
        <Icon className={cn("w-10 h-10", active ? "text-charcoal" : "text-matte-blue group-hover:scale-110 transition-transform")} />
        <span className={cn("text-[8px] font-black tracking-[0.4em] uppercase", active ? "text-charcoal/40" : "text-pale-silver/20")}>{tag}</span>
      </div>
      <div className="space-y-5">
        <h3 className="text-2xl font-black uppercase tracking-tight leading-[0.9]">{title}</h3>
        <p className={cn("text-base font-bold leading-relaxed", active ? "text-charcoal/80" : "text-pale-silver/40")}>{desc}</p>
      </div>
    </div>
  );
}
