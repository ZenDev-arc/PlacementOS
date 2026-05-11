import { AppSidebar } from "@/components/app-sidebar";
import { InternshipsWorkspace } from "@/components/internships/internships-workspace";
import { getInternshipApplications } from "@/services/placementos-api";

export default async function InternshipsPage() {
  const applications = await getInternshipApplications();

  return (
    <div className="page-shell">
      <AppSidebar active="internships" />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Application CRM</p>
            <h1>Internships</h1>
            <p className="subtitle">
              Track companies, roles, sources, and follow-up pressure from first application to offer.
            </p>
          </div>
        </header>
        <InternshipsWorkspace initialApplications={applications} />
      </main>
    </div>
  );
}
