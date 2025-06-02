import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getOrder(
  orderId: string,
  supabase: SupabaseClient = supabaseClient,
) {
  const { data, error } = await supabase
    .from(SupabaseTableNames.ORDERS)
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
