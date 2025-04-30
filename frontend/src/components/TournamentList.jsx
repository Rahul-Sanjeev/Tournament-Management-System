import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTournaments } from '../hooks/useRedux';

export default function TournamentList() {
    const { tournaments, isLoading, error, fetchTournaments } = useTournaments();

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    if (isLoading) {
        return <div className="text-center p-4">Loading tournaments...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Your Tournaments</h2>

            {tournaments.length === 0 ? (
                <p className="text-gray-500">No tournaments found. Create one to get started.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournaments.map((tournament) => (
                        <div key={tournament.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-semibold">{tournament.name}</h3>
                            <p className="text-gray-600 mb-2">{tournament.description}</p>
                            <div className="mt-4">
                                <Link
                                    to={`/tournament/${tournament.id}`}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <Link
                    to="/tournament/create"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create New Tournament
                </Link>
            </div>
        </div>
    );
} 