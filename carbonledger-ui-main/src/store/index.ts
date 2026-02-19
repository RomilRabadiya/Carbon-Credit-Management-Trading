import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import walletReducer from "./slices/walletSlice";
import marketReducer from "./slices/marketSlice";
import verificationReducer from "./slices/verificationSlice";
import emissionReducer from "./slices/emissionSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        wallet: walletReducer,
        market: marketReducer,
        verification: verificationReducer,
        emissions: emissionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
