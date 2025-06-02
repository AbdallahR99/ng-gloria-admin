import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { Order, OrderQuery } from '@app/core/models/order.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { queryFilterOrder } from './query-filter-order';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@app/core/utils/case-converter';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

export async function paginateOrders(
  input: OrderQuery,
  supabase: SupabaseClient = supabaseClient,
): Promise<PaginatedResponse<Order>> {
  const query = supabase.from(SupabaseTableNames.ORDERS).select('*');


  const { data, count, error } = await queryFilterOrder<typeof query>(query, input);

  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundException('No orders found');
  }

  return {
    data: data.map(toCamelCase) as Order[],
    pagination: {
      total: count || 0,
      page: input.page || 1,
      pageSize: input.pageSize || 10,
      totalPages: Math.ceil((count || 0) / (input.pageSize || 10)),
    }
  };
}
