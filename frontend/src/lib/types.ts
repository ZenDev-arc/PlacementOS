export type MetricTone = "positive" | "warning" | "neutral";

export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  tone: MetricTone;
};

export type FocusItem = {
  title: string;
  category: string;
  priority: string;
  due: string;
};

export type DashboardSnapshot = {
  user: string;
  readiness_score: number;
  today_plan: any;
  activity_chart: number[];
  stats: {
    dsa_solved: number;
    streak: number;
    ai_hours: number;
    github_repos: number;
  };
  recent_logs: {
    time: string;
    msg: string;
    type: string;
  }[];
  pulse_metrics: {
    id: string;
    label: string;
    value: number;
  }[];
};

export type TopicProgress = {
  topic: string;
  solved: number;
  target: number;
  mastery: number;
};

export type DsaInsight = {
  solved_total: number;
  weekly_target: number;
  recommended_next: string[];
  weak_topics: string[];
  topic_progress: TopicProgress[];
};

export type DsaDifficulty = "easy" | "medium" | "hard";

export type DsaProblem = {
  id: number;
  title: string;
  topic: string;
  difficulty: DsaDifficulty;
  platform: string;
  solved_on: string | null;
  confidence: number;
  needs_revision: number;
};

export type DsaProblemCreate = {
  title: string;
  topic: string;
  difficulty: DsaDifficulty;
  platform: string;
  solved_on?: string | null;
  confidence: number;
  needs_revision: number;
};

export type MentorResponse = {
  answer: string;
  recommended_actions: string[];
  routed_agents: string[];
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: number;
  title: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
};

export type TaskCreate = {
  title: string;
  category: string;
  status?: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
};

export type ApplicationStatus = "Identified" | "Applied" | "OA" | "Interview" | "Offer" | "Rejected" | "Ghosted";

export type InternshipApplication = {
  id: string;
  company_name: string;
  role_title: string;
  status: ApplicationStatus;
  date_applied: string | null;
  platform: string;
  notes: string;
  match_score?: number;
  salary?: string;
  link?: string;
};

export type InternshipApplicationCreate = {
  company_name: string;
  role_title: string;
  status: ApplicationStatus;
  date_applied?: string | null;
  platform: string;
  notes?: string;
  salary?: string;
  link?: string;
};
