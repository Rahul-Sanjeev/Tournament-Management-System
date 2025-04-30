import { configureStore } from '@reduxjs/toolkit';
import tournamentReducer from './slices/tournamentSlice';

// Import reducers from slices (will be added later)

export const store = configureStore({
    reducer: {
        tournaments: tournamentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
}); 