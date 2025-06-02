import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function bulkDeleteInspiredProducts(
  inspiredProductIds: string[],
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!inspiredProductIds || inspiredProductIds.length === 0) {
    throw new BadRequestException(
      'Inspired Product IDs are required for bulk deletion'
    );
  }

  const { error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .delete()
    .in('id', inspiredProductIds);

  if (error) {
    throw error;
  }
}
