import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import {
  InspiredProduct,
  InspiredProductsQuery,
} from '@app/core/models/inspired-product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { supabaseClient } from '@api/common/supabase-client';

export async function listInspiredProducts(
  input: InspiredProductsQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct[]> {
  const {
    page = 1,
    pageSize = 99,
    queryString,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = input;

  let query = supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .select('*')
    .eq('is_deleted', false);

  // Apply search filter
  if (queryString) {
    query = query.or(
      `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,description_en.ilike.%${queryString}%,description_ar.ilike.%${queryString}%`
    );
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ? (data.map(toCamelCase) as InspiredProduct[]) : [];
}
