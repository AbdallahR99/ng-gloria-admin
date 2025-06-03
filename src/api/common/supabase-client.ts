import { createClient, User } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
import { AppRequest } from './types';
import { environment } from '@environments/environment';
import { env } from 'process';
import { SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@api/keys';

export function createSupabaseClient() {
  // Replace with your actual Supabase URL and Anon Key
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY;

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
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY ;
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
  const supabaseUrl = SUPABASE_URL ?? environment.supabaseUrl;
  const supabaseServiceRoleKey = SUPABASE_SERVICE_ROLE_KEY ?? environment.apiAdminKey;

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
