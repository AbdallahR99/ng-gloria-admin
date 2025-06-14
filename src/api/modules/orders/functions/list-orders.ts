import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { Order, OrderQuery } from '@app/core/models/order.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { queryFilterOrder } from './query-filter-order';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@app/core/utils/case-converter';

export async function listOrders(
  input: OrderQuery,
  supabase: SupabaseClient = supabaseClient,
): Promise<Order[]> {
  const query = supabase.from(SupabaseTableNames.ORDERS).select('*');


  const { data, count, error } = await queryFilterOrder<typeof query>(query, input);

  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundException('No orders found');
  }

  return data.map(toCamelCase) as Order[];
}
