import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { InspiredProduct } from '@app/core/models/inspired-product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { supabaseClient } from '@api/common/supabase-client';

interface PaginateInspiredProductsParams {
  page?: number;
  pageSize?: number;
  queryString?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedInspiredProductsResponse {
  data: InspiredProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function paginateInspiredProducts(
  params: PaginateInspiredProductsParams,
  supabase: SupabaseClient = supabaseClient
): Promise<PaginatedInspiredProductsResponse> {
  const {
    page = 1,
    pageSize = 20,
    queryString,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  let baseQuery = supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .select('*', { count: 'exact' })
    .eq('is_deleted', false);

  // Apply search filter
  if (queryString) {
    baseQuery = baseQuery.or(
      `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,description_en.ilike.%${queryString}%,description_ar.ilike.%${queryString}%`
    );
  }

  // Apply sorting
  baseQuery = baseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  baseQuery = baseQuery.range(from, to);

  const { data, error, count } = await baseQuery;

  if (error) {
    throw error;
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: data ? (data.map(toCamelCase) as InspiredProduct[]) : [],
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
