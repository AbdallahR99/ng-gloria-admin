import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { CategoryQuery } from '@app/core/models/category.model';
import { supabaseClient } from '@api/common/supabase-client';

export async function paginateCategories<T>(
  query: T | any,
  input: CategoryQuery
): Promise<T> {
  const {
    page = 1,
    pageSize = 20,
    queryString,
    sortBy = 'created_at',
    sortOrder = 'desc',
    showDeleted,
  } = input;

  if (!(showDeleted === true)) {
    query.eq('is_deleted', false);
  }

  // Apply search filter
  if (queryString) {
    query = query.or(
      `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,slug.ilike.%${queryString}%,slug_ar.ilike.%${queryString}%`
    );
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query as T;
}
