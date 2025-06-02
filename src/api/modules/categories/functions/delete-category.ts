import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function deleteCategory(
  categoryId: string,
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!categoryId) {
    throw new BadRequestException('Category ID is required for deletion');
  }

  const { error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .delete()
    .eq('id', categoryId);

  if (error) {
    throw error;
  }
}
