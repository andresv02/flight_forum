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
      <main className="min-h-screen p-8 max-w-4xl mx-auto pt-8 bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-8">Advanced Flight Search</h1>
        
        <div className="bg-card rounded-lg shadow p-6 mb-8 border border-border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block mb-1">
                  Origin (Airport Code)
                </label>
                <input
                  id="origin"
                  type="text"
                  placeholder="JFK"
                  className="w-full p-3 border border-input-border rounded-lg bg-input text-input-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block mb-1">
                  Destination (Airport Code)
                </label>
                <input
                  id="destination"
                  type="text"
                  placeholder="LAX"
                  className="w-full p-3 border border-input-border rounded-lg bg-input text-input-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block mb-1">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="w-full p-3 border border-input-border rounded-lg bg-input text-input-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </div>
        
        {searchResults.length > 0 && (
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            
            <div className="space-y-4">
              {console.log('Flight data:', searchResults)}
              {searchResults.map((flight) => (
                <div
                  key={`${flight.flightNumber}-${flight.date}`}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition bg-card/50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-medium">
                        {flight.airline} {flight.flightNumber}
                      </h3>
                      <p className="text-foreground/70">
                        {flight.origin} → {flight.destination}
                      </p>
                      <div className="mt-2 flex gap-4">
                        <div>
                          <p className="text-xs text-foreground/60">Departure</p>
                          <p>{flight.departureTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60">Arrival</p>
                          <p>{flight.arrivalTime}</p>
                          {flight.estimatedArrivalTime && (
                            <p className="text-xs text-foreground/60">Est: {flight.estimatedArrivalTime}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded ${
                        flight.status === 'On Time' ? 'bg-success/10 text-success' : 
                        flight.status === 'Delayed' ? 'bg-warning/10 text-warning' : 
                        'bg-error/10 text-error'
                      }`}>
                        {flight.status}
                      </span>
                      <div className="mt-2">
                        <Link
                          href={`/flights/${flight.flightNumber}?date=${flight.date || ''}`}
                          className="text-accent hover:underline"
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
          <div className="bg-info/5 p-6 rounded-lg text-center border border-info/10">
            <p className="text-info">
              Enter origin and destination to search for flights
            </p>
          </div>
        )}
      </main>
    </>
  );
}
