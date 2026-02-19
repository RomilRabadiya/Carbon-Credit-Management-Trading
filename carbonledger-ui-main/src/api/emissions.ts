import apiClient from "./client";

export interface EmissionReportRequest {
    projectId?: number; // Optional if new? OR required?
    organizationId: number;
    projectType: string; // REFORESTATION, METHANE_CAPTURE, SOLAR, WIND
    data: Record<string, any>; // Flexible data
    evidenceUrl?: string;
    latitude: number;
    longitude: number;
}

export interface EmissionReportResponse {
    id: string;
    status: string;
    message: string;
}

export const submitEmissionReportApi = async (data: EmissionReportRequest) => {
    const response = await apiClient.post<any>("/emissions", data);
    return response.data;
};
