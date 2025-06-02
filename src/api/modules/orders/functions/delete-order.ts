import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { SupabaseClient } from '@supabase/supabase-js';

export async function deleteOrder(
  { orderId, orderCode }: { orderId?: string; orderCode?: string },
  supabase: SupabaseClient = supabaseClient
) {
  const query = supabase.from(SupabaseTableNames.ORDERS).delete();

  if (orderId) {
    query.eq('id', orderId);
  } else if (orderCode) {
    query.eq('order_code', orderCode);
  } else {
    throw new Error('Either orderId or orderCode must be provided');
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
