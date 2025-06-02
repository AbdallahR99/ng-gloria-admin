import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { SupabaseClient } from '@supabase/supabase-js';

export async function listOrders(
  filters: { userId?: string; status?: string },
  supabase: SupabaseClient = supabaseClient,
) {
  const query = supabase.from(SupabaseTableNames.ORDERS).select('*');

  if (filters.userId) {
    query.eq('user_id', filters.userId);
  }

  if (filters.status) {
    query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
