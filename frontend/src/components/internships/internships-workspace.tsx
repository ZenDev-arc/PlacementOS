"use client";

import { BriefcaseBusiness, Building2, Plus, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { ApplicationStatus, InternshipApplication } from "@/lib/types";
import { createInternshipApplication } from "@/services/placementos-api";

type InternshipsWorkspaceProps = {
  initialApplications: InternshipApplication[];
};

const statuses: ApplicationStatus[] = ["Identified", "Applied", "OA", "Interview", "Offer", "Rejected", "Ghosted"];
const visiblePipeline: ApplicationStatus[] = ["Applied", "OA", "Interview", "Offer"];

export function InternshipsWorkspace({ initialApplications }: InternshipsWorkspaceProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [source, setSource] = useState("LinkedIn");
  const [appliedOn, setAppliedOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pipeline = useMemo(
    () =>
      visiblePipeline.map((item) => ({
        status: item,
        count: applications.filter((application) => application.status === item).length,
      })),
    [applications],
  );

  const activeCount = applications.filter((application) =>
    ["Applied", "OA", "Interview"].includes(application.status),
  ).length;
  const interviewCount = applications.filter((application) => application.status === "Interview").length;
  const offerCount = applications.filter((application) => application.status === "Offer").length;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!company.trim() || !role.trim()) {
      setError("Add both company and role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const application = await createInternshipApplication({
        company_name: company.trim(),
        role_title: role.trim(),
        status,
        platform: source.trim() || "Manual",
        date_applied: appliedOn || null,
        notes,
      });
      setApplications((current) => [application, ...current]);
      setCompany("");
      setRole("");
      setNotes("");
      setStatus("Applied");
    } catch {
      setError("Could not add the application. Make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="internships-layout">
      <form className="panel task-form" onSubmit={onSubmit}>
        <div className="section-head">
          <h2>Add Application</h2>
          <Plus size={18} />
        </div>

        <label className="field">
          <span>Company</span>
          <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Acme Labs" />
        </label>

        <label className="field">
          <span>Role</span>
          <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Backend Intern" />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Applied On</span>
            <input type="date" value={appliedOn} onChange={(event) => setAppliedOn(event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Source</span>
          <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Referral" />
        </label>

        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Recruiter, round, or follow-up details" />
        </label>

        <button className="button" disabled={isSubmitting} type="submit">
          <Send size={18} />
          {isSubmitting ? "Adding" : "Add Application"}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <div className="grid">
        <div className="grid task-stats">
          <article className="panel compact-stat">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </article>
          <article className="panel compact-stat">
            <span>Interviews</span>
            <strong>{interviewCount}</strong>
          </article>
          <article className="panel compact-stat">
            <span>Offers</span>
            <strong>{offerCount}</strong>
          </article>
        </div>

        <article className="panel">
          <div className="section-head">
            <h2>Pipeline</h2>
            <BriefcaseBusiness size={18} />
          </div>
          <div className="pipeline internship-pipeline">
            {pipeline.map((item) => (
              <div className="pipeline-step" key={item.status}>
                <div className="pipeline-value">{item.count}</div>
                <div className="pipeline-label">{item.status}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-head">
            <h2>Applications</h2>
            <Building2 size={18} />
          </div>
          <div className="application-table">
            {applications.map((application) => (
              <div className="application-row" key={application.id}>
                <div>
                  <div className="focus-title">{application.company_name}</div>
                  <div className="focus-meta">
                    {application.role_title} | {application.platform} | {application.date_applied ?? "Not dated"}
                  </div>
                </div>
                <span className={`application-status ${application.status}`}>{application.status}</span>
                <span className="application-notes">{application.notes || "No notes"}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
