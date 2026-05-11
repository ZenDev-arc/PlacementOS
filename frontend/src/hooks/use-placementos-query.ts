import { useQuery } from "@tanstack/react-query";

import { getDashboardSnapshot } from "@/services/placementos-api";

export function usePlacementDashboard() {
  return useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => getDashboardSnapshot(),
  });
}
