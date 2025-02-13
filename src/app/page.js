import Link from 'next/link';
import { flights } from '../data/flights';

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-800">
        Flight Forum
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="flightNumber" className="text-gray-700">Flight Number (IATA Code)</label>
          <input
            type="text"
            id="flightNumber"
            placeholder="AA123"
            className="flex-1 p-3 border rounded-lg text-black"
          />
          <label htmlFor="departureDate" className="text-gray-700">Departure Date</label>
          <input
            type="date"
            id="departureDate"
            className="p-3 border rounded-lg text-gray-700"
            min={new Date(Date.now() - 172800000).toISOString().split('T')[0]}
            max={new Date(Date.now() + 172800000).toISOString().split('T')[0]}
            //1728000 is two days in Miliseconds
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition ">
          Search Flight
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">Recent Flights</h2>
        {flights.map((flight) => (
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
  );
}
