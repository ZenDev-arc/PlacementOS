import { AppSidebar } from "@/components/app-sidebar";
import { TasksWorkspace } from "@/components/tasks/tasks-workspace";
import { getTasks } from "@/services/placementos-api";

export default async function TasksPage() {
  const tasks = await getTasks();

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
