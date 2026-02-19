import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Credit, DashboardStats } from "@/types";
import { fetchCreditsApi } from "@/api/credits";

export const fetchCredits = createAsyncThunk(
    "wallet/fetchCredits",
    async (organizationId: string) => {
        const response = await fetchCreditsApi(organizationId);
        return response;
    }
);

interface WalletState {
    credits: Credit[];
    stats: DashboardStats;
    loading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    credits: [],
    stats: {
        totalCarbonShare: 0,
        creditsMinted: 0,
        creditsRetired: 0,
    },
    loading: false,
    error: null,
};

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        setCredits: (state, action: PayloadAction<Credit[]>) => {
            state.credits = action.payload;
        },
        setStats: (state, action: PayloadAction<DashboardStats>) => {
            state.stats = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        addCredit: (state, action: PayloadAction<Credit>) => {
            state.credits.push(action.payload);
            state.stats.creditsMinted += action.payload.amount;
            state.stats.totalCarbonShare += action.payload.amount;
        },
        retireCreditInState: (state, action: PayloadAction<{ id: number; amount: number }>) => {
            const credit = state.credits.find(c => c.id === action.payload.id);
            if (credit) {
                credit.status = "RETIRED";
                state.stats.totalCarbonShare -= action.payload.amount;
                state.stats.creditsRetired += action.payload.amount;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCredits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCredits.fulfilled, (state, action) => {
                state.loading = false;
                state.credits = action.payload.credits;
                // Calculate stats for initial load
                const activeCredits = action.payload.credits.filter((c) => c.status === "ACTIVE");
                const retiredCredits = action.payload.credits.filter((c) => c.status === "RETIRED");
                state.stats.totalCarbonShare = activeCredits.reduce((sum, c) => sum + c.amount, 0);
                state.stats.creditsMinted = action.payload.credits.reduce((sum, c) => sum + c.amount, 0); // Approx
                state.stats.creditsRetired = retiredCredits.reduce((sum, c) => sum + c.amount, 0);
            })
            .addCase(fetchCredits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch credits";
            });
    },
});

export const { setCredits, setStats, setLoading, setError, addCredit, retireCreditInState } = walletSlice.actions;
export default walletSlice.reducer;
