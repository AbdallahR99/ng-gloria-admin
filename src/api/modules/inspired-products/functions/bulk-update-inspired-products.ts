import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import {
  InspiredProduct,
  InspiredProductCreateOrUpdate,
} from '@app/core/models/inspired-product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserIdentitfier } from '@api/common/supabase-client';

export async function bulkUpdateInspiredProducts(
  updates: InspiredProductCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct[]> {
  if (!updates || updates.length === 0) {
    throw new BadRequestException(
      'No inspired products provided for bulk update'
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);
  const inspiredProductsForUpdate = [];

  for (const update of updates) {
    const {
      id,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      imageFile,
      metaTitleEn,
      metaTitleAr,
      metaDescriptionEn,
      metaDescriptionAr,
    } = update;

    if (!id) {
      throw new BadRequestException(
        'Inspired product ID is required for update'
      );
    }

    let imageFileName: string | undefined;
    if (imageFile) {
      const fileName = `inspired-products/inspired_product_${crypto.randomUUID()}`;
      const { fileName: filename } = await supabaseUploadAssest(
        fileName,
        imageFile
      );
      imageFileName = filename;
    }

    const inspiredProductForUpdate = {
      id,
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      image: imageFileName || undefined,
      meta_title_en: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description_en: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      updated_by: userIdentitfier,
      updated_at: new Date().toISOString(),
    };

    inspiredProductsForUpdate.push(inspiredProductForUpdate);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .upsert(inspiredProductsForUpdate, { onConflict: 'id' });

  if (error) {
    throw error;
  }

  return data
    ? ((data as any[]).map(toCamelCase) as InspiredProduct[])
    : (inspiredProductsForUpdate.map(toCamelCase) as InspiredProduct[]);
}
