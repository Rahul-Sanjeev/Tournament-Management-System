import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { PlusCircleIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Funtion for shuffling the participants
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
const EventParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    eventType: 'ALL',
    participationType: 'ALL',
    gender: 'ALL'
  });

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        const [tournamentRes, eventsRes] = await Promise.all([
          axios.get(`/api/tournaments/${id}/`),
          axios.get(`/api/events/?tournament=${id}`)
        ]);
        setTournament(tournamentRes.data);
        setEvents(eventsRes.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tournament data:', err);
        setError('Failed to fetch tournament data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id]);

  useEffect(() => {
    const fetchEventParticipants = async () => {
      if (!selectedEvent) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/participants/?tournament=${id}&event=${selectedEvent.id}`);
        // Shuffle the participants array before setting state
        const shuffledParticipants = shuffleArray(response.data);
        setParticipants(shuffledParticipants);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch participants:', err);
        setError('Failed to fetch participants: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchEventParticipants();
  }, [selectedEvent, id]);

  const filteredEvents = events.filter(event => {
    const matchesEventType = filters.eventType === 'ALL' || event.category.includes(filters.eventType);
    const matchesParticipation = filters.participationType === 'ALL' ||
      (filters.participationType === 'TEAM' && event.category.includes('TEAM')) ||
      (filters.participationType === 'INDIVIDUAL' && !event.category.includes('TEAM'));
    const matchesGender = filters.gender === 'ALL' || event.gender === filters.gender;
    return matchesEventType && matchesParticipation && matchesGender;
  });

  const handleGenerateBrackets = async () => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    try {
      setLoading(true);
      // Shuffle participants again before sending to bracket generation
      const shuffledParticipants = shuffleArray(participants);
      await axios.post(`/api/events/${selectedEvent.id}/generate_brackets/`, {
        tournament_id: id,
        participants: shuffledParticipants.map(p => p.id) // Assuming backend expects participant IDs
      });
      setError(null);
      alert('Brackets generated successfully with random seeding');
    } catch (err) {
      console.error('Failed to generate brackets:', err);
      setError('Failed to generate brackets: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const exportParticipantsPDF = () => {
    if (!participants.length || !selectedEvent) return;

    const doc = new jsPDF();
    doc.setFontSize(12);
    const title = `${selectedEvent.category.replace(/_/g, ' ')} Participants`;
    doc.text(title, 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tournament: ${tournament?.name}`, 14, 22);

    autoTable(doc, {
      head: [['Name', 'Age', 'Gender', 'Weight', 'Belt', 'Club']],
      body: participants.map(p => [
        p.full_name,
        p.age,
        p.gender === 'M' ? 'Male' : 'Female',
        p.weight ? `${p.weight} kg` : '-',
        p.belt_rank,
        p.club || '-'
      ]),
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [255, 255, 255] }
    });

    doc.save(`${selectedEvent.category}_participants.pdf`);
  };

  if (loading && !events.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar - Updated with better spacing and modern card design */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 lg:sticky lg:top-8">
            {/* Header section with subtle border */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Event Filters</h3>
              <button
                onClick={() => setFilters({ eventType: 'ALL', participationType: 'ALL', gender: 'ALL' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filters
              </button>
            </div>

            {/* Filter controls with better spacing */}
            <div className="space-y-6">
              {/* Event Type Filter - Updated select styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
                <div className="relative">
                  <select
                    value={filters.eventType}
                    onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="KATA">Kata</option>
                    <option value="KUMITE">Kumite</option>
                  </select>
                </div>
              </div>

              {/* Participation Type Filter - Grid buttons with improved hover states */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Participation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['ALL', 'INDIVIDUAL', 'TEAM'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({ ...prev, participationType: type }))}
                      className={`py-2 text-sm font-medium rounded-md transition-colors ${filters.participationType === type ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {type === 'ALL' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter - Improved color coding */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['ALL', 'M', 'F'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setFilters(prev => ({ ...prev, gender }))}
                      className={`py-2 text-sm font-medium rounded-md transition-colors ${filters.gender === gender
                        ? gender === 'M'
                          ? 'bg-blue-600 text-white'
                          : gender === 'F'
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {gender === 'ALL' ? 'All' : gender === 'M' ? 'Male' : 'Female'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event List - Improved scrolling and selection indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Available Events</h4>
                <span className="text-xs text-gray-500">{filteredEvents.length} results</span>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`group p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedEvent?.id === event.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-transparent hover:border-blue-200 bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {event.category.replace(/_/g, ' ')}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{event.age_category.replace(/_/g, ' ')}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`font-medium ${event.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
                            }`}>
                            {event.gender === 'M' ? 'Male' : 'Female'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {event.weight_category && (
                      <div className="mt-3">
                        <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {event.weight_category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Enhanced card design and table styling */}
        <div className="flex-1">
          {selectedEvent ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Header with action buttons */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {selectedEvent.category.replace(/_/g, ' ')}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{selectedEvent.age_category.replace(/_/g, ' ')}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`font-medium ${selectedEvent.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
                        }`}>
                        {selectedEvent.gender === 'M' ? 'Male' : 'Female'}
                      </span>
                      {selectedEvent.weight_category && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium">
                            {selectedEvent.weight_category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportParticipantsPDF}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Export PDF"
                      disabled={!participants.length}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleGenerateBrackets}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Generate Brackets"
                      disabled={!participants.length}
                    >
                      <EyeIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area - Improved table styling */}
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : participants.length === 0 ? (
                  <div className="text-center p-12">
                    <p className="text-gray-500 mb-6">No participants registered yet</p>
                  <button
                    onClick={() => navigate(`/tournament/${id}/participants/add`)}
                      className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                      <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add Participant
                  </button>
                </div>
              ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Name', 'Age', 'Weight', 'Belt'].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map(participant => (
                        <tr
                          key={participant.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.full_name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {participant.club}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {participant.age}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {participant.weight ? `${participant.weight}kg` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {participant.belt_rank}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
              <div className="h-96 flex items-center justify-center bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <span className="text-sm text-gray-400">Select an event to view participants</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventParticipants;