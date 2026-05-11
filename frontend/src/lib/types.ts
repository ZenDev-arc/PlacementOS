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
  user_name: string;
  readiness_score: number;
  streak_days: number;
  study_hours_week: number;
  metrics: MetricCard[];
  focus_queue: FocusItem[];
  weak_topics: string[];
  application_pipeline: Record<string, number>;
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
