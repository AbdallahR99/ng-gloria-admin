import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseClient } from '@api/common/supabase-client';

export async function deleteInspiredProduct(
  inspiredProductId: string,
  supabase: SupabaseClient = supabaseClient
): Promise<void> {
  if (!inspiredProductId) {
    throw new BadRequestException(
      'Inspired Product ID is required for deletion'
    );
  }

  const { error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .delete()
    .eq('id', inspiredProductId);

  if (error) {
    throw error;
  }
}
