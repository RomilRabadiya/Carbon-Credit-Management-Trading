import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitEmissionReportApi, EmissionReportRequest } from "@/api/emissions";

export const submitReport = createAsyncThunk(
    "emissions/submitReport",
    async (data: EmissionReportRequest) => {
        const response = await submitEmissionReportApi(data);
        return response;
    }
);

interface EmissionState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: EmissionState = {
    loading: false,
    error: null,
    success: false,
};

const emissionSlice = createSlice({
    name: "emissions",
    initialState,
    reducers: {
        resetEmissionState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitReport.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(submitReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to submit report";
            });
    },
});

export const { resetEmissionState } = emissionSlice.actions;
export default emissionSlice.reducer;
