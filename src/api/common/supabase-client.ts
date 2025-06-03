import { createClient, User } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
import { AppRequest } from './types';
import { environment } from '@environments/environment';
import { env } from 'process';

export function createSupabaseClient() {
  // Replace with your actual Supabase URL and Anon Key
  const supabaseUrl = environment.supabaseUrl;
  const supabaseAnonKey = environment.anonymousJwt;

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
  const supabaseUrl = environment.supabaseUrl;
  const supabaseServiceRoleKey = environment.apiAdminKey;

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

export const supabaseAdminClient = createSupabaseAdminClient();
export const supabaseClient = createSupabaseClient();

export function getUserIdentitfier(user: User | null) {
  if (!user) {
    return 'Anonymous';
  }
  return user.email || user.phone || user.id || 'Anonymous';
}
