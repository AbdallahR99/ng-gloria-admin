import { Product } from '@app/core/models/product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';

export async function getProduct(
  { slug, id }: { slug?: string; id?: string },
  supabase: SupabaseClient = supabaseClient
): Promise<Product> {
  const query = supabase
    .from(SupabaseTableNames.PRODUCTS)
    .select(
      `*, category:${SupabaseTableNames.CATEGORIES}(name_en, name_ar, slug, slug_ar), inspired_by:${SupabaseTableNames.INSPIRED_PRODUCTS}(name_en, name_ar, description_en, description_ar, image)`
    );

  if (slug) {
    query.or(`slug.eq.${slug},slug_ar.eq.${slug}`);
  } else if (id) {
    query.eq('id', id);
  } else {
    throw new BadRequestException('Either slug or id must be provided');
  }
  const { data, error } = await query.single();
  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundException('Product not found');
  }
  return toCamelCase(data) as Product;
}
