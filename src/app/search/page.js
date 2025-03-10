'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function SearchPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!origin.trim() || !destination.trim()) {
      setError('Origin and destination are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        origin,
        destination,
      });
      
      if (date) {
        queryParams.append('date', date);
      }
      
      const response = await fetch(`/api/searchFlights?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching flights:', err);
      setError('Failed to search flights. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen p-8 max-w-4xl mx-auto pt-8">
        <h1 className="text-3xl font-bold mb-8">Advanced Flight Search</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block text-gray-700 mb-1">
                  Origin (Airport Code)
                </label>
                <input
                  id="origin"
                  type="text"
                  placeholder="JFK"
                  className="w-full p-3 border rounded-lg text-black"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block text-gray-700 mb-1">
                  Destination (Airport Code)
                </label>
                <input
                  id="destination"
                  type="text"
                  placeholder="LAX"
                  className="w-full p-3 border rounded-lg text-black"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-gray-700 mb-1">
                  Date (Optional)
                </label>
                <input
                  id="date"
                  type="date"
                  className="w-full p-3 border rounded-lg text-black"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </div>
        
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Search Results</h2>
            
            <div className="space-y-4">
              {searchResults.map((flight) => (
                <div
                  key={`${flight.flightNumber}-${flight.date}`}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-medium text-gray-800">
                        {flight.airline} {flight.flightNumber}
                      </h3>
                      <p className="text-gray-600">
                        {flight.origin} → {flight.destination}
                      </p>
                      <div className="mt-2 flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Departure</p>
                          <p>{flight.departureTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Arrival</p>
                          <p>{flight.arrivalTime}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded ${
                        flight.status === 'On Time' ? 'bg-green-100 text-green-800' : 
                        flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {flight.status}
                      </span>
                      <div className="mt-2">
                        <Link
                          href={`/flights/${flight.flightNumber}?date=${flight.date || ''}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Discussion
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {searchResults.length === 0 && !loading && !error && (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-blue-800">
              Enter origin and destination to search for flights
            </p>
          </div>
        )}
      </main>
    </>
  );
}
