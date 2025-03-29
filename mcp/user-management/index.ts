#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define user profile type for better type safety
type UserProfile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
};

class UserManagementServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'user-management',
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
          name: 'create_user',
          description: 'Creates a new user in the system',
          inputSchema: {
            type: 'object',
            properties: {
              email: { 
                type: 'string',
                description: 'User email address'
              },
              password: { 
                type: 'string',
                description: 'User password (min 6 characters)'
              },
              username: { 
                type: 'string',
                description: 'Optional username for the user'
              },
              full_name: { 
                type: 'string',
                description: 'Optional full name for the user'
              }
            },
            required: ['email', 'password'],
          },
        },
        {
          name: 'get_user',
          description: 'Get user details by ID or email',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { 
                type: 'string',
                description: 'User ID to fetch'
              },
              email: { 
                type: 'string',
                description: 'User email to fetch'
              }
            },
            required: [],
          },
        },
        {
          name: 'update_user',
          description: 'Update user profile information',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { 
                type: 'string',
                description: 'User ID to update'
              },
              username: { 
                type: 'string',
                description: 'New username'
              },
              full_name: { 
                type: 'string',
                description: 'New full name'
              },
              avatar_url: { 
                type: 'string',
                description: 'New avatar URL'
              }
            },
            required: ['userId'],
          },
        },
        {
          name: 'delete_user',
          description: 'Delete a user from the system',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { 
                type: 'string',
                description: 'User ID to delete'
              }
            },
            required: ['userId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'create_user':
            return await this.handleCreateUser(request.params.arguments);
          case 'get_user':
            return await this.handleGetUser(request.params.arguments);
          case 'update_user':
            return await this.handleUpdateUser(request.params.arguments);
          case 'delete_user':
            return await this.handleDeleteUser(request.params.arguments);
          default:
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

  private async handleCreateUser(args: any) {
    if (!args || !args.email || !args.password) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters: email and password');
    }

    const { email, password, username, full_name } = args;

    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        throw new McpError(ErrorCode.InternalError, authError.message);
      }

      if (!authData.user) {
        throw new McpError(ErrorCode.InternalError, 'Failed to create user');
      }

      // Create user profile in profiles table (assuming you have a profiles table)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username || null,
          full_name: full_name || null,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't fail the whole operation if just the profile creation fails
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              userId: authData.user.id,
              email: authData.user.email,
            }, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async handleGetUser(args: any) {
    if (!args || (!args.userId && !args.email)) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: userId or email');
    }

    try {
      let userData;

      if (args.userId) {
        // Get user by ID
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', args.userId)
          .single();

        if (error) {
          throw new McpError(ErrorCode.InternalError, error.message);
        }

        userData = data;
      } else if (args.email) {
        // Get user by email (requires a join with auth.users or a lookup)
        const { data: authUser, error: authError } = await supabase.auth.admin
          .listUsers();

        if (authError) {
          throw new McpError(ErrorCode.InternalError, authError.message);
        }

        const user = authUser.users.find(u => u.email === args.email);
        if (!user) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'User not found' }, null, 2),
              },
            ],
          };
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw new McpError(ErrorCode.InternalError, profileError.message);
        }

        userData = {
          id: user.id,
          email: user.email,
          ...profileData,
        };
      }

      if (!userData) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'User not found' }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(userData, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async handleUpdateUser(args: any) {
    if (!args || !args.userId) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: userId');
    }

    const { userId, username, full_name, avatar_url } = args;

    try {
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new McpError(ErrorCode.InternalError, checkError.message);
      }

      if (!existingUser && checkError?.code === 'PGRST116') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'User not found' }, null, 2),
            },
          ],
        };
      }

      // Update the user profile
      const updateData: Partial<UserProfile> = {
        updated_at: new Date().toISOString(),
      };

      if (username !== undefined) updateData.username = username;
      if (full_name !== undefined) updateData.full_name = full_name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: data,
            }, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async handleDeleteUser(args: any) {
    if (!args || !args.userId) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: userId');
    }

    const { userId } = args;

    try {
      // Delete user from Supabase Auth
      const { error: authError } = await supabase.auth.admin
        .deleteUser(userId);

      if (authError) {
        throw new McpError(ErrorCode.InternalError, authError.message);
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue even if profile deletion fails
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'User deleted successfully',
            }, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('User Management MCP server running on stdio');
  }
}

// Instantiate and run if this is the main file
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new UserManagementServer();
  server.run().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default UserManagementServer;