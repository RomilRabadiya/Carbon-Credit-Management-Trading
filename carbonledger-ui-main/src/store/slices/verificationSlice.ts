import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { VerificationRequest } from "@/types";
import { fetchVerificationRequestsApi, approveVerificationApi, rejectVerificationApi } from "@/api/verification";

export const fetchRequests = createAsyncThunk(
    "verification/fetchRequests",
    async () => {
        return await fetchVerificationRequestsApi();
    }
);

export const approveRequest = createAsyncThunk(
    "verification/approveRequest",
    async (id: string) => {
        await approveVerificationApi(id);
        return id;
    }
);

export const rejectRequest = createAsyncThunk(
    "verification/rejectRequest",
    async (id: string) => {
        await rejectVerificationApi(id);
        return id;
    }
);

interface VerificationState {
    requests: VerificationRequest[];
    loading: boolean;
    error: string | null;
}

const initialState: VerificationState = {
    requests: [],
    loading: false,
    error: null,
};

const verificationSlice = createSlice({
    name: "verification",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch requests";
            })
            .addCase(approveRequest.fulfilled, (state, action) => {
                const req = state.requests.find((r) => r.id === Number(action.payload));
                if (req) req.status = "APPROVED";
            })
            .addCase(rejectRequest.fulfilled, (state, action) => {
                const req = state.requests.find((r) => r.id === Number(action.payload));
                if (req) req.status = "REJECTED";
            });
    },
});

export default verificationSlice.reducer;
