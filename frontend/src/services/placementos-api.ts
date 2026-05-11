import type {
  DashboardSnapshot,
  DsaInsight,
  DsaProblem,
  DsaProblemCreate,
  InternshipApplication,
  InternshipApplicationCreate,
  MentorResponse,
  Task,
  TaskCreate,
} from "@/lib/types";

const dashboardFallback: any = null;

const dsaFallback: any = null;

const taskFallback: Task[] = [
  {
    id: 1,
    title: "Revise DBMS indexing",
    category: "CS Core",
    status: "todo",
    priority: "high",
    due_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 2,
    title: "Solve 3 graph problems",
    category: "DSA",
    status: "todo",
    priority: "high",
    due_date: new Date().toISOString().slice(0, 10),
  },
];

const dsaProblemsFallback: DsaProblem[] = [
  {
    id: 1,
    title: "Number of Islands",
    topic: "Graphs",
    difficulty: "medium",
    platform: "LeetCode",
    solved_on: new Date().toISOString().slice(0, 10),
    confidence: 0.45,
    needs_revision: 1,
  },
  {
    id: 2,
    title: "Coin Change",
    topic: "Dynamic Programming",
    difficulty: "medium",
    platform: "LeetCode",
    solved_on: new Date().toISOString().slice(0, 10),
    confidence: 0.35,
    needs_revision: 1,
  },
];

const internshipFallback: InternshipApplication[] = [];

async function getToken(): Promise<string> {
  if (typeof window === "undefined") return "";
  
  // @ts-ignore
  let clerk = window.Clerk;
  
  // If Clerk isn't loaded yet, wait a bit
  if (!clerk) {
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 100));
      // @ts-ignore
      clerk = window.Clerk;
      if (clerk) break;
    }
  }

  if (clerk?.session) {
    return await clerk.session.getToken();
  }
  return "";
}

export async function submitOnboarding(payload: any, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/onboarding", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Submission failed" }));
    throw new Error(error.detail || "Submission failed");
  }

  return await response.json();
}

async function apiGet<T>(path: string, fallback: T, explicitToken?: string): Promise<T> {
  try {
    const token = explicitToken || await getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`/api/backend${path}`, { 
      headers,
      next: { revalidate: 30 } 
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function getDashboardSnapshot(token?: string) {
  return apiGet<DashboardSnapshot>("/dashboard/snapshot", dashboardFallback, token);
}

export function getDsaInsight(token?: string) {
  return apiGet<DsaInsight>("/dsa/insight", dsaFallback, token);
}

export function getDsaProblems(token?: string) {
  return apiGet<DsaProblem[]>("/dsa/problems", [], token);
}

export function getDsaStats(token?: string) {
  return apiGet<any>("/dsa/stats", null, token);
}

export async function createDsaProblem(payload: DsaProblemCreate, explicitToken?: string): Promise<DsaProblem> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/dsa/log", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("DSA problem creation failed");
  return (await response.json()) as DsaProblem;
}

export function getTasks(token?: string) {
  return apiGet<Task[]>("/tasks", taskFallback, token);
}

export async function createTask(payload: TaskCreate, explicitToken?: string): Promise<Task> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/tasks", {
    method: "POST",
    headers,
    body: JSON.stringify({ status: "todo", ...payload }),
  });
  if (!response.ok) throw new Error("Task creation failed");
  return (await response.json()) as Task;
}

export function getInternshipApplications(token?: string) {
  return apiGet<InternshipApplication[]>("/applications", internshipFallback, token);
}

export async function createInternshipApplication(
  payload: InternshipApplicationCreate,
  explicitToken?: string,
): Promise<InternshipApplication> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/applications", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("DEBUG: Application creation failed:", response.status, errorBody);
    throw new Error(`Internship application creation failed: ${response.status} ${errorBody.detail || ""}`);
  }
  return (await response.json()) as InternshipApplication;
}

export async function updateInternshipApplication(
  id: string,
  payload: Partial<InternshipApplicationCreate>,
  explicitToken?: string
): Promise<InternshipApplication> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/backend/applications/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Internship application update failed");
  return (await response.json()) as InternshipApplication;
}

export async function deleteInternshipApplication(id: string, explicitToken?: string): Promise<void> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/backend/applications/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Internship application deletion failed");
}

export function getAiSessions(token?: string) {
  return apiGet<any[]>("/ai/sessions", [], token);
}

export function getAiSession(id: string, token?: string) {
  return apiGet<any>(`/ai/sessions/${id}`, null, token);
}

export async function deleteAiSession(id: string, explicitToken?: string) {
  if (!id) {
    console.error("DEBUG: deleteAiSession called with null/undefined id");
    throw new Error("Invalid session ID");
  }

  const token = explicitToken || await getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`/api/backend/ai/sessions/${id}`, {
      method: "DELETE",
      headers,
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("DEBUG: AI session deletion failed:", response.status, errorBody);
      throw new Error(errorBody.detail || `Deletion failed with status ${response.status}`);
    }
  } catch (err: any) {
    console.error("DEBUG: Exception in deleteAiSession:", err);
    throw err;
  }
}

export function getSubjects(token?: string) {
  return apiGet<any[]>("/subjects", [], token);
}

export async function createSubject(data: any, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/subjects", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("DEBUG: Backend returned error:", response.status, errorBody);
    throw new Error(`Subject creation failed: ${response.status} ${errorBody.detail || ""}`);
  }
  return response.json();
}

export async function updateSubject(id: string, data: any, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/backend/subjects/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Subject update failed");
  return response.json();
}

export async function deleteSubject(id: string, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/backend/subjects/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Subject deletion failed");
}

export async function askMentor(question: string, explicitToken?: string): Promise<MentorResponse> {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/ai/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ message: question }),
  });
  if (!response.ok) throw new Error("Mentor request failed");
  return (await response.json()) as MentorResponse;
}

// Habit Tracker
export function getHabits(token?: string) {
  return apiGet<any[]>("/habits/", [], token);
}

export async function createHabit(data: any, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch("/api/backend/habits/", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Habit creation failed");
  return response.json();
}

export async function toggleHabit(habitId: string, date?: string, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `/api/backend/habits/${habitId}/toggle${date ? `?date_str=${date}` : ""}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
  });
  if (!response.ok) throw new Error("Habit toggle failed");
  return response.json();
}

export async function deleteHabit(habitId: string, explicitToken?: string) {
  const token = explicitToken || await getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/backend/habits/${habitId}/`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Habit deletion failed");
  return response.json();
}
