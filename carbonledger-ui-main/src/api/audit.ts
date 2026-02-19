import { useQuery } from "@tanstack/react-query";
import type { AuditChainResponse, AuditEvent } from "@/types";
import apiClient from "./client";
import { AuditRecord } from "./activity";

async function fetchAuditChain(serialNumber: string): Promise<AuditChainResponse> {
  const response = await apiClient.get<AuditRecord[]>(`/audit/chain-of-custody/${serialNumber}`);

  // Transform backend records to frontend timeline events if needed, 
  // or simple return the list if the UI can handle AuditRecord[] directly.
  // Based on AuditTimeline.tsx, it expects { id, action, timestamp, actor, details }

  const events = response.data.map((record) => ({
    id: record.id,
    action: record.eventType as any, // Cast to AuditAction
    timestamp: record.timestamp,
    actor: record.actor,
    details: record.details,
  }));

  return {
    serialNumber,
    events,
  };
}

export function useAuditTimeline(serialNumber: string) {
  return useQuery({
    queryKey: ["audit", serialNumber],
    queryFn: () => fetchAuditChain(serialNumber),
    staleTime: 60000, // 1 minute
    enabled: !!serialNumber && serialNumber.length > 0,
  });
}
