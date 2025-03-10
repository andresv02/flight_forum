import Link from 'next/link';
import { flights } from '../../../data/flights';
import Comment from '../../../components/Comment';
import CommentForm from '../../../components/CommentForm';

export default async function FlightPage({ params }) {
  const flight = flights.find(f =>
    f.id === params.flightId
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-600 hover:underline mb-8 block">
        ← Back to search
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {flight.airline} {flight.id}
            </h1>
            <div className="mt-2 text-gray-600 grid grid-cols-2 gap-2">
              <div>
                <p>{flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})</p>
                <p className="mt-1">Departure: {flight.origin.time} | Date: {flight.date}</p>
              </div>
              <div>
                <p>Flight Status: Scheduled</p>
                <p>Actual Departure Date: 2025-02-15 10:00</p>
                <p>Scheduled Departure Date: 2025-02-15 10:00</p>
                <p>Departure Terminal: 2</p>
                <p>Delay: 0 minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-500">Flight Discussion</h2>
          <CommentForm flightId={flight.id} />

          <div className="space-y-4 mt-6">
            {flight.comments.map(comment => (
              <Comment key={comment.id} comment={comment} depth={0} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}