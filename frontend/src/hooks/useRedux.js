import { useSelector, useDispatch } from 'react-redux';
import {
    fetchTournaments,
    createTournament,
    setCurrentTournament,
    clearCurrentTournament
} from '../store/slices/tournamentSlice';

export const useTournaments = () => {
    const dispatch = useDispatch();
    const { items, currentTournament, loading, error } = useSelector((state) => state.tournaments);

    return {
        tournaments: items,
        currentTournament,
        isLoading: loading,
        error,
        fetchTournaments: () => dispatch(fetchTournaments()),
        createTournament: (data) => dispatch(createTournament(data)),
        setCurrentTournament: (tournament) => dispatch(setCurrentTournament(tournament)),
        clearCurrentTournament: () => dispatch(clearCurrentTournament()),
    };
}; 