import { InspiredProduct } from '@app/core/models/inspired-product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundException } from '@api/common/exceptions/not-found.exception';
import { toCamelCase } from '@api/common/utils/case-converter';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';

export async function getInspiredProduct(
  { id }: { id: string },
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct> {
  if (!id) {
    throw new BadRequestException('ID must be provided');
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundException('Inspired product not found');
  }

  return toCamelCase(data) as InspiredProduct;
}
