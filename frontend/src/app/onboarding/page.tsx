"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Target, 
  Code2, 
  Clock, 
  Briefcase, 
  ArrowRight, 
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { submitOnboarding } from "@/services/placementos-api";

const steps = [
  { id: 1, title: "Ambition", icon: Target },
  { id: 2, title: "Skillset", icon: Code2 },
  { id: 3, title: "Timeline", icon: Clock },
  { id: 4, title: "Schedule", icon: Calendar },
  { id: 5, title: "Summary", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    target_companies: [] as string[],
    target_package_min: 10,
    target_package_max: 25,
    dsa_level: "beginner",
    ml_level: "beginner",
    known_languages: [] as string[],
    hours_per_day: 4,
    prep_start_date: new Date().toISOString().split('T')[0],
    target_placement_date: "",
    has_internship: false,
    internship_status: "not_started",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-12 px-6 relative overflow-x-hidden overflow-y-auto selection:bg-indigo-500/30">
      {/* Background Particle Field (Simplified) */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 scale-[0.8] md:scale-[0.85] origin-top transform-gpu">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center" style={{ boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">Placement<span className="text-indigo-400">OS</span></span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-700 ease-out",
                  currentStep >= step.id ? "w-10 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "w-4 bg-slate-800"
                )}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-card p-8 md:p-10 min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 space-y-10"
            >
              {/* Step 1: Ambition */}
              {currentStep === 1 && (
                <div className="space-y-8">
                   <header>
                    <h1 className="text-2xl font-black font-outfit mb-2">Define your target.</h1>
                    <p className="text-slate-400 text-base">Which companies represent your ultimate goal?</p>
                  </header>
                  
                  <div className="space-y-6">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder=" "
                        className="peer w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 focus:border-indigo-500 outline-none transition-all placeholder-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val && !formData.target_companies.includes(val)) {
                              setFormData({...formData, target_companies: [...formData.target_companies, val]});
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                      <label className="absolute left-6 top-4 text-slate-500 transition-all peer-focus:-top-6 peer-focus:left-2 peer-focus:text-indigo-400 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-indigo-400 peer-[:not(:placeholder-shown)]:text-xs">
                        Type company names and press Enter
                      </label>
                      <Search className="absolute right-6 top-4 w-5 h-5 text-slate-700" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {formData.target_companies.map(company => (
                          <motion.span 
                            key={company}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-bold flex items-center gap-2 group hover:bg-indigo-500/20 transition-all"
                          >
                            {company}
                            <button onClick={() => setFormData({...formData, target_companies: formData.target_companies.filter(c => c !== company)})} className="hover:text-white">×</button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Package Range (LPA)</p>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 focus-within:border-indigo-500 transition-all">
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">MINIMUM</span>
                          <input type="number" value={formData.target_package_min} className="w-full bg-transparent font-mono text-xl outline-none" onChange={e => setFormData({...formData, target_package_min: parseInt(e.target.value)})}/>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 focus-within:border-indigo-500 transition-all">
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">MAXIMUM</span>
                          <input type="number" value={formData.target_package_max} className="w-full bg-transparent font-mono text-xl outline-none" onChange={e => setFormData({...formData, target_package_max: parseInt(e.target.value)})}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Skillset */}
              {currentStep === 2 && (
                <div className="space-y-10">
                   <header>
                    <h1 className="text-2xl font-black font-outfit mb-2">Skill Assessment.</h1>
                    <p className="text-slate-400 text-base">Be honest — the AI uses this to calibrate your roadmap.</p>
                  </header>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">DSA Proficiency</p>
                      <div className="relative h-12 bg-slate-950 rounded-2xl border border-slate-800 p-1 flex items-center">
                        <motion.div 
                          className="absolute h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                          animate={{ 
                            left: formData.dsa_level === 'beginner' ? '4px' : formData.dsa_level === 'intermediate' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 2px)',
                            width: 'calc(33.33% - 4px)'
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        {["beginner", "intermediate", "advanced"].map(level => (
                          <button
                            key={level}
                            onClick={() => setFormData({...formData, dsa_level: level})}
                            className="relative flex-1 text-xs font-bold uppercase tracking-widest z-10 transition-colors duration-500"
                            style={{ color: formData.dsa_level === level ? 'white' : '#64748b' }}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {["C++","Java","Python","JavaScript","TypeScript","Go","Rust","React","Node.js","SQL"].map((lang, i) => (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={lang}
                            onClick={() => {
                              const isKnown = formData.known_languages.includes(lang);
                              setFormData({
                                ...formData, 
                                known_languages: isKnown 
                                  ? formData.known_languages.filter(l => l !== lang) 
                                  : [...formData.known_languages, lang]
                              });
                            }}
                            className={cn(
                              "px-6 py-3 rounded-2xl border transition-all text-sm font-bold",
                              formData.known_languages.includes(lang) 
                                ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-600/20" 
                                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                            )}
                          >
                            {lang}
                          </motion.button>
                        ))}
                        <AnimatePresence>
                          {formData.known_languages.filter(l => !["C++","Java","Python","JavaScript","TypeScript","Go","Rust","React","Node.js","SQL"].includes(l)).map((lang, i) => (
                            <motion.span 
                              key={lang}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="px-6 py-3 bg-indigo-500 border border-indigo-400 text-white rounded-2xl text-sm font-bold flex items-center gap-2 group shadow-lg shadow-indigo-600/20"
                            >
                              {lang}
                              <button onClick={() => setFormData({...formData, known_languages: formData.known_languages.filter(c => c !== lang)})} className="hover:text-indigo-200">×</button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      <div className="relative mt-4">
                        <input 
                          type="text" 
                          placeholder="Type any other technology and press Enter..."
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:border-indigo-500 outline-none transition-all text-slate-200"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val && !formData.known_languages.includes(val)) {
                                setFormData({ ...formData, known_languages: [...formData.known_languages, val] });
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Timeline */}
              {currentStep === 3 && (
                <div className="space-y-8">
                   <header>
                    <h1 className="text-2xl font-black mb-2 text-white">Set your timeline.</h1>
                    <p className="text-slate-400 text-sm">When are you targeting placements?</p>
                  </header>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prep Start Date</p>
                      <input
                        type="date"
                        value={formData.prep_start_date}
                        onChange={e => setFormData({ ...formData, prep_start_date: e.target.value })}
                        className="w-full rounded-xl px-5 py-4 font-mono text-slate-200 outline-none transition-all"
                        style={{ background: 'rgba(14,14,18,0.9)', border: '1px solid #1e1e26' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Placement Date</p>
                      <input
                        type="date"
                        value={formData.target_placement_date}
                        onChange={e => setFormData({ ...formData, target_placement_date: e.target.value })}
                        className="w-full rounded-xl px-5 py-4 font-mono text-slate-200 outline-none transition-all"
                        style={{ background: 'rgba(14,14,18,0.9)', border: '1px solid #1e1e26' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Schedule (Visual Planner) */}
              {currentStep === 4 && (
                <div className="space-y-10">
                   <header>
                    <h1 className="text-2xl font-black font-outfit mb-2">Your Schedule.</h1>
                    <p className="text-slate-400 text-base">Define your daily tactical window.</p>
                  </header>

                  <div className="space-y-12">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Commitment Intensity</p>
                        <div className="text-right">
                          <span className="text-5xl font-black font-mono text-indigo-400">{formData.hours_per_day}</span>
                          <span className="text-sm font-bold text-slate-600 ml-1">HRS/DAY</span>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-slate-900 rounded-full">
                        <motion.div 
                          className="absolute h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          animate={{ width: `${(formData.hours_per_day / 12) * 100}%` }}
                        />
                        <input 
                          type="range" 
                          min="1" max="12" 
                          value={formData.hours_per_day} 
                          onChange={e => setFormData({...formData, hours_per_day: parseInt(e.target.value)})}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                        {/* Ticks */}
                        <div className="absolute top-6 left-0 right-0 flex justify-between px-1">
                          {[2, 4, 6, 8, 10, 12].map(h => (
                            <span key={h} className="text-[10px] font-mono text-slate-700 font-bold">{h}h</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-950/50 border border-slate-800 flex items-center gap-6">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Setting <span className="text-white font-bold">{formData.hours_per_day} hours</span> allows the AI to schedule deep-work blocks for DSA and CS fundamentals effectively.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Summary (Terminal Effect) */}
              {currentStep === 5 && (
                <div className="space-y-8">
                    <header>
                    <h1 className="text-2xl font-black mb-2 text-white">System ready.</h1>
                    <p className="text-slate-400 text-base">Final profile confirmation before launch.</p>
                  </header>

                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 font-mono text-sm space-y-4 shadow-inner relative group">
                    <div className="absolute top-4 right-6 flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    </div>
                    <TypewriterLine label="TARGET" value={formData.target_companies.join(", ") || "General Tech"} delay={0.5} />
                    <TypewriterLine label="PACKAGE" value={`${formData.target_package_min}-${formData.target_package_max} LPA`} delay={1.5} />
                    <TypewriterLine label="DSA_LVL" value={formData.dsa_level.toUpperCase()} delay={2.5} />
                    <TypewriterLine label="STACK" value={formData.known_languages.length > 0 ? formData.known_languages.join(", ") : "Not specified"} delay={3.5} />
                    <TypewriterLine label="WINDOWS" value={`${formData.hours_per_day} HRS DAILY COMMITMENT`} delay={4.5} />
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 5.5 }}
                      className="pt-4 text-emerald-400 font-bold flex items-center gap-2"
                    >
                      <span className="animate-pulse">●</span> READY_FOR_GENERATION
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-800">
            <button 
              onClick={prevStep}
              className={cn(
                "flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold group",
                currentStep === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              BACK
            </button>
            
            {currentStep < steps.length ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex items-center gap-3 group"
              >
                CONTINUE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const token = await getToken();
                    if (!token) {
                      alert("Authentication session not ready. Please wait a moment or refresh the page.");
                      setIsSubmitting(false);
                      return;
                    }

                    // Ensure dates are not empty
                    const submissionData = {
                      ...formData,
                      target_placement_date: formData.target_placement_date || 
                        new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
                    };
                    await submitOnboarding(submissionData, token);
                    localStorage.setItem("pos_onboarding", JSON.stringify(formData));
                    router.push("/dashboard");
                  } catch (err: any) {
                    console.error("Submission failed:", err);
                    alert(`System sync failed: ${err.message}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 flex items-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? "CALCULATING..." : "GENERATE MY PLAN"}
                {isSubmitting ? <Loader /> : <Sparkles className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypewriterLine({ label, value, delay }: { label: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex gap-4"
    >
      <span className="text-slate-600 w-24 shrink-0">{label}:</span>
      <span className="text-indigo-400 break-all">{value}</span>
    </motion.div>
  );
}

function Loader() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
