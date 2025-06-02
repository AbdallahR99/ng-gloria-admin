import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

export async function bulkUpdateOrderStatus(
  updates: { orderId: string; status: string; note?: string }[],
  supabase: SupabaseClient = supabaseClient,
) {
  const { data, error } = await supabase
    .from('orders')
    .upsert(updates.map(({ orderId, status, note }) => ({ id: orderId, status, note })))
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}
