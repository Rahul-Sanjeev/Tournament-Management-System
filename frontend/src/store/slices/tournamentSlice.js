import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTournaments = createAsyncThunk(
    'tournaments/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/tournaments');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createTournament = createAsyncThunk(
    'tournaments/create',
    async (tournamentData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/tournaments', tournamentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const tournamentSlice = createSlice({
    name: 'tournaments',
    initialState: {
        items: [],
        currentTournament: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentTournament: (state, action) => {
            state.currentTournament = action.payload;
        },
        clearCurrentTournament: (state) => {
            state.currentTournament = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTournaments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTournaments.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchTournaments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch tournaments';
            })
            .addCase(createTournament.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTournament.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.loading = false;
            })
            .addCase(createTournament.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create tournament';
            });
    }
});

export const { setCurrentTournament, clearCurrentTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer; 