import { SupabaseClient } from '@supabase/supabase-js';

export async function bulkCreateOrders(
  ordersData: any[],
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('orders')
    .insert(ordersData)
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}
