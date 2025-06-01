import { Product } from '@app/core/models/product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@api/common/utils/case-converter';

export async function getProduct(
  supabaseClient: SupabaseClient,
  { slug, id }: { slug?: string; id?: string }
): Promise<Product> {
  const query = supabaseClient
    .from('products')
    .select('*, category:categories(name_en, name_ar, slug_en, slug_ar)');

  if (slug) {
    query.or(`slug_en.eq.${slug},slug_ar.eq.${slug}`);
  } else if (id) {
    query.eq('id', id);
  } else {
    throw new Error('Either slug or id must be provided');
  }
  const { data, error } = await query.single();
  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  if (!data) {
    throw new NotFoundException('Product not found');
  }
  return toCamelCase(data) as Product;
}
