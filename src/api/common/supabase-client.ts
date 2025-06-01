import { createClient } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
import { AppRequest } from './types';

export function createSupabaseClient() {
  // Replace with your actual Supabase URL and Anon Key
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAuthClient(
  req: Request,
  response: Response,
  next: NextFunction
) {
  // Replace with your actual Supabase URL and Anon Key
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.header('Authorization') ?? '',
      },
    },
  });

  (req as AppRequest)['supabase'] = supabase;

  next();
}

export function createSupabaseAdminClient() {
  // Replace with your actual Supabase URL and Service Role Key
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL and Service Role Key must be provided');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
