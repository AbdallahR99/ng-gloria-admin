import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import {
  getUserIdentitfier,
  supabaseClient,
} from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import {
  InspiredProduct,
  InspiredProductCreateOrUpdate,
} from '@app/core/models/inspired-product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function updateInspiredProduct(
  inspiredProductId: string,
  input: InspiredProductCreateOrUpdate,
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct> {
  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    imageFile,
    metaTitleEn,
    metaTitleAr,
    metaDescriptionEn,
    metaDescriptionAr,
  } = input;

  if (!inspiredProductId) {
    throw new BadRequestException(
      'Inspired Product ID is required for updating an inspired product'
    );
  }

  if (!nameEn || !nameAr) {
    throw new BadRequestException(
      'Inspired product name in both English and Arabic is required'
    );
  }

  if (!descriptionEn || !descriptionAr) {
    throw new BadRequestException(
      'Inspired product description in both English and Arabic is required'
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);

  const inspiredProductForUpdate = {
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

  const { data, error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .update(inspiredProductForUpdate)
    .eq('id', inspiredProductId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to update inspired product');
  }

  return toCamelCase(data) as InspiredProduct;
}
