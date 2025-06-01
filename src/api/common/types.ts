import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

export type AppRequest = Request & {
  supabase: SupabaseClient;
};
