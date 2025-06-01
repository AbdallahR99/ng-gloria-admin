import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { Product, ProductQuery } from '@app/core/models/product.model';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function listProducts(
  supabaseClient: SupabaseClient,
  input?: ProductQuery
): Promise<Product[]> {
  const query = supabaseClient
    .from('products')
    .select<any, Product>('*, category:categories(name_en, name_ar)');
  if (input) {
    const {
      page,
      pageSize,
      queryString,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      showDeleted,
    } = input;

    if (!showDeleted) {
      query.eq('is_deleted', false);
    }
    if (queryString) {
      query.or(
        `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,keywords.ilike.%${queryString}%,sku.ilike.%${queryString}%`
      );
    }
    if (categoryId) {
      query.eq('category_id', categoryId);
    }
    if (categorySlug) {
      query.or(
        `category.slug_en.eq.${categorySlug},category.slug_ar.eq.${categorySlug}`
      );
    }
    if (maxPrice) {
      query.lte('price', +maxPrice);
    }
    if (minPrice) {
      query.gte('price', +minPrice);
    }
    if (sortBy) {
      query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query.order('created_at', { ascending: false });
    }

    if (page && pageSize) {
      query.range((page - 1) * pageSize, page * pageSize - 1);
    }
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  return data?.map(toCamelCase) || [];
}
