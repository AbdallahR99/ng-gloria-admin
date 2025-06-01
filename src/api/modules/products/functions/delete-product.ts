import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function deleteProduct(
  productId: string,
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!productId) {
    throw new BadRequestException('Product ID is required for deletion');
  }

  const { error } = await supabase
    .from(SupabaseTableNames.PRODUCTS)
    .delete()
    .eq('id', productId);

  if (error) {
    throw error;
  }
}
