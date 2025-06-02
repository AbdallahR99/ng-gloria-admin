import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { Order } from '@app/core/models/order.model';
import { toCamelCase } from '@app/core/utils/case-converter';
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

  if (!data) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  return toCamelCase(data) as Order;
}
