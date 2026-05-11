"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  Code2, 
  BookOpen, 
  Layers, 
  Briefcase, 
  Sparkles,
  Target,
  Settings,
  Rocket,
  ChevronRight,
  LogOut,
  Activity,
  Terminal,
  Grid,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Grid, label: "Dashboard", href: "/dashboard", code: "HUD_01" },
  { icon: Code2, label: "DSA CORE", href: "/dsa", code: "CODE_02" },
  { icon: BookOpen, label: "Foundations", href: "/subjects", code: "BOOK_03" },
  { icon: Layers, label: "Projects", href: "/projects", code: "FORGE_04" },
  { icon: Briefcase, label: "Pipeline", href: "/applications", code: "JOBS_05" },
  { icon: Sparkles, label: "AI Mentor", href: "/ai", code: "INTEL_06" },
  { icon: Target, label: "Habits", href: "/habits", code: "CORE_07" },
  { icon: Timer, label: "Chronos", href: "/focus", code: "TIME_08" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const { user, isLoaded } = useUser();

  const fullName = user?.fullName || user?.username || "Student";
  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isHovered ? 280 : 80 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-screen bg-charcoal border-r border-matte-border flex flex-col z-50 sticky top-0 transition-all duration-300"
    >
      {/* Logo Section */}
      <div className="h-24 flex items-center px-6 border-b border-matte-border">
        <div className="w-10 h-10 bg-matte-blue flex items-center justify-center shrink-0">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 flex flex-col"
            >
              <span className="font-black text-lg tracking-tighter uppercase leading-none">
                PlacementOS
              </span>
              <span className="text-[8px] font-black text-matte-blue uppercase tracking-widest mt-1">System Ready</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group relative flex items-center h-14 transition-all duration-150",
                isActive ? "bg-white text-charcoal" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}>
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute right-0 w-1 h-full bg-matte-blue" />
                )}
                
                <div className="w-[80px] h-full flex items-center justify-center shrink-0">
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-charcoal" : "group-hover:text-white"
                  )} />
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 flex items-center justify-between pr-6"
                    >
                      <span className="font-black text-[10px] uppercase tracking-widest">
                        {item.label}
                      </span>
                      <span className="text-[8px] font-bold opacity-30">{item.code}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-matte-border">
        <Link href="/profile" className={cn(
          "flex items-center gap-4 p-3 bg-charcoal-light border border-matte-border transition-all hover:bg-white/5",
          isHovered ? "px-4" : "justify-center"
        )}>
           <div className="w-8 h-8 bg-matte-blue flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden">
             {user?.imageUrl ? (
               <img src={user.imageUrl} alt={fullName} className="w-full h-full object-cover" />
             ) : (
               initials
             )}
           </div>
           <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                 <p className="text-[10px] font-black uppercase truncate tracking-widest">{fullName}</p>
                 <div className="flex gap-1 mt-1">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-0.5 bg-matte-blue" />)}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  );
}
