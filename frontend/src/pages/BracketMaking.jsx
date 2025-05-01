import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { PlusCircleIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';



// Add this shuffle function at the top of the file
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Modern Filter Sidebar */}
        <div className="lg:w-72 xl:w-80">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Filters</h3>
              <button
                onClick={() => setFilters({ eventType: 'ALL', participationType: 'ALL', gender: 'ALL' })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
                <div className="relative">
                  <select
                    value={filters.eventType}
                    onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full items-center text-center justify-center pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iY2hldnJvbi1kb3duIHctNCBoLTQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNjQ2IDQuNjQ2YS41LjUgMCAwIDEgLjcwOCAwbDYgNmEuNS41IDAgMCAxLS43MDguNzA4TDEyIDUuNzA3IDYuMzU0IDExLjM1NGEuNS41IDAgMCAxLS43MDgtLjcwOGw2LTZ6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] bg-no-repeat bg-right-2 bg-contain"
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="KATA">Kata</option>
                    <option value="KUMITE">Kumite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, participationType: 'ALL' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.participationType === 'ALL'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, participationType: 'INDIVIDUAL' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.participationType === 'INDIVIDUAL'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, participationType: 'TEAM' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.participationType === 'TEAM'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Team
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, gender: 'ALL' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.gender === 'ALL'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, gender: 'M' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.gender === 'M'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, gender: 'F' }))}
                    className={`flex items-center justify-center py-2 text-sm rounded-lg border transition-colors ${filters.gender === 'F'
                      ? 'bg-pink-50 border-pink-200 text-pink-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Events ({filteredEvents.length})</h4>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-1">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`group p-3 rounded-lg cursor-pointer transition-all border ${selectedEvent?.id === event.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:border-blue-100'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {event.category.replace(/_/g, ' ')}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>{event.age_category.replace(/_/g, ' ')}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`font-medium ${event.gender === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>
                            {event.gender === 'M' ? 'Male' : 'Female'}
                          </span>
                        </div>
                      </div>
                      {selectedEvent?.id === event.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    {event.weight_category && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
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

        {/* Main Content */}
        <div className="flex-1">
          {selectedEvent ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {selectedEvent.category.replace(/_/g, ' ')}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {selectedEvent.age_category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className={`text-xs ${selectedEvent.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
                        }`}>
                        {selectedEvent.gender === 'M' ? 'Male' : 'Female'}
                      </span>
                      {selectedEvent.weight_category && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {selectedEvent.weight_category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={exportParticipantsPDF}
                      className="p-1.5 hover:bg-gray-50 rounded-lg"
                      title="Export PDF"
                      disabled={!participants.length}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={handleGenerateBrackets}
                      className="p-1.5 hover:bg-gray-50 rounded-lg"
                      title="Generate Brackets"
                      disabled={!participants.length}
                    >
                      <EyeIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">No participants registered yet</p>
                  <button
                    onClick={() => navigate(`/tournament/${id}/participants/add`)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add Participant
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Name', 'Age', 'Weight', 'Belt'].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participants.map(participant => (
                        <tr
                          key={participant.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-2.5">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.full_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {participant.club}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {participant.age}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {participant.weight ? `${participant.weight}kg` : '-'}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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
            <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-gray-400">
                <span className="text-sm">Select an event to view participants</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventParticipants;