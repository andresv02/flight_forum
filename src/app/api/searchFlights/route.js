import { NextResponse } from 'next/server';
import { flightTrackerService } from '../../../services/mcp/mcpClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  try {
    // Use the MCP client service to search flights
    const flightsData = await flightTrackerService.searchFlights(origin, destination, date);
    
    return NextResponse.json(flightsData);
  } catch (error) {
    console.error('Error searching flights:', error);
    return NextResponse.json({ error: 'Failed to search flights' }, { status: 500 });
  }
}
