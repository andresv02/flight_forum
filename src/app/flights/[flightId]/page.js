import Link from 'next/link';
import { flights } from '../../../data/flights';
import Comment from '../../../components/Comment';
import CommentForm from '../../../components/CommentForm';

export default async function FlightPage({ params }) {
  const flight = flights.find(f =>
    f.id === params.flightId
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto bg-background text-foreground">
      <Link href="/" className="text-accent hover:underline mb-8 block">
        ← Back to search
      </Link>

      <div className="bg-card rounded-lg shadow p-6 mb-8 border border-border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {flight.airline} {flight.id}
            </h1>
            <div className="mt-2 text-foreground/70 grid grid-cols-2 gap-2">
              <div>
                <p>{flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})</p>
                <p className="mt-1">Departure: {flight.origin.time} | Date: {flight.date}</p>
                <p className="mt-1">Flight Status: {flight.status}</p>
                {flight.delay > 0 && (
                  <p className="mt-1">Delay: {flight.delay} minutes</p>
                )}
              </div>
              <div>
                <p>Actual Departure: {flight.actualDeparture}</p>
                <p>Scheduled Departure: {flight.scheduledDeparture}</p>
                <p>Departure Terminal: {flight.origin.terminal}</p>
                <p>Arrival Terminal: {flight.destination.terminal}</p>
                {flight.destination.estimatedTime && (
                  <p>Estimated Arrival: {flight.destination.estimatedTime}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground/60">Flight Discussion</h2>
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