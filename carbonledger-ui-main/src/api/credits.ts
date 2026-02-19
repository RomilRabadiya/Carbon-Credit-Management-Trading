import { useQuery } from "@tanstack/react-query";
import type { Credit, CreditsResponse } from "@/types";


// Simulated API call function
import apiClient from "./client";

export async function fetchCreditsApi(organizationId: string): Promise<CreditsResponse> {
  const response = await apiClient.get<CreditsResponse>(`/credits/organization/${organizationId}`);
  return response.data;
}

export function useWalletCredits(organizationId: string) {
  return useQuery({
    queryKey: ["credits", organizationId],
    queryFn: () => fetchCreditsApi(organizationId),
    staleTime: 30000, // 30 seconds
    enabled: !!organizationId,
  });
}

// Computed values hook
export function useCreditStats(credits: Credit[] | undefined) {
  if (!credits) {
    return {
      totalCarbonShare: 0,
      activeCount: 0,
      retiredCount: 0,
    };
  }

  const activeCredits = credits.filter((c) => c.status === "ACTIVE");
  const retiredCredits = credits.filter((c) => c.status === "RETIRED");

  return {
    totalCarbonShare: activeCredits.reduce((sum, c) => sum + c.amount, 0),
    activeCount: activeCredits.length,
    retiredCount: retiredCredits.length,
  };
}
