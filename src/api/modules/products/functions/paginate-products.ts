import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { toCamelCase } from '@api/common/utils/case-converter';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { Product, ProductQuery } from '@app/core/models/product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { queryFilterProducts } from './query-filter-products';
import { supabaseClient } from '@api/common/supabase-client';

export async function paginateProducts(
  input: ProductQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<PaginatedResponse<Product>> {
  const { page, pageSize } = input;
  const query = supabase
    .from(SupabaseTableNames.PRODUCTS)
    .select(
      `*, category:${SupabaseTableNames.CATEGORIES}(name_en, name_ar), inspired_by:${SupabaseTableNames.INSPIRED_PRODUCTS}(name_en, name_ar, description_en, description_ar, image)`
    );

  const { data, count, error } = await queryFilterProducts(query, input || {});
  if (error) {
    throw error;
  }
  return {
    data: data.map(toCamelCase) || [],
    pagination: {
      page: page || 1,
      pageSize: pageSize || 10,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / (pageSize || 10)),
    },
  };
}
