import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function bulkDeleteCategories(
  categoryIds: string[],
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!categoryIds || categoryIds.length === 0) {
    throw new BadRequestException(
      'Category IDs are required for bulk deletion'
    );
  }

  const { error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .delete()
    .in('id', categoryIds);

  if (error) {
    throw error;
  }
}
