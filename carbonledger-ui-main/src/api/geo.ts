import apiClient from "./client";

// Interface for the analysis result
export interface GeoAnalysisResult {
    projectId: string;
    lat: number;
    lon: number;
    nonGreenPercentage: number;
    status: "VERIFIED" | "WARNING" | "HIGH_RISK" | "FRAUD_RISK";
    details: string;
}

export async function analyzeLand(projectId: string, lat: number, lon: number): Promise<GeoAnalysisResult> {
    try {
        // apiClient already has /api prefix, so use relative path
        const response = await apiClient.post("/geo/analyze", {
            projectId,
            lat,
            lon,
            buffer_m: 5000
        });
        return response.data;
    } catch (error) {
        console.error("Geo Service unreachable", error);
        throw error;
    }
}
