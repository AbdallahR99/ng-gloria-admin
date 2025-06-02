import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

export async function buildSoftDeleteOrders(
  orderIds: string[],
  supabase: SupabaseClient = supabaseClient,
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ deleted_at: new Date().toISOString(), is_deleted: true })
    .in('id', orderIds);

  if (error) {
    throw error;
  }

  return data;
}

export async function bulkDeleteOrders(
  orderIds: string[],
  supabase: SupabaseClient = supabaseClient,
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
