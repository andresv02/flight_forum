'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { flights } from '../data/flights';
import Header from '../components/Header';
import { flightTrackerService } from '../services/mcp/mcpClient';

export default function Home() {
  const [flightDetails, setFlightDetails] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentFlights, setRecentFlights] = useState([]);
  
  // Load recent flights on component mount
  useEffect(() => {
    // For now, use the static flights data
    // In the future, this could be replaced with a call to the MCP service
    setRecentFlights(flights);
  }, []);

  const searchFlight = async () => {
    if (!flightNumber.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the MCP client service to get flight details
      const data = await flightTrackerService.getFlightDetails(flightNumber);
      setFlightDetails(data);
    } catch (err) {
      console.error('Error searching flight:', err);
      setError('Failed to find flight details. Please try again.');
      setFlightDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen p-8 max-w-4xl mx-auto pt-8">

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Search for a Flight</h2>
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="flightNumber" className="text-gray-700">Flight Number (IATA Code)</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="flightNumber"
              placeholder="AA123"
              className="flex-1 p-3 border rounded-lg text-black"
              minLength="3"
              maxLength="6"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFlight()}
            />
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={searchFlight}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {flightDetails && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Flight Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Flight Number</p>
              <p className="font-medium">{flightDetails.flightNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">
                <span className={`inline-block px-2 py-1 rounded ${flightDetails.status === 'On Time' ? 'bg-green-100 text-green-800' : flightDetails.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {flightDetails.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500">Origin</p>
              <p className="font-medium">{flightDetails.origin}</p>
            </div>
            <div>
              <p className="text-gray-500">Destination</p>
              <p className="font-medium">{flightDetails.destination}</p>
            </div>
            <div>
              <p className="text-gray-500">Departure Time</p>
              <p className="font-medium">{flightDetails.departureTime}</p>
            </div>
            <div>
              <p className="text-gray-500">Arrival Time</p>
              <p className="font-medium">{flightDetails.arrivalTime}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              href={`/flights/${flightDetails.flightNumber}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block"
            >
              View Discussion
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Flights</h2>
        {recentFlights.map((flight) => (
          <Link
            key={flight.id}
            href={`/flights/${flight.id}?date=${flight.date}`}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium text-gray-800">
                  {flight.airline} {flight.id}
                </h3>
                <p className="text-gray-600">
                  {flight.origin.code} → {flight.destination.code}
                </p>
              </div>
              <span className="text-blue-600">{flight.date}</span>
            </div>
          </Link>
        ))}
      </div>
      </main>
    </>
  );
}
