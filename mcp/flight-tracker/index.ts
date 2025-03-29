#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Mock flight database - in a real implementation, this would be replaced with an actual API call
const flightDatabase = {
  'AA123': {
    flightNumber: 'AA123',
    airline: 'American Airlines',
    departureTime: '10:00 AM',
    arrivalTime: '01:30 PM',
    departureDate: '2025-03-10',
    origin: 'JFK',
    originCity: 'New York',
    destination: 'LAX',
    destinationCity: 'Los Angeles',
    status: 'On Time',
    terminal: 'T4',
    gate: 'G12',
  },
  'DL456': {
    flightNumber: 'DL456',
    airline: 'Delta Airlines',
    departureTime: '11:45 AM',
    arrivalTime: '02:15 PM',
    departureDate: '2025-03-10',
    origin: 'SFO',
    originCity: 'San Francisco',
    destination: 'ATL',
    destinationCity: 'Atlanta',
    status: 'Delayed',
    terminal: 'T2',
    gate: 'G5',
    delayMinutes: 30,
  },
  'UA789': {
    flightNumber: 'UA789',
    airline: 'United Airlines',
    departureTime: '08:30 AM',
    arrivalTime: '11:45 AM',
    departureDate: '2025-03-10',
    origin: 'ORD',
    originCity: 'Chicago',
    destination: 'DEN',
    destinationCity: 'Denver',
    status: 'On Time',
    terminal: 'T1',
    gate: 'G22',
  }
};

class FlightTrackerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'flight-tracker',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_flight_details',
          description: 'Get flight details for a given flight number',
          inputSchema: {
            type: 'object',
            properties: {
              flightNumber: {
                type: 'string',
                description: 'Flight number (e.g., AA123)',
              },
              date: {
                type: 'string',
                description: 'Flight date in YYYY-MM-DD format (optional)',
              }
            },
            required: ['flightNumber'],
          },
        },
        {
          name: 'search_flights',
          description: 'Search for flights by origin and destination',
          inputSchema: {
            type: 'object',
            properties: {
              origin: {
                type: 'string',
                description: 'Origin airport code (e.g., JFK)',
              },
              destination: {
                type: 'string',
                description: 'Destination airport code (e.g., LAX)',
              },
              date: {
                type: 'string',
                description: 'Flight date in YYYY-MM-DD format (optional)',
              }
            },
            required: ['origin', 'destination'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (request.params.name === 'get_flight_details') {
          return this.handleGetFlightDetails(request);
        } else if (request.params.name === 'search_flights') {
          return this.handleSearchFlights(request);
        } else {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }
      } catch (error: unknown) {
        console.error('Error handling request:', error);
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private handleGetFlightDetails(request: any) {
    if (!request.params.arguments || !request.params.arguments.flightNumber) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing flightNumber argument');
    }

    const flightNumber = request.params.arguments.flightNumber;
    const flightDetails = flightDatabase[flightNumber as keyof typeof flightDatabase];

    if (!flightDetails) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Flight not found' }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(flightDetails, null, 2),
        },
      ],
    };
  }

  private handleSearchFlights(request: any) {
    if (!request.params.arguments || 
        !request.params.arguments.origin || 
        !request.params.arguments.destination) {
      throw new McpError(
        ErrorCode.InvalidParams, 
        'Missing required arguments: origin and destination'
      );
    }

    const origin = request.params.arguments.origin.toUpperCase();
    const destination = request.params.arguments.destination.toUpperCase();
    
    // Search for matching flights in our database
    const matchingFlights = Object.values(flightDatabase).filter((flight: any) => 
      flight.origin === origin && flight.destination === destination
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(matchingFlights, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Flight Tracker MCP server running on stdio');
  }
}

const server = new FlightTrackerServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});