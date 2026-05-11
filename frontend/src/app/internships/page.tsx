"use client";
 
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AppSidebar } from "@/components/app-sidebar";
import { InternshipsWorkspace } from "@/components/internships/internships-workspace";
import { getInternshipApplications } from "@/services/placementos-api";
import { InternshipApplication } from "@/lib/types";
 
export default function InternshipsPage() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const { isLoaded, userId, getToken } = useAuth();
 
  useEffect(() => {
    async function load() {
      if (isLoaded && userId) {
        const token = await getToken();
        const data = await getInternshipApplications(token || undefined);
        setApplications(data);
      }
    }
    load();
  }, [isLoaded, userId, getToken]);
 
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
