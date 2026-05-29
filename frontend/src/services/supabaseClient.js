import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ━━━ VALIDATION & ERROR HANDLING ━━━
const validateSupabaseConfig = () => {
  if (!supabaseUrl) {
    const error = 'Missing VITE_SUPABASE_URL environment variable. Please check your .env file.';
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }

  if (!supabaseAnonKey) {
    const error = 'Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.';
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    const error = `Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Expected: https://[project-id].supabase.co`;
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }

  // Validate that URL is from Supabase
  if (!supabaseUrl.includes('.supabase.co')) {
    const error = `Invalid Supabase URL: "${supabaseUrl}". URL must be from Supabase (*.supabase.co)`;
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }

  // Validate key format (JWT token structure)
  if (!supabaseAnonKey.includes('.') || supabaseAnonKey.split('.').length !== 3) {
    const error = 'Invalid VITE_SUPABASE_ANON_KEY format. Expected a valid JWT token.';
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }

  console.log('✅ Supabase Configuration Validated');
};

// ━━━ INITIALIZE WITH VALIDATION ━━━
let supabase;
try {
  validateSupabaseConfig();
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message);
  throw error;
}

// ━━━ ERROR HANDLERS ━━━
export const isAuthError = (error) => {
  if (!error) return false;
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('invalid login credentials') ||
    message.includes('invalid email') ||
    message.includes('session expired') ||
    message.includes('unauthorized') ||
    error?.status === 401
  );
};

export const isNetworkError = (error) => {
  if (!error) return false;
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('offline') ||
    error?.status === 0
  );
};

export const isDatabaseError = (error) => {
  if (!error) return false;
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('database') ||
    message.includes('relation') ||
    message.includes('constraint') ||
    error?.status === 500
  );
};

export const getSupabaseErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  if (isAuthError(error)) {
    return 'Authentication failed. Please check your credentials and try again.';
  }

  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet and try again.';
  }

  if (isDatabaseError(error)) {
    return 'Database error occurred. Please try again later.';
  }

  // Return the original error message if it exists
  return error.message || 'An error occurred while connecting to Supabase';
};

export { supabase };
