import apiClient from "./client";
import { VerificationRequest } from "@/types";

export interface VerificationResponse {
    requests: VerificationRequest[];
}

export const fetchVerificationRequestsApi = async (): Promise<VerificationRequest[]> => {
    // Assuming the backend endpoint is /verifications
    const response = await apiClient.get<VerificationRequest[]>("/verifications");
    return response.data;
};

export const approveVerificationApi = async (id: string): Promise<void> => {
    await apiClient.put(`/verifications/${id}/approve`, { remarks: "Approved via Web UI" });
};

export const rejectVerificationApi = async (id: string): Promise<void> => {
    await apiClient.post(`/verifications/${id}/reject`, { remarks: "Rejected via Web UI" });
};
