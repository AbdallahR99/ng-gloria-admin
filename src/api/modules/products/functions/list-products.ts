import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { Product, ProductQuery } from '@app/core/models/product.model';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { queryFilterProducts } from './query-filter-products';
import { supabaseClient } from '@api/common/supabase-client';

export async function listProducts(
  input?: ProductQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<Product[]> {
  const query = supabase
    .from(SupabaseTableNames.PRODUCTS)
    .select(
      `*, category:${SupabaseTableNames.CATEGORIES}(name_en, name_ar), inspired_by:${SupabaseTableNames.INSPIRED_PRODUCTS}(name_en, name_ar, description_en, description_ar, image)`
    );

  const { data, count, error } = await queryFilterProducts(query, input || {});
  if (error) {
    throw error;
  }
  return data?.map(toCamelCase) || [];
}
