/**
 * MCP Client Service
 * Handles communication with MCP servers for flight tracking and user management
 */

// Base URL for MCP server
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000';

// Mock flight data for development when MCP server is not available
const MOCK_FLIGHTS = {
  'AA123': {
    flightNumber: 'AA123',
    airline: 'American Airlines',
    departureTime: '08:00 AM',
    arrivalTime: '11:30 AM',
    origin: 'JFK',
    destination: 'LAX',
    status: 'On Time',
    date: '2025-03-10'
  },
  'DL456': {
    flightNumber: 'DL456',
    airline: 'Delta Airlines',
    departureTime: '09:15 AM',
    arrivalTime: '12:45 PM',
    origin: 'ATL',
    destination: 'SFO',
    status: 'Delayed',
    date: '2025-03-10'
  },
  'UA789': {
    flightNumber: 'UA789',
    airline: 'United Airlines',
    departureTime: '10:30 AM',
    arrivalTime: '01:15 PM',
    origin: 'ORD',
    destination: 'MIA',
    status: 'On Time',
    date: '2025-03-10'
  }
};

// Flag to determine if we should use mock data
const USE_MOCK_DATA = typeof window !== 'undefined' && window.location.hostname === 'localhost';

/**
 * Call an MCP tool with the given parameters
 * @param {string} serverName - Name of the MCP server (e.g., 'flight-tracker', 'user-management')
 * @param {string} toolName - Name of the tool to call
 * @param {object} args - Arguments to pass to the tool
 * @returns {Promise<any>} - Response from the MCP server
 */
export async function callMcpTool(serverName, toolName, args) {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/call_tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server_name: serverName,
        tool_name: toolName,
        arguments: args,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling MCP tool ${serverName}/${toolName}:`, error);
    
    // If we're in development mode and using mock data, return mock response
    if (USE_MOCK_DATA) {
      console.warn(`⚠️ Using mock data for ${serverName}/${toolName}. Start the MCP server for real data.`);
      return getMockResponse(serverName, toolName, args);
    }
    
    throw error;
  }
}

/**
 * Generate a mock response for MCP tool calls when the server is not available
 * @param {string} serverName - Name of the MCP server
 * @param {string} toolName - Name of the tool
 * @param {object} args - Arguments passed to the tool
 * @returns {object} - Mock response
 */
function getMockResponse(serverName, toolName, args) {
  let responseData;
  
  if (serverName === 'flight-tracker') {
    if (toolName === 'get_flight_details') {
      const flightNumber = args.flightNumber;
      responseData = MOCK_FLIGHTS[flightNumber] || {
        flightNumber,
        airline: 'Mock Airline',
        departureTime: '10:00 AM',
        arrivalTime: '12:00 PM',
        origin: 'MCK',
        destination: 'TST',
        status: 'On Time',
        date: args.date || '2025-03-10'
      };
    } else if (toolName === 'search_flights') {
      const { origin, destination } = args;
      responseData = Object.values(MOCK_FLIGHTS).filter(flight => 
        (!origin || flight.origin === origin) && 
        (!destination || flight.destination === destination)
      );
      
      if (responseData.length === 0) {
        responseData = [{
          flightNumber: 'MOCK123',
          airline: 'Mock Airlines',
          departureTime: '08:30 AM',
          arrivalTime: '10:45 AM',
          origin: origin || 'MCK',
          destination: destination || 'TST',
          status: 'On Time',
          date: args.date || '2025-03-10'
        }];
      }
    }
  } else if (serverName === 'user-management') {
    if (toolName === 'create_user' || toolName === 'get_user' || toolName === 'update_user') {
      responseData = {
        id: 'mock-user-id',
        email: args.email || 'mock@example.com',
        username: args.username || 'mockuser',
        full_name: args.full_name || 'Mock User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else if (toolName === 'delete_user') {
      responseData = { success: true };
    }
  }
  
  // Return in the format expected by the client
  return {
    content: [{
      text: JSON.stringify(responseData)
    }]
  };
}

/**
 * Flight Tracker MCP Service
 */
export const flightTrackerService = {
  /**
   * Get flight details by flight number
   * @param {string} flightNumber - Flight number (e.g., AA123)
   * @param {string} date - Optional flight date in YYYY-MM-DD format
   * @returns {Promise<object>} - Flight details
   */
  getFlightDetails: async (flightNumber, date) => {
    try {
      const args = { flightNumber };
      if (date) args.date = date;
      
      const response = await callMcpTool('flight-tracker', 'get_flight_details', args);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error getting flight details:', error);
      
      // Fallback to mock data if an error occurs
      if (USE_MOCK_DATA) {
        return MOCK_FLIGHTS[flightNumber] || {
          flightNumber,
          airline: 'Mock Airline',
          departureTime: '10:00 AM',
          arrivalTime: '12:00 PM',
          origin: 'MCK',
          destination: 'TST',
          status: 'On Time',
          date: date || '2025-03-10'
        };
      }
      
      throw error;
    }
  },

  /**
   * Search flights by origin and destination
   * @param {string} origin - Origin airport code (e.g., JFK)
   * @param {string} destination - Destination airport code (e.g., LAX)
   * @param {string} date - Optional flight date in YYYY-MM-DD format
   * @returns {Promise<Array>} - List of matching flights
   */
  searchFlights: async (origin, destination, date) => {
    try {
      const args = { origin, destination };
      if (date) args.date = date;
      
      const response = await callMcpTool('flight-tracker', 'search_flights', args);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error searching flights:', error);
      
      // Fallback to mock data if an error occurs
      if (USE_MOCK_DATA) {
        const mockResults = Object.values(MOCK_FLIGHTS).filter(flight => 
          (!origin || flight.origin === origin) && 
          (!destination || flight.destination === destination)
        );
        
        if (mockResults.length === 0) {
          return [{
            flightNumber: 'MOCK123',
            airline: 'Mock Airlines',
            departureTime: '08:30 AM',
            arrivalTime: '10:45 AM',
            origin: origin || 'MCK',
            destination: destination || 'TST',
            status: 'On Time',
            date: date || '2025-03-10'
          }];
        }
        
        return mockResults;
      }
      
      throw error;
    }
  }
};

/**
 * User Management MCP Service
 */
export const userManagementService = {
  /**
   * Create a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Optional username
   * @param {string} fullName - Optional full name
   * @returns {Promise<object>} - Created user details
   */
  createUser: async (email, password, username, fullName) => {
    const args = { 
      email, 
      password,
      username,
      full_name: fullName
    };
    
    const response = await callMcpTool('user-management', 'create_user', args);
    return JSON.parse(response.content[0].text);
  },

  /**
   * Get user details by ID or email
   * @param {object} params - Parameters object
   * @param {string} params.userId - Optional user ID
   * @param {string} params.email - Optional user email
   * @returns {Promise<object>} - User details
   */
  getUser: async ({ userId, email }) => {
    const args = {};
    if (userId) args.userId = userId;
    if (email) args.email = email;
    
    const response = await callMcpTool('user-management', 'get_user', args);
    return JSON.parse(response.content[0].text);
  },

  /**
   * Update user profile
   * @param {string} userId - User ID to update
   * @param {object} profileData - Profile data to update
   * @param {string} profileData.username - Optional new username
   * @param {string} profileData.fullName - Optional new full name
   * @param {string} profileData.avatarUrl - Optional new avatar URL
   * @returns {Promise<object>} - Updated user details
   */
  updateUser: async (userId, { username, fullName, avatarUrl }) => {
    const args = { userId };
    if (username !== undefined) args.username = username;
    if (fullName !== undefined) args.full_name = fullName;
    if (avatarUrl !== undefined) args.avatar_url = avatarUrl;
    
    const response = await callMcpTool('user-management', 'update_user', args);
    return JSON.parse(response.content[0].text);
  },

  /**
   * Delete a user
   * @param {string} userId - User ID to delete
   * @returns {Promise<object>} - Deletion result
   */
  deleteUser: async (userId) => {
    const args = { userId };
    
    const response = await callMcpTool('user-management', 'delete_user', args);
    return JSON.parse(response.content[0].text);
  }
};
