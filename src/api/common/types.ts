import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

export type AppRequest = Request<any> & {
  supabase?: SupabaseClient;
  // [key: string]: any; // Allow additional properties
};
// export interface AppRequestWithSupabase extends AppRequest {
//   supabase?: SupabaseClient;
//   [key: string]: any; // Allow additional properties
// }
// export interface AppRequest
//   extends Request<
//     { [key: string]: string } & { supabase: SupabaseClient },
//     any,
//     any,
//     any,
//     any
//   > {
//   // [key: string]: string ;
//   // supabase: SupabaseClient;
// }
