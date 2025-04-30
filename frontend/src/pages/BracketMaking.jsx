import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { PlusCircleIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const EventParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Fetch participants registered for this event
        const response = await axios.get(`/api/participants/?tournament=${id}&event=${selectedEvent.id}`);
        setParticipants(response.data);
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

  const handleGenerateBrackets = async () => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    try {
      setLoading(true);
      // Simple bracket generation - this would need to be implemented on the backend
      await axios.post(`/api/events/${selectedEvent.id}/generate_brackets/`, {
        tournament_id: id
      });

      setError(null);
      alert('Brackets generated successfully');
    } catch (err) {
      console.error('Failed to generate brackets:', err);
      setError('Failed to generate brackets: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const exportParticipantsPDF = () => {
    if (!participants.length) return;

    const doc = new jsPDF();

    // Format event details
    const formattedCategory = selectedEvent.category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    const formattedAge = selectedEvent.age_category
      .replace(/_/g, ' ')
      .toUpperCase();

    const gender = selectedEvent.gender === 'M' ? 'Male' : 'Female';
    let weightInfo = '';

    if (selectedEvent.weight_category) {
      weightInfo = ' - ' + selectedEvent.weight_category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Title with formatted event details
    doc.setFontSize(18);
    doc.text(`${formattedCategory}: ${formattedAge} - ${gender}${weightInfo}`, 14, 22);

    // Tournament info
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tournament: ${tournament?.name}`, 14, 28);

    // AutoTable configuration
    autoTable(doc, {
      head: [['Name', 'Age', 'Gender', 'Weight', 'Belt Rank', 'Club']],
      body: participants.map(p => [
        p.full_name,
        p.age,
        p.gender === 'M' ? 'Male' : 'Female',
        p.weight ? `${p.weight} kg` : 'N/A',
        p.belt_rank,
        p.club || 'N/A'
      ]),
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`${selectedEvent.category}_participants.pdf`);
  };


  if (loading && !events.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }




  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Event Participants
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {tournament?.name}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Event Selector */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Event</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-lg text-left transition-colors ${selectedEvent?.id === event.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <div className="font-medium">
                {event.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className={`text-sm ${selectedEvent?.id === event.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {event.age_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {event.gender === 'M' ? 'Male' : 'Female'}
                {event.weight_category && ` - ${event.weight_category}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      {selectedEvent && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEvent.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Participants
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedEvent.age_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} •
                {selectedEvent.gender === 'M' ? ' Male' : ' Female'}
                {selectedEvent.weight_category && ` • ${selectedEvent.weight_category}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/tournament/${id}/participants/add`)}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Add Participant
              </button>
              <button
                onClick={exportParticipantsPDF}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                disabled={!participants.length}
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                Export PDF
              </button>
              <button
                onClick={handleGenerateBrackets}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                disabled={!participants.length}
              >
                <EyeIcon className="h-5 w-5 mr-1" />
                Generate Brackets
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No participants in this event yet.</p>
              <button
                onClick={() => navigate(`/tournament/${id}/participants/add`)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Participant
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Belt Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{participant.full_name}</div>
                        {participant.is_team_event && (
                          <div className="text-sm text-gray-500">{participant.team_name || 'Unnamed Team'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.gender === 'M' ? 'Male' : 'Female'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.weight ? `${participant.weight} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {participant.belt_rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.club || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventParticipants;