# Flight Forum

Flight Forum is a Next.js application that allows users to search for flights, view flight details, and participate in discussions about specific flights. The application integrates with a Microservice Control Plane (MCP) server for flight tracking and user management.

## Features

- **Flight Search**: Search for flights by flight number, origin, and destination
- **Flight Details**: View detailed information about flights
- **User Authentication**: Sign in with email or OAuth providers via Supabase
- **User Profiles**: Manage your user profile and view your flight activity
- **Discussion Forums**: Participate in discussions about specific flights

## Prerequisites

- Node.js 18.x or later
- Supabase account (for user authentication and data storage)
- MCP server (optional, mock data is provided for development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/flight-forum.git
cd flight-forum
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MCP Server Configuration
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:8000
```

> **Note**: If you don't have a Supabase account or MCP server, the application will run with mock data in development mode.

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development Notes

- The application uses mock data when the MCP server is not available
- A mock Supabase client is provided when Supabase credentials are not configured

## Project Structure

```
/src
  /app                 # Next.js app router pages
    /api               # API routes
    /profile           # User profile page
    /search            # Flight search page
    page.js            # Home page
  /components          # Reusable components
    /auth              # Authentication components
  /contexts            # React contexts
  /services            # Service modules
    /mcp               # MCP client services
  /supabaseClient.js   # Supabase client configuration
```

## Deployment

### Deploy on Vercel

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

## License

MIT
