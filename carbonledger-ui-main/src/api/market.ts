import apiClient from "./client";
import { MarketListing } from "@/types";

export const fetchListingsApi = async (): Promise<MarketListing[]> => {
    const response = await apiClient.get<MarketListing[]>("/trading/listings");
    return response.data;
};

export const createListingApi = async (
    creditId: number,
    price: number,
    organizationId: number
): Promise<MarketListing> => {
    const response = await apiClient.post<MarketListing>("/trading/list",
        { creditId, price },
        { headers: { "X-Organization-Id": organizationId.toString() } }
    );
    return response.data;
};

export const buyCreditApi = async (listingId: string): Promise<void> => {
    await apiClient.post(`/trading/buy`, { listingId });
};

