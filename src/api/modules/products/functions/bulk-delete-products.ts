import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function bulkDeleteProducts(
  productIds: string[],
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!productIds || productIds.length === 0) {
    throw new BadRequestException('Product IDs are required for bulk deletion');
  }

  const { error } = await supabase
    .from(SupabaseTableNames.PRODUCTS)
    .delete()
    .in('id', productIds);

  if (error) {
    throw error;
  }
}
