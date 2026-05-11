"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Code2, BookOpen, Layers, Briefcase, Sparkles, User, FileText, Target, Timer, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/dashboard",    color: "#8b5cf6" },
  { icon: Code2,           label: "DSA",          href: "/dsa",          color: "#10b981" },
  { icon: BookOpen,        label: "Foundations",  href: "/subjects",     color: "#06b6d4" },
  { icon: Layers,          label: "Projects",     href: "/projects",     color: "#a78bfa" },
  { icon: FileText,        label: "Resumes",      href: "/resumes",      color: "#ec4899" },
  { icon: Briefcase,       label: "Pipeline",     href: "/applications", color: "#f59e0b" },
  { icon: Sparkles,        label: "AI Mentor",    href: "/ai",           color: "#f43f5e" },
  { icon: Target,          label: "Habits",       href: "/habits",       color: "#fb7185" },
  { icon: Timer,           label: "Chronos",      href: "/focus",        color: "#8b5cf6" },
];

export function FloatingBottomNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  if (pathname === "/" || pathname === "/onboarding") return null;

  return (
    <>
      {/* Invisible hover trigger zone at bottom of screen */}
      <div
        className="fixed bottom-0 left-0 right-0 h-10 z-40"
        onMouseEnter={() => setVisible(true)}
      />

      <motion.div
        className="floating-nav-container"
        style={{ left: "50%", x: "-50%" }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="group relative">
            <div className={cn("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}>
              <item.icon className="w-4 h-4 relative z-10" />
              {/* Tooltip */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap translate-y-1 group-hover:translate-y-0"
                style={{ background: "rgba(8,8,10,0.95)", border: "1px solid #1e1e26", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">{item.label}</span>
              </div>
            </div>
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full -z-10"
                style={{ background: item.color, boxShadow: `0 0 16px ${item.color}70` }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      <div className="w-px h-4 mx-1" style={{ background: "#1e1e26" }} />

      <div className="flex items-center justify-center nav-item nav-item-inactive overflow-hidden">
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "w-6 h-6 rounded-lg",
              userButtonTrigger: "focus:shadow-none focus:outline-none"
            }
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link 
              label="System Profile" 
              labelIcon={<User className="w-4 h-4" />} 
              href="/profile" 
            />
          </UserButton.MenuItems>
        </UserButton>
      </div>
      </motion.div>
    </>
  );
}
