"use client";

import { useEffect, useState } from "react";
const useAuth = () => ({ getToken: async () => "mock-token" });
import { 
  Users, 
  Activity, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  Globe,
  Database,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [getToken]);

  if (loading) return <div className="p-8 text-slate-500">Loading system metrics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black font-outfit">Platform Command Center</h1>
        <p className="text-slate-400">Monitoring global readiness and system health.</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Students" value={stats?.platform_metrics.total_users} icon={Users} color="indigo" />
        <MetricCard label="Problems Solved" value={stats?.platform_metrics.total_dsa_problems} icon={Activity} color="emerald" />
        <MetricCard label="Active Applications" value={stats?.platform_metrics.total_applications} icon={Globe} color="amber" />
        <MetricCard label="System Health" value="99.9%" icon={Cpu} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart Placeholder */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Growth Trends</h2>
            <select className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 outline-none">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-2">
            {stats?.activity_data.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all rounded-t-lg" 
                  style={{ height: `${(d.users / 30) * 100}%` }} 
                />
                <span className="text-[10px] font-bold text-slate-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Weak Areas */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            Global Weak Areas
          </h2>
          <div className="space-y-4">
            {stats?.top_weak_topics.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-sm font-medium">{t.topic || "Unknown"}</span>
                <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md">{t.count} users</span>
              </div>
            ))}
            {stats?.top_weak_topics.length === 0 && (
              <div className="text-sm text-slate-500 italic">No data yet.</div>
            )}
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-400 leading-relaxed">
              Recommendation: Push Graph and Dynamic Programming content to the Daily Plan templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
        color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
        "bg-amber-500/10 text-amber-400"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black font-outfit mt-1">{value}</p>
      </div>
    </div>
  );
}
