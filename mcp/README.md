# Flight Forum MCP Server

This directory contains the Model Context Protocol (MCP) servers used by the Flight Forum application.

## Overview

The MCP server provides backend services for the Flight Forum application, including:

- **Flight Tracking**: Retrieves and manages flight information
- **User Management**: Handles user authentication and profile data

## Structure

- `flight-tracker/`: Flight information and search services
- `user-management/`: User authentication and profile management

## Integration

The MCP server integrates with the Flight Forum application through the client located at:
`/src/services/mcp/mcpClient.js`

## Development

To start the servers in development mode:

```bash
# For flight tracker
cd flight-tracker
npm install
npm run dev

# For user management
cd ../user-management
npm install
npm run dev
```

The client is configured to connect to these services at `http://localhost:8000` by default.
