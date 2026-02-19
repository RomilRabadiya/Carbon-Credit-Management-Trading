import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { MarketListing } from "@/types";
import { fetchListingsApi } from "@/api/market";

export const fetchListings = createAsyncThunk(
    "market/fetchListings",
    async () => {
        return await fetchListingsApi();
    }
);

interface MarketState {
    listings: MarketListing[];
    loading: boolean;
    error: string | null;
}

const initialState: MarketState = {
    listings: [],
    loading: false,
    error: null,
};

const marketSlice = createSlice({
    name: "market",
    initialState,
    reducers: {
        setListings: (state, action: PayloadAction<MarketListing[]>) => {
            state.listings = action.payload;
        },
        addListing: (state, action: PayloadAction<MarketListing>) => {
            state.listings.push(action.payload);
        },
        removeListing: (state, action: PayloadAction<string>) => {
            state.listings = state.listings.filter(l => l.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchListings.fulfilled, (state, action) => {
                state.loading = false;
                state.listings = action.payload;
            })
            .addCase(fetchListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch listings";
            });
    },
});

export const { setListings, addListing, removeListing, setLoading } = marketSlice.actions;
export default marketSlice.reducer;
