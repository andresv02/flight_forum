#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
class FlightTrackerServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'flight-tracker',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
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
                                description: 'Flight number',
                            },
                        },
                        required: ['flightNumber'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'get_flight_details') {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            if (!request.params.arguments || !request.params.arguments.flightNumber) {
                throw new McpError(ErrorCode.InvalidParams, 'Missing flightNumber argument');
            }
            const flightNumber = request.params.arguments.flightNumber;
            // Placeholder implementation - replace with actual API call
            const flightDetails = {
                flightNumber: flightNumber,
                departureTime: '10:00 AM',
                arrivalTime: '12:00 PM',
                origin: 'San Francisco',
                destination: 'New York',
                status: 'On Time',
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(flightDetails, null, 2),
                    },
                ],
            };
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Flight Tracker MCP server running on stdio');
    }
}
const server = new FlightTrackerServer();
server.run().catch(console.error);
