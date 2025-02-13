// Mock flight data with nested comments
export const flights = [
  {
    id: 'AA123',
    date: '2025-01-30',
    airline: 'American Airlines',
    origin: { code: 'JFK', city: 'New York', time: '09:00' },
    destination: { code: 'LAX', city: 'Los Angeles', time: '12:00' },
    comments: [
      {
        id: 1,
        user: 'Traveler123',
        text: 'Any delays expected today?',
        timestamp: '2025-01-29T14:30:00Z',
        replies: [
          {
            id: 2,
            user: 'FlightWatcher',
            text: 'All looks on time so far!',
            timestamp: '2025-01-29T15:00:00Z',
            parentId: 1
          }
        ]
      }
    ]
  }
];