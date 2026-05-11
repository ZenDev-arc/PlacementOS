"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User, Mail, Code2, Target, Clock, Calendar,
  Edit3, Save, X, GitBranch, BookOpen, Zap,
  TrendingUp, CheckCircle2, Briefcase, Award, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = ["C++","Java","Python","JavaScript","TypeScript","Go","Rust","React","Node.js","SQL"];
const COMPANIES  = ["Google","Microsoft","Amazon","Meta","Apple","Stripe","Flipkart","Razorpay","Adobe","Atlassian"];
const DSA_LEVELS = ["beginner","intermediate","advanced"];

interface Profile {
  name: string; email: string; avatar: string;
  dsa_level: string; known_languages: string[];
  target_companies: string[]; target_package_min: number; target_package_max: number;
  hours_per_day: number; prep_start_date: string; target_placement_date: string;
  has_internship: boolean; github_username: string; college: string; year: string;
}

const DEFAULT: Profile = {
  name: "Student", email: "student@example.com", avatar: "",
  dsa_level: "beginner", known_languages: [], target_companies: [],
  target_package_min: 10, target_package_max: 25,
  hours_per_day: 4, prep_start_date: "", target_placement_date: "",
  has_internship: false, github_username: "", college: "", year: "3rd Year",
};

function Avatar({ name, size = 20 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-2xl flex items-center justify-center font-black text-white"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", fontSize: size * 0.3 }}>
      {initials || "U"}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [editing, setEditing]  = useState(false);
  const [draft,   setDraft]    = useState<Profile>(DEFAULT);
  const [saved,   setSaved]    = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pos_profile");
    const onboarding = localStorage.getItem("pos_onboarding");
    
    let baseProfile = { ...DEFAULT };
    
    if (userLoaded && user) {
      baseProfile.name = user.fullName || user.username || "Student";
      baseProfile.email = user.primaryEmailAddress?.emailAddress || "student@example.com";
      baseProfile.avatar = user.imageUrl || "";
    }

    if (stored) {
      const p = JSON.parse(stored);
      setProfile({ ...baseProfile, ...p }); 
      setDraft({ ...baseProfile, ...p });
    } else if (onboarding) {
      const o = JSON.parse(onboarding);
      const merged = { ...baseProfile, ...o };
      setProfile(merged); setDraft(merged);
    } else {
      setProfile(baseProfile);
      setDraft(baseProfile);
    }
  }, [userLoaded, user]);

  const save = () => {
    setProfile(draft);
    localStorage.setItem("pos_profile", JSON.stringify(draft));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancel = () => { setDraft(profile); setEditing(false); };

  const toggleLang    = (l: string) => setDraft(p => ({ ...p, known_languages: p.known_languages.includes(l) ? p.known_languages.filter(x => x !== l) : [...p.known_languages, l] }));
  const toggleCompany = (c: string) => setDraft(p => ({ ...p, target_companies: p.target_companies.includes(c) ? p.target_companies.filter(x => x !== c) : [...p.target_companies, c] }));

  const dsaSolved = (() => { try { return JSON.parse(localStorage.getItem("flame_dsa_history") || "[]").length; } catch { return 0; } })();
  const pipelineApps = (() => { try { return JSON.parse(localStorage.getItem("pos_pipeline") || "[]").length; } catch { return 0; } })();
  const aiSessions   = (() => { try { return JSON.parse(localStorage.getItem("pos_ai_sessions") || "[]").length; } catch { return 0; } })();
  const readiness    = Math.min(100, Math.floor(dsaSolved * 0.4 + pipelineApps * 2 + 5));

  const stats = [
    { label: "DSA Solved",   value: dsaSolved,    icon: Code2,     color: "#10b981" },
    { label: "Applications", value: pipelineApps, icon: Briefcase, color: "#8b5cf6" },
    { label: "AI Sessions",  value: aiSessions,   icon: Zap,       color: "#f59e0b" },
    { label: "Readiness",    value: `${readiness}%`, icon: TrendingUp, color: "#0ea5e9" },
  ];

  const cur = editing ? draft : profile;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 md:px-10 py-5 border-b border-[#1e1e26] flex items-center justify-between"
        style={{ background: "rgba(8,8,10,0.8)", backdropFilter: "blur(16px)" }}>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-0.5">PlacementOS</p>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Profile</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={cancel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26" }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={save} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all"
                style={{ background: "#8b5cf6", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
                <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Identity Card */}
          <div className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6"
            style={{ background: "rgba(14,14,18,0.9)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 0 40px rgba(139,92,246,0.05)" }}>
            <div className="shrink-0">
              <Avatar name={cur.name} size={80} />
            </div>
            <div className="flex-1 space-y-3">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "name",           label: "Full Name",       placeholder: "Your Name" },
                    { key: "email",          label: "Email",           placeholder: "you@email.com" },
                    { key: "college",        label: "College",         placeholder: "IIT / NIT / etc." },
                    { key: "github_username",label: "GitHub Username", placeholder: "github-handle" },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[7px] font-black uppercase tracking-widest text-slate-600">{f.label}</label>
                      <input value={(draft as any)[f.key]} onChange={e => setDraft(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-xl text-[11px] font-medium text-slate-200 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26" }} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-widest text-slate-600">Year</label>
                    <select value={draft.year} onChange={e => setDraft(p => ({ ...p, year: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-[11px] font-medium text-slate-200 outline-none"
                      style={{ background: "rgba(14,14,18,0.95)", border: "1px solid #1e1e26" }}>
                      {["1st Year","2nd Year","3rd Year","4th Year","Graduated"].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{profile.name}</h2>
                    <p className="text-[10px] text-slate-500 font-medium">{profile.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.college && <span className="px-3 py-1 rounded-full text-[9px] font-black text-violet-400" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>{profile.college}</span>}
                    {profile.year    && <span className="px-3 py-1 rounded-full text-[9px] font-black text-sky-400"    style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}>{profile.year}</span>}
                    {profile.github_username && (
                      <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 hover:text-white transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26" }}>
                        <GitBranch className="w-3 h-3" /> @{profile.github_username}
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="metric-card text-center py-5">
                <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-600 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Prep Goals */}
            <div className="smooth-card space-y-5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Prep Goals</h3>
              </div>

              {/* DSA Level */}
              <div className="space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">DSA Level</p>
                {editing ? (
                  <div className="flex gap-2">
                    {DSA_LEVELS.map(l => (
                      <button key={l} onClick={() => setDraft(p => ({ ...p, dsa_level: l }))}
                        className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        style={draft.dsa_level === l
                          ? { background: "#8b5cf6", color: "#fff" }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e26", color: "#64748b" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                    {profile.dsa_level}
                  </span>
                )}
              </div>

              {/* Package */}
              <div className="space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Target Package (LPA)</p>
                {editing ? (
                  <div className="flex gap-3">
                    {(["target_package_min","target_package_max"] as const).map((k, i) => (
                      <div key={k} className="flex-1 space-y-1">
                        <label className="text-[7px] font-black uppercase tracking-widest text-slate-700">{i === 0 ? "Min" : "Max"}</label>
                        <input type="number" value={draft[k]}
                          onChange={e => setDraft(p => ({ ...p, [k]: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2.5 rounded-xl font-mono text-[12px] text-slate-200 outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26" }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl font-black text-white">{profile.target_package_min}–{profile.target_package_max} <span className="text-[11px] text-slate-600 font-bold">LPA</span></p>
                )}
              </div>

              {/* Hours */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Daily Commitment</p>
                  <span className="text-[10px] font-black text-indigo-400">{cur.hours_per_day} hrs/day</span>
                </div>
                {editing ? (
                  <input type="range" min={1} max={12} value={draft.hours_per_day}
                    onChange={e => setDraft(p => ({ ...p, hours_per_day: parseInt(e.target.value) }))}
                    className="w-full accent-violet-500" />
                ) : (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(profile.hours_per_day / 12) * 100}%`, background: "#8b5cf6" }} />
                  </div>
                )}
              </div>

              {/* Dates */}
              {editing && (
                <div className="grid grid-cols-2 gap-3">
                  {(["prep_start_date","target_placement_date"] as const).map((k, i) => (
                    <div key={k} className="space-y-1">
                      <label className="text-[7px] font-black uppercase tracking-widest text-slate-600">{i === 0 ? "Prep Start" : "Target Date"}</label>
                      <input type="date" value={draft[k]}
                        onChange={e => setDraft(p => ({ ...p, [k]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-[10px] font-mono text-slate-300 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26" }} />
                    </div>
                  ))}
                </div>
              )}
              {!editing && (profile.prep_start_date || profile.target_placement_date) && (
                <div className="flex gap-3">
                  {profile.prep_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <p className="text-[9px] font-medium text-slate-500">Started: <span className="text-slate-300">{profile.prep_start_date}</span></p>
                    </div>
                  )}
                  {profile.target_placement_date && (
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-600" />
                      <p className="text-[9px] font-medium text-slate-500">Target: <span className="text-slate-300">{profile.target_placement_date}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">

              {/* Tech Stack */}
              <div className="smooth-card space-y-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Tech Stack</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => {
                    const active = cur.known_languages.includes(l);
                    return (
                      <button key={l} onClick={() => editing && toggleLang(l)} disabled={!editing}
                        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        style={active
                          ? { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e26", color: "#334155", cursor: editing ? "pointer" : "default" }}>
                        {active && !editing && <span className="mr-1">✓</span>}{l}
                      </button>
                    );
                  })}
                  {cur.known_languages.filter(l => !LANGUAGES.includes(l)).map(l => (
                    <button key={l} onClick={() => editing && toggleLang(l)} disabled={!editing}
                      className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
                      {!editing && <span className="mr-1">✓</span>}{l} {editing && <span className="ml-1 opacity-70">×</span>}
                    </button>
                  ))}
                </div>
                {editing && (
                  <input 
                    type="text" 
                    placeholder="Type custom tech and press Enter"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-medium text-slate-200 outline-none transition-all mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !draft.known_languages.includes(val)) {
                          setDraft({ ...draft, known_languages: [...draft.known_languages, val] });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                )}
                {cur.known_languages.length === 0 && !editing && (
                  <p className="text-[9px] text-slate-700 font-medium">No languages selected. Click Edit Profile to add.</p>
                )}
              </div>

              {/* Target Companies */}
              <div className="smooth-card space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Target Companies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map(c => {
                    const active = cur.target_companies.includes(c);
                    return (
                      <button key={c} onClick={() => editing && toggleCompany(c)} disabled={!editing}
                        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        style={active
                          ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e26", color: "#334155", cursor: editing ? "pointer" : "default" }}>
                        {c}
                      </button>
                    );
                  })}
                  {cur.target_companies.filter(c => !COMPANIES.includes(c)).map(c => (
                    <button key={c} onClick={() => editing && toggleCompany(c)} disabled={!editing}
                      className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                      {c} {editing && <span className="ml-1 opacity-70">×</span>}
                    </button>
                  ))}
                </div>
                {editing && (
                  <input 
                    type="text" 
                    placeholder="Type custom company and press Enter"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-medium text-slate-200 outline-none transition-all mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !draft.target_companies.includes(val)) {
                          setDraft({ ...draft, target_companies: [...draft.target_companies, val] });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Readiness Bar */}
          <div className="smooth-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Placement Readiness</h3>
              </div>
              <span className="text-2xl font-black text-violet-400">{readiness}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${readiness}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 10px rgba(139,92,246,0.5)" }} />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: "DSA Practice",    done: dsaSolved > 20,    detail: `${dsaSolved} problems` },
                { label: "Active Pipeline", done: pipelineApps > 3,  detail: `${pipelineApps} applications` },
                { label: "AI Mentorship",   done: aiSessions > 5,    detail: `${aiSessions} sessions` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: item.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${item.done ? "rgba(16,185,129,0.2)" : "#1e1e26"}` }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: item.done ? "#10b981" : "#1e293b" }} />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: item.done ? "#34d399" : "#334155" }}>{item.label}</p>
                    <p className="text-[7px] text-slate-700 font-medium">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
