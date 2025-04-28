// import { useState, useEffect } from 'react'
// import { useParams } from 'react-router-dom'
// import axios from 'axios'
// import html2canvas from 'html2canvas'
// import { jsPDF } from 'jspdf'

// const BracketMaking = () => {
//   const { id } = useParams()
//   const [tournament, setTournament] = useState(null)
//   const [events, setEvents] = useState([])
//   const [selectedEvent, setSelectedEvent] = useState(null)
//   const [matches, setMatches] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const fetchEventData = async () => {
//       try {
//         const [tournamentRes, eventsRes] = await Promise.all([
//           axios.get(`/api/tournaments/${id}/`),
//           axios.get(`/api/events/?tournament=${id}`)
//         ])
//         setTournament(tournamentRes.data)
//         setEvents(eventsRes.data)
//         setError(null)
//       } catch (err) {
//         setError('Failed to fetch tournament data')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchEventData()
//   }, [id])

//   useEffect(() => {
//     const fetchMatches = async () => {
//       if (!selectedEvent) return
//       try {
//         const response = await axios.get(`/api/matches/?event=${selectedEvent.id}`)
//         setMatches(response.data)
//       } catch (err) {
//         setError('Failed to fetch matches')
//       }
//     }

//     fetchMatches()
//   }, [selectedEvent])

//   const generateBrackets = async () => {
//     if (!selectedEvent) return
//     try {
//       const response = await axios.post(`/api/events/${selectedEvent.id}/generate_brackets/`)
//       setMatches(response.data)
//     } catch (err) {
//       setError('Failed to generate brackets')
//     }
//   }

//   const updateMatchResult = async (matchId, winnerId) => {
//     try {
//       await axios.patch(`/api/matches/${matchId}/`, {
//         winner: winnerId,
//         status: 'COMPLETED'
//       })
//       // Refresh matches after update
//       const response = await axios.get(`/api/matches/?event=${selectedEvent.id}`)
//       setMatches(response.data)
//     } catch (err) {
//       setError('Failed to update match result')
//     }
//   }

//   const exportBracketsPDF = async () => {
//     try {
//       const element = document.getElementById('brackets-container')
//       const canvas = await html2canvas(element)
//       const imgData = canvas.toDataURL('image/png')

//       const pdf = new jsPDF({
//         orientation: 'landscape',
//         unit: 'px',
//         format: [canvas.width, canvas.height]
//       })

//       pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
//       pdf.save(`${tournament.name}-${selectedEvent.category}-brackets.pdf`)
//     } catch (err) {
//       setError('Failed to export brackets')
//     }
//   }

//   const renderBracketConnectors = (round, matches) => {
//     if (round === Math.max(...matches.map(m => m.round_number))) return null;

//     return (
//       <div className="flex flex-col justify-around h-full ml-2">
//         {matches.map((match, index) => (
//           <div key={`connector-${match.id}`} className="flex items-center h-32">
//             <div className="w-8 h-px bg-gray-300"></div>
//             {index % 2 === 0 && (
//               <div className="w-px h-32 -mt-16 bg-gray-300"></div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderBracketColumn = (round, matches) => (
//     <div key={round} className="flex">
//       <div className="flex flex-col space-y-8">
//         <div className="h-8 flex items-center">
//           <span className="text-sm font-medium text-gray-700">
//             Round {round}
//           </span>
//         </div>
//         {matches.map(match => renderBracketMatch(match))}
//       </div>
//       {renderBracketConnectors(round, matches)}
//     </div>
//   );

//   const renderBracketMatch = (match) => {
//     const handleSelectWinner = (winnerId) => {
//       if (match.status === 'COMPLETED' || !winnerId) return;
//       updateMatchResult(match.id, winnerId);
//     };

//     return (
//       <div
//         key={match.id}
//         className={`bg-white shadow-sm rounded-lg p-4 w-64 transition-all duration-200 ${match.status === 'COMPLETED' ? 'ring-2 ring-green-100' : ''
//           }`}
//       >
//         <div className="text-xs font-medium text-gray-500 mb-2">
//           Match {match.match_number}
//         </div>

//         {/* Competitor 1 */}
//         <div
//           onClick={() => handleSelectWinner(match.competitor1?.id)}
//           className={`p-3 rounded cursor-pointer transition-colors ${!match.competitor1 ? 'bg-gray-50 cursor-not-allowed' :
//               match.winner?.id === match.competitor1?.id
//                 ? 'bg-green-50 hover:bg-green-100'
//                 : match.status === 'COMPLETED'
//                   ? 'bg-red-50'
//                   : 'hover:bg-gray-50'
//             }`}
//         >
//           {match.competitor1 ? (
//             <>
//               <div className="font-medium text-sm">
//                 {match.competitor1.is_team_event ? match.competitor1.team_name : match.competitor1.full_name}
//               </div>
//               <div className="text-xs text-gray-500 mt-1">
//                 {match.competitor1.club} • {match.competitor1.belt_rank}
//               </div>
//             </>
//           ) : (
//             <div className="text-sm text-gray-400">TBD</div>
//           )}
//         </div>

//         {/* VS Divider */}
//         <div className="flex items-center my-2">
//           <div className="flex-grow border-t border-gray-100"></div>
//           <span className="px-2 text-xs text-gray-400">VS</span>
//           <div className="flex-grow border-t border-gray-100"></div>
//         </div>

//         {/* Competitor 2 */}
//         <div
//           onClick={() => handleSelectWinner(match.competitor2?.id)}
//           className={`p-3 rounded cursor-pointer transition-colors ${!match.competitor2 ? 'bg-gray-50 cursor-not-allowed' :
//               match.winner?.id === match.competitor2?.id
//                 ? 'bg-green-50 hover:bg-green-100'
//                 : match.status === 'COMPLETED'
//                   ? 'bg-red-50'
//                   : 'hover:bg-gray-50'
//             }`}
//         >
//           {match.competitor2 ? (
//             <>
//               <div className="font-medium text-sm">
//                 {match.competitor2.is_team_event ? match.competitor2.team_name : match.competitor2.full_name}
//               </div>
//               <div className="text-xs text-gray-500 mt-1">
//                 {match.competitor2.club} • {match.competitor2.belt_rank}
//               </div>
//             </>
//           ) : (
//             <div className="text-sm text-gray-400">TBD</div>
//           )}
//         </div>

//         {match.status === 'COMPLETED' && (
//           <div className="mt-3 pt-2 border-t border-gray-100">
//             <div className="text-xs text-gray-600">
//               Winner: <span className="font-medium">
//                 {match.winner.is_team_event ? match.winner.team_name : match.winner.full_name}
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karate-blue"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="md:flex md:items-center md:justify-between mb-8">
//         <div className="flex-1 min-w-0">
//           <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
//             Tournament Brackets
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             {tournament?.name}
//           </p>
//         </div>
//       </div>

//       {error && (
//         <div className="rounded-md bg-red-50 p-4 mb-6">
//           <div className="text-sm text-red-700">{error}</div>
//         </div>
//       )}

//       {/* Event Selector */}
//       <div className="bg-white shadow rounded-lg p-6 mb-8">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Select Event</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {events.map((event) => (
//             <button
//               key={event.id}
//               onClick={() => setSelectedEvent(event)}
//               className={`p-4 rounded-lg text-left transition-colors ${selectedEvent?.id === event.id
//                   ? 'bg-karate-blue text-white shadow-md'
//                   : 'bg-gray-50 hover:bg-gray-100'
//                 }`}
//             >
//               <div className="font-medium">{event.category.replace('_', ' ')}</div>
//               <div className="text-sm mt-1 opacity-90">
//                 {event.age_category} • {event.gender === 'M' ? 'Male' : 'Female'}
//                 {event.weight_category && ` • ${event.weight_category}`}
//               </div>
//               <div className="text-xs mt-2 opacity-75">
//                 {event.participants?.length || 0} participants
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Bracket Controls */}
//       {selectedEvent && (
//         <div className="bg-white shadow rounded-lg p-6 mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">
//                 {selectedEvent.category.replace('_', ' ')} Brackets
//               </h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 {selectedEvent.participants?.length || 0} participants registered
//               </p>
//             </div>
//             <div className="flex space-x-4">
//               <button
//                 onClick={generateBrackets}
//                 className={`btn-primary ${matches.length > 0 || !selectedEvent || selectedEvent.participants.length < 2
//                     ? 'opacity-50 cursor-not-allowed'
//                     : ''
//                   }`}
//                 disabled={matches.length > 0 || !selectedEvent || selectedEvent.participants.length < 2}
//               >
//                 Generate Brackets
//               </button>
//               {matches.length > 0 && (
//                 <button
//                   onClick={exportBracketsPDF}
//                   className="btn-secondary"
//                 >
//                   Export PDF
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Brackets Display */}
//       {matches.length > 0 && (
//         <div id="brackets-container" className="bg-white shadow rounded-lg p-6 overflow-x-auto">
//           <div className="min-w-max">
//             <div className="flex space-x-16">
//               {Array.from(new Set(matches.map(m => m.round_number))).map(round => (
//                 renderBracketColumn(
//                   round,
//                   matches.filter(m => m.round_number === round)
//                 )
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BracketMaking



// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const BracketMaking = () => {
//   const { id } = useParams();
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch events when the component loads
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await axios.get(`/api/events/?tournament=${id}`);
//         setEvents(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load events');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEvents();
//   }, [id]);

//   // Fetch matches when an event is selected
//   useEffect(() => {
//     const fetchMatches = async () => {
//       if (!selectedEvent) return;
//       setLoading(true);
//       try {
//         const response = await axios.get(`/api/matches/?event=${selectedEvent.id}`);
//         setMatches(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load matches');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMatches();
//   }, [selectedEvent]);

//   // Simple bracket rendering function
//   const renderBracketColumn = (round, roundMatches) => {
//     if (!roundMatches.length) return null;
//     return (
//       <div key={round} className="flex flex-col space-y-4">
//         <h4>Round {round}</h4>
//         {roundMatches.map((match) => (
//           <div key={match.id} className="p-2 border">
//             {match.competitor1?.full_name || 'TBD'} vs {match.competitor2?.full_name || 'TBD'}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // Show loading spinner while fetching data
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-4">
//       <h2>Select an Event</h2>
//       {/* Event selection */}
//       <div className="grid grid-cols-2 gap-4">
//         {events.map((event) => (
//           <button
//             key={event.id}
//             onClick={() => setSelectedEvent(event)}
//             className="p-4 bg-gray-100 hover:bg-gray-200"
//           >
//             {event.category} ({event.gender})
//           </button>
//         ))}
//       </div>

//       {/* Error message */}
//       {error && <div className="text-red-500 mt-4">{error}</div>}

//       {/* Bracket display */}
//       {selectedEvent && (
//         <div className="mt-8">
//           <h3>Brackets for {selectedEvent.category}</h3>
//           {matches.length > 0 ? (
//             <div className="flex space-x-8">
//               {Array.from(new Set(matches.map((m) => m.round_number))).map((round) =>
//                 renderBracketColumn(round, matches.filter((m) => m.round_number === round))
//               )}
//             </div>
//           ) : (
//             <p>No brackets generated yet. Please generate brackets for this event.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BracketMaking;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const BracketMaking = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [tournamentRes, eventsRes] = await Promise.all([
          axios.get(`/api/tournaments/${id}/`),
          axios.get(`/api/events/?tournament=${id}`),
        ]);
        console.log('Events:', eventsRes.data);
        setTournament(tournamentRes.data);
        setEvents(eventsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tournament data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!selectedEvent) return;
      try {
        const response = await axios.get(`/api/matches/?event=${selectedEvent.id}`);
        console.log('Matches:', response.data);
        setMatches(response.data);
      } catch (err) {
        setError('Failed to fetch matches');
      }
    };

    fetchMatches();
  }, [selectedEvent]);

  const generateBrackets = async () => {
    if (!selectedEvent) return;
    try {
      const response = await axios.post(`/api/events/${selectedEvent.id}/generate_brackets/`);
      setMatches(response.data);
    } catch (err) {
      setError('Failed to generate brackets');
    }
  };

  const exportBracketsPDF = async () => {
    try {
      const element = document.getElementById('brackets-container');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${tournament.name}-${selectedEvent.category}-${selectedEvent.gender}-${selectedEvent.weight_category || 'no-weight'}-brackets.pdf`);
    } catch (err) {
      setError('Failed to export brackets');
    }
  };

  const renderBracketMatch = (match, isFinal = false) => {
    const competitor1Name = match.competitor1
      ? (match.competitor1.is_team_event ? match.competitor1.team_name : match.competitor1.full_name)
      : 'TBD';
    const competitor2Name = match.competitor2
      ? (match.competitor2.is_team_event ? match.competitor2.team_name : match.competitor2.full_name)
      : 'TBD';
    return (
      <div
        key={match.id}
        className={`flex items-center justify-between w-48 p-2 bg-white border border-gray-300 rounded ${isFinal ? 'w-64' : ''}`}
      >
        <div className="text-sm font-medium">{competitor1Name}</div>
        <div className="text-xs mx-2">vs</div>
        <div className="text-sm font-medium">{competitor2Name}</div>
      </div>
    );
  };

  const renderBracketColumn = (round, matches) => {
    const isFinalRound = round === Math.max(...matches.map((m) => m.round_number));
    return (
      <div key={round} className="flex flex-col items-center space-y-4">
        <div className="text-sm font-medium text-gray-700">Round {round}</div>
        {matches.map((match) => (
          <div key={match.id} className="flex flex-col items-center">
            {renderBracketMatch(match, isFinalRound)}
            {!isFinalRound && <div className="w-px h-12 bg-gray-300 mt-2"></div>}
          </div>
        ))}
        {isFinalRound && (
          <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded">Winner</div>
        )}
      </div>
    );
  };

  const renderBracketConnectors = (round, matches) => {
    if (round === Math.max(...matches.map((m) => m.round_number))) return null;
    return (
      <div className="flex flex-col items-center space-y-12 mt-2">
        {matches.map((match, index) => (
          <div key={`connector-${match.id}`} className="flex flex-col items-center">
            <div className="w-4 h-px bg-gray-300"></div>
            {index % 2 === 0 && <div className="w-px h-12 bg-gray-300"></div>}
          </div>
        ))}
      </div>
    );
  };

  const renderBracket = () => {
    if (matches.length === 0) return null;
    const rounds = Array.from(new Set(matches.map((m) => m.round_number)));
    return (
      <div className="flex space-x-8">
        {rounds.map((round) => (
          <div key={round} className="flex">
            <div className="flex flex-col items-center">
              {renderBracketColumn(round, matches.filter((m) => m.round_number === round))}
            </div>
            {renderBracketConnectors(round, matches.filter((m) => m.round_number === round))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tournament Brackets
          </h2>
          <p className="mt-1 text-sm text-gray-500">{tournament?.name}</p>
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Event</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-lg text-left transition-colors ${selectedEvent?.id === event.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <div className="font-medium">{event.category.replace('_', ' ')}</div>
              <div className="text-sm mt-1 opacity-90">
                {event.age_category} • {event.gender === 'M' ? 'Male' : 'Female'}
                {event.weight_category && ` • ${event.weight_category}`}
              </div>
              <div className="text-xs mt-2 opacity-75">
                {event.participants && Array.isArray(event.participants) ? event.participants.length : 0} participants
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedEvent && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEvent.category.replace('_', ' ')} Brackets
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedEvent.participants && Array.isArray(selectedEvent.participants) ? selectedEvent.participants.length : 0} participants registered
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generateBrackets}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${matches.length > 0 || !selectedEvent || (selectedEvent.participants && Array.isArray(selectedEvent.participants) ? selectedEvent.participants.length : 0) < 2
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                  }`}
                disabled={matches.length > 0 || !selectedEvent || (selectedEvent.participants && Array.isArray(selectedEvent.participants) ? selectedEvent.participants.length : 0) < 2}
              >
                Generate Brackets
              </button>
              {matches.length > 0 && (
                <button
                  onClick={exportBracketsPDF}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Export PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {matches.length > 0 && (
        <div id="brackets-container" className="bg-white shadow rounded-lg p-6 overflow-x-auto">
          <div className="min-w-max">
            <h3 className="text-xl font-bold mb-4">{selectedEvent.category.replace('_', ' ')} Bracket</h3>
            {renderBracket()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketMaking;