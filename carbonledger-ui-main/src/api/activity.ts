import apiClient from "./client";
import { useQuery } from "@tanstack/react-query";
import { AuditEvent, Activity } from "@/types";

// Raw Audit Record from Backend
export interface AuditRecord {
    id: number;
    eventType: string; // "CREDIT_ISSUED", "CREDIT_RETIRED", etc.
    entityId: string;
    serialNumber: string;
    details: string;
    actor: string;
    timestamp: string;
}

export async function fetchActivityApi(organizationId: string): Promise<AuditRecord[]> {
    const response = await apiClient.get<AuditRecord[]>(`/audit/organization/${organizationId}`);
    return response.data;
}

export function useActivity(organizationId: string) {
    return useQuery({
        queryKey: ["activity", organizationId],
        queryFn: (() => fetchActivityApi(organizationId)),
        staleTime: 10000, // 10 seconds
        enabled: !!organizationId,
    });
}

// Helper to map AuditRecord to Dashboard Activity
export function mapAuditToActivity(record: AuditRecord): Activity {
    let type: Activity["type"] = "transfer"; // default
    let description = "Unknown activity";
    let amount = 0;

    // JSON parsing details safely
    let detailsObj: any = {};
    try {
        detailsObj = JSON.parse(record.details);
    } catch (e) {
        console.warn("Failed to parse audit details", e);
    }

    if (record.eventType === "CREDIT_ISSUED") {
        type = "mint";
        description = `Credits minted (Serial: ${record.serialNumber})`;
        amount = detailsObj.amount || 0;
    } else if (record.eventType === "CREDIT_RETIRED") {
        type = "retire";
        description = `Credits retired (Serial: ${record.serialNumber})`;
        amount = detailsObj.amount || 0;
    } else if (record.eventType === "TRANSFERRED") { // Assuming this event existed or will exist
        type = "transfer";
        description = `Credits transferred`;
        amount = detailsObj.amount || 0;
    }

    return {
        id: record.id.toString(),
        type,
        description,
        amount,
        timestamp: record.timestamp,
    };
}
