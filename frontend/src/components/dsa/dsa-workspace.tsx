"use client";

import { Binary, Brain, Plus, RotateCcw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { DsaDifficulty, DsaInsight, DsaProblem } from "@/lib/types";
import { createDsaProblem } from "@/services/placementos-api";

type DsaWorkspaceProps = {
  initialInsight: DsaInsight;
  initialProblems: DsaProblem[];
};

const topics = ["Arrays", "Strings", "Graphs", "Dynamic Programming", "Trees", "Heaps", "Linked List", "Stack"];
const difficulties: DsaDifficulty[] = ["easy", "medium", "hard"];

export function DsaWorkspace({ initialInsight, initialProblems }: DsaWorkspaceProps) {
  const [problems, setProblems] = useState(initialProblems);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Graphs");
  const [difficulty, setDifficulty] = useState<DsaDifficulty>("medium");
  const [platform, setPlatform] = useState("LeetCode");
  const [confidence, setConfidence] = useState(0.5);
  const [needsRevision, setNeedsRevision] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(
    () => ({
      solved: problems.length,
      revision: problems.filter((problem) => problem.needs_revision === 1).length,
      hard: problems.filter((problem) => problem.difficulty === "hard").length,
    }),
    [problems],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Add a problem title first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const problem = await createDsaProblem({
        title: title.trim(),
        topic,
        difficulty,
        platform,
        confidence,
        needs_revision: needsRevision ? 1 : 0,
        solved_on: new Date().toISOString().slice(0, 10),
      });
      setProblems((current) => [problem, ...current]);
      setTitle("");
      setConfidence(0.5);
      setNeedsRevision(true);
    } catch {
      setError("Could not add the problem. Make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="dsa-layout">
      <form className="panel task-form" onSubmit={onSubmit}>
        <div className="section-head">
          <h2>Add Problem</h2>
          <Plus size={18} />
        </div>

        <label className="field">
          <span>Problem</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Course Schedule" />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Topic</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              {topics.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DsaDifficulty)}>
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Platform</span>
          <input value={platform} onChange={(event) => setPlatform(event.target.value)} />
        </label>

        <label className="field">
          <span>Confidence: {Math.round(confidence * 100)}%</span>
          <input
            max="1"
            min="0"
            step="0.05"
            type="range"
            value={confidence}
            onChange={(event) => setConfidence(Number(event.target.value))}
          />
        </label>

        <label className="check-field">
          <input checked={needsRevision} type="checkbox" onChange={(event) => setNeedsRevision(event.target.checked)} />
          <span>Needs revision</span>
        </label>

        <button className="button" disabled={isSubmitting} type="submit">
          <Binary size={18} />
          {isSubmitting ? "Adding" : "Log Problem"}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <div className="grid">
        <div className="grid task-stats">
          <article className="panel compact-stat">
            <span>Solved</span>
            <strong>{stats.solved}</strong>
          </article>
          <article className="panel compact-stat">
            <span>Revision</span>
            <strong>{stats.revision}</strong>
          </article>
          <article className="panel compact-stat">
            <span>Hard</span>
            <strong>{stats.hard}</strong>
          </article>
        </div>

        <section className="grid dsa-content-grid">
          <article className="panel">
            <div className="section-head">
              <h2>Topic Mastery</h2>
              <Brain size={18} />
            </div>
            {initialInsight.topic_progress.map((item) => (
              <div className="progress-row" key={item.topic}>
                <div className="progress-label">
                  <span>{item.topic}</span>
                  <span>
                    {item.solved}/{item.target} | {item.mastery}%
                  </span>
                </div>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${item.mastery}%` }} />
                </div>
              </div>
            ))}
          </article>

          <article className="panel">
            <div className="section-head">
              <h2>Revision Focus</h2>
              <RotateCcw size={18} />
            </div>
            <div className="agent-list">
              {initialInsight.recommended_next.map((item) => (
                <span className="pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>

        <article className="panel">
          <div className="section-head">
            <h2>Solved Problems</h2>
            <span className="pill">{problems.length} tracked</span>
          </div>
          <div className="problem-table">
            {problems.map((problem) => (
              <div className="problem-row" key={problem.id}>
                <div>
                  <div className="focus-title">{problem.title}</div>
                  <div className="focus-meta">
                    {problem.topic} | {problem.platform} | {problem.solved_on ?? "Not dated"}
                  </div>
                </div>
                <span className={`status-badge ${problem.difficulty}`}>{problem.difficulty}</span>
                <span className={problem.needs_revision ? "revision-chip due" : "revision-chip"}>{problem.needs_revision ? "Revise" : "Stable"}</span>
                <span className="pill">{Math.round(problem.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
