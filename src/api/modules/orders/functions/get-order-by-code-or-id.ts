import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getOrderByCodeOrId(
  { id, orderCode }: { id?: string; orderCode?: string },
  supabase: SupabaseClient = supabaseClient,
) {
  const query = supabase.from('orders').select('*').limit(1);

  if (id) {
    query.eq('id', id);
  } else if (orderCode) {
    query.eq('order_code', orderCode);
  } else {
    throw new Error('Either id or orderCode must be provided');
  }

  const { data, error } = await query.single();
  if (error) {
    throw error;
  }

  return data;
}
