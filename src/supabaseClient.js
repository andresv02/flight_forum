import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create a mock client if environment variables are not set
const isMockClient = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create the Supabase client
let supabaseClient

try {
  supabaseClient = createClient(supabaseUrl, supabaseKey)
  
  // Add a warning if using mock client
  if (isMockClient && typeof window !== 'undefined') {
    console.warn('⚠️ Using mock Supabase client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for full functionality.')
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error)
  
  // Create a mock client with empty methods
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Mock client') }),
      signInWithOAuth: async () => ({ data: null, error: new Error('Mock client') }),
      signUp: async () => ({ data: null, error: new Error('Mock client') }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null })
        }),
        order: () => ({
          limit: () => ({ data: [] })
        })
      }),
      insert: () => ({ error: null }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        })
      })
    })
  }
}

export const supabase = supabaseClient