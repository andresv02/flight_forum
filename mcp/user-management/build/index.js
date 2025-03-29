#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
class UserManagementServer {
    server;
    constructor() {
        // Initialize the server with transport
        this.server = new Server({
            name: 'user-management',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {
                    'create-user': {
                        description: 'Creates a new user in the system',
                        schema: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' },
                            },
                            required: ['email', 'password'],
                        },
                        handler: async (args) => {
                            console.log('Received create-user request:', args); // Debug log
                            const { email, password } = args;
                            const { data, error } = await supabase.auth.admin.createUser({
                                email,
                                password,
                                email_confirm: true,
                            });
                            if (error)
                                throw new McpError(ErrorCode.InternalError, error.message);
                            return { success: true, userId: data.user?.id };
                        },
                    },
                },
            },
        });
        // Connect the server and keep it running
        this.server.connect(new StdioServerTransport()).catch((err) => {
            console.error('Server failed to connect:', err);
        });
    }
}
// Keep the process alive
function keepAlive() {
    console.log('Server running. Press Ctrl+C to exit.');
    process.stdin.resume(); // Keep the event loop alive
}
// Instantiate and run if this is the main file
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new UserManagementServer();
    keepAlive();
}
export default UserManagementServer;
