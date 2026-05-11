"use client";

import { CalendarPlus, Plus, SignalHigh } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { Task, TaskPriority } from "@/lib/types";
import { createTask } from "@/services/placementos-api";

type TasksWorkspaceProps = {
  initialTasks: Task[];
};

const priorityOptions: TaskPriority[] = ["high", "medium", "low"];

export function TasksWorkspace({ initialTasks }: TasksWorkspaceProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DSA");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const counts = useMemo(
    () => ({
      open: tasks.filter((task) => task.status !== "done").length,
      high: tasks.filter((task) => task.priority === "high" && task.status !== "done").length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Add a task title first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const task = await createTask({
        title: title.trim(),
        category,
        priority,
        due_date: dueDate || null,
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
      setDueDate("");
    } catch {
      setError("Could not create the task. Start the backend and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="tasks-layout">
      <form className="panel task-form" onSubmit={onSubmit}>
        <div className="section-head">
          <h2>Create Task</h2>
          <Plus size={18} />
        </div>

        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Solve graph revision set" />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>DSA</option>
              <option>CS Core</option>
              <option>Internships</option>
              <option>Resume</option>
              <option>AI Mentor</option>
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Due Date</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>

        <button className="button" disabled={isSubmitting} type="submit">
          <CalendarPlus size={18} />
          {isSubmitting ? "Adding" : "Add Task"}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <div className="grid">
        <div className="grid task-stats">
          <article className="panel compact-stat">
            <span>Open</span>
            <strong>{counts.open}</strong>
          </article>
          <article className="panel compact-stat">
            <span>High Priority</span>
            <strong>{counts.high}</strong>
          </article>
          <article className="panel compact-stat">
            <span>Done</span>
            <strong>{counts.done}</strong>
          </article>
        </div>

        <article className="panel">
          <div className="section-head">
            <h2>Preparation Queue</h2>
            <SignalHigh size={18} />
          </div>
          <div className="task-table">
            {tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div>
                  <div className="focus-title">{task.title}</div>
                  <div className="focus-meta">
                    {task.category} | {task.due_date ?? "Unscheduled"}
                  </div>
                </div>
                <span className={`status-badge ${task.priority}`}>{task.priority}</span>
                <span className="pill">{task.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
