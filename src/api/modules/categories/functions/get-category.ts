import { Category } from '@app/core/models/category.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';

export async function getCategory(
  { id, slug }: { id?: string; slug?: string },
  supabase: SupabaseClient = supabaseClient
): Promise<Category> {
  if (!id && !slug) {
    throw new BadRequestException('Either ID or slug must be provided');
  }

  let query = supabase.from(SupabaseTableNames.CATEGORIES).select('*');

  if (id) {
    query = query.eq('id', id);
  } else if (slug) {
    query = query.or(`slug.eq.${slug},slug_ar.eq.${slug}`);
  }

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundException('Category not found');
  }

  return toCamelCase(data) as Category;
}
