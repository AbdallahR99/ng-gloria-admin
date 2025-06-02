import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { Category, CategoryQuery } from '@app/core/models/category.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { supabaseClient } from '@api/common/supabase-client';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { AppException } from '@api/common/exceptions/app.exception';
import { paginateCategories } from './paginate-categories';

export async function listCategories(
  input: CategoryQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<Category[]> {
  const query = supabase
    .from(SupabaseTableNames.CATEGORIES)
    .select('*', { count: 'exact' });
  const { data, error } = await paginateCategories<typeof query>(query, input);

  if (error) {
    throw error;
  }

  return data ? (data.map(toCamelCase) as Category[]) : [];
}

export async function filterCategories(
  input: CategoryQuery,
  supabase: SupabaseClient = supabaseClient
): Promise<PaginatedResponse<Category>> {
  const query = supabase
    .from(SupabaseTableNames.CATEGORIES)
    .select('*', { count: 'exact' });
  const { data, count, error } = await paginateCategories<typeof query>(
    query,
    input
  );

  if (error) {
    throw error;
  }
  if (!data) {
    throw new AppException('No categories found');
  }
  return {
    data: data.map(toCamelCase) as Category[],
    pagination: {
      total: count || 0,
      page: input.page || 1,
      pageSize: input.pageSize || 10,
      totalPages: Math.ceil((count || 0) / (input.pageSize || 10)),
    },
  };
}
