import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import {
  InspiredProduct,
  InspiredProductsQuery,
} from '@app/core/models/inspired-product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { supabaseClient } from '@api/common/supabase-client';
import { paginateInspiredProducts } from './paginate-inspired-products';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { AppException } from '@api/common/exceptions/app.exception';

export async function listInspiredProducts(
  input: InspiredProductsQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct[]> {
  const query = supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .select('*', { count: 'exact' });
  const { data, error } = await paginateInspiredProducts<typeof query>(
    query,
    input
  );

  if (error) {
    throw error;
  }

  return data ? (data.map(toCamelCase) as InspiredProduct[]) : [];
}

export async function filterInspiredProducts(
  input: InspiredProductsQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<PaginatedResponse<InspiredProduct>> {
  const query = supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .select('*', { count: 'exact' });
  const { data, count, error } = await paginateInspiredProducts<typeof query>(
    query,
    input
  );

  if (error) {
    throw error;
  }
  if (!data) {
    throw new AppException('No inspired products found');
  }
  return {
    data: data.map(toCamelCase) as InspiredProduct[],
    pagination: {
      total: count || 0,
      page: input.page || 1,
      pageSize: input.pageSize || 10,
      totalPages: Math.ceil((count || 0) / (input.pageSize || 10)),
    },
  };
}
