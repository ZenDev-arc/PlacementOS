import {
  BriefcaseBusiness,
  CalendarCheck2,
  Flame,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { MentorPanel } from "@/components/dashboard/mentor-panel";
import type { DashboardSnapshot, DsaInsight } from "@/lib/types";

type DashboardShellProps = {
  snapshot: DashboardSnapshot;
  dsaInsight: DsaInsight;
};

export function DashboardShell({ snapshot, dsaInsight }: DashboardShellProps) {
  return (
    <div className="page-shell">
      <AppSidebar active="dashboard" />

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today&apos;s command center</p>
            <h1>Good evening, {snapshot.user_name}</h1>
            <p className="subtitle">
              Track preparation, route the next study block, and keep internship momentum visible in one operating surface.
            </p>
          </div>
          <div className="score-box" aria-label="Placement readiness score">
            <div className="score-value">
              {snapshot.readiness_score}
              <span>/100</span>
            </div>
            <div className="score-label">Placement readiness score</div>
          </div>
        </header>

        <section className="grid metrics" aria-label="Preparation metrics">
          {snapshot.metrics.map((metric) => (
            <article className="panel metric-card" key={metric.label}>
              <div className="metric-head">
                <span>{metric.label}</span>
                {metric.tone === "positive" ? <Flame size={18} /> : <CalendarCheck2 size={18} />}
              </div>
              <div className="metric-value">{metric.value}</div>
              <div className={`delta ${metric.tone}`}>{metric.delta}</div>
            </article>
          ))}
        </section>

        <section className="grid content-grid">
          <div className="grid">
            <article className="panel">
              <div className="section-head">
                <h2>Focus Queue</h2>
                <span className="pill">{snapshot.streak_days} day streak</span>
              </div>
              <div className="focus-list">
                {snapshot.focus_queue.map((item) => (
                  <div className="focus-item" key={item.title}>
                    <div>
                      <div className="focus-title">{item.title}</div>
                      <div className="focus-meta">
                        {item.category} | Due {item.due}
                      </div>
                    </div>
                    <div className="priority">{item.priority}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="section-head">
                <h2>DSA Intelligence</h2>
                <span className="pill">
                  {dsaInsight.solved_total}/{dsaInsight.weekly_target + dsaInsight.solved_total} weekly pace
                </span>
              </div>
              {dsaInsight.topic_progress.map((topic) => (
                <div className="progress-row" key={topic.topic}>
                  <div className="progress-label">
                    <span>{topic.topic}</span>
                    <span>
                      {topic.solved}/{topic.target} | {topic.mastery}%
                    </span>
                  </div>
                  <div className="bar" aria-hidden="true">
                    <span style={{ width: `${topic.mastery}%` }} />
                  </div>
                </div>
              ))}
            </article>
          </div>

          <div className="grid">
            <article className="panel">
              <div className="section-head">
                <h2>Application Pipeline</h2>
                <BriefcaseBusiness size={18} />
              </div>
              <div className="pipeline">
                {Object.entries(snapshot.application_pipeline).map(([label, value]) => (
                  <div className="pipeline-step" key={label}>
                    <div className="pipeline-value">{value}</div>
                    <div className="pipeline-label">{label}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="section-head">
                <h2>Recommended Next</h2>
                <ListChecks size={18} />
              </div>
              <div className="agent-list">
                {dsaInsight.recommended_next.map((item) => (
                  <span className="pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="section-head">
                <h2>AI Mentor</h2>
                <Sparkles size={18} />
              </div>
              <MentorPanel />
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
