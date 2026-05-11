"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AppSidebar } from "@/components/app-sidebar";
import { TasksWorkspace } from "@/components/tasks/tasks-workspace";
import { getTasks } from "@/services/placementos-api";
import { Task } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isLoaded, userId, getToken } = useAuth();

  useEffect(() => {
    async function load() {
      if (isLoaded && userId) {
        const token = await getToken();
        const data = await getTasks(token || undefined);
        setTasks(data);
      }
    }
    load();
  }, [isLoaded, userId, getToken]);

  return (
    <div className="page-shell">
      <AppSidebar active="tasks" />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Execution layer</p>
            <h1>Tasks</h1>
            <p className="subtitle">
              Turn placement prep into visible daily actions across DSA, CS core, resume, and internship work.
            </p>
          </div>
        </header>
        <TasksWorkspace initialTasks={tasks} />
      </main>
    </div>
  );
}
