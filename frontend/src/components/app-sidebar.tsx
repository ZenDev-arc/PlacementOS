import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Gauge,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

type AppSidebarProps = {
  active: "dashboard" | "tasks" | "dsa" | "mentor" | "internships" | "analytics";
};

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: Gauge },
  { id: "tasks", label: "Tasks", href: "/tasks", icon: ListChecks },
  { id: "dsa", label: "DSA", href: "/dsa", icon: BookOpenCheck },
  { id: "mentor", label: "AI Mentor", href: "/", icon: BrainCircuit },
  { id: "internships", label: "Internships", href: "/internships", icon: BriefcaseBusiness },
  { id: "analytics", label: "Analytics", href: "/", icon: BarChart3 },
] as const;

export function AppSidebar({ active }: AppSidebarProps) {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-mark">P</span>
        <span>PlacementOS</span>
      </Link>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link className={`nav-item ${active === item.id ? "active" : ""}`} href={item.href} key={item.id}>
              <Icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
