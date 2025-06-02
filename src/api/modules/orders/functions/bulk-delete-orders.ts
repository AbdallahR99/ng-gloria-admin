import { SupabaseClient } from '@supabase/supabase-js';

export async function bulkDeleteOrders(
  orderIds: string[],
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .in('id', orderIds);

  if (error) {
    throw error;
  }

  return data;
}
