"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding is completed
    const onboarding = localStorage.getItem("pos_onboarding");
    if (!onboarding && !pathname.includes("/onboarding")) {
      router.push("/onboarding");
    } else {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) return null; // Prevent flash of dashboard before redirect

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="flex flex-col">
        {/* Main Dashboard Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
