import { NextResponse } from 'next/server';
import { flightTrackerService } from '../../../services/mcp/mcpClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');
  const date = searchParams.get('date');

  if (!flightNumber) {
    return NextResponse.json({ error: 'Flight number is required' }, { status: 400 });
  }

  try {
    // Use the MCP client service to get flight details
    const flightData = await flightTrackerService.getFlightDetails(flightNumber, date);
    
    return NextResponse.json(flightData);
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return NextResponse.json({ error: 'Failed to fetch flight details' }, { status: 500 });
  }
}