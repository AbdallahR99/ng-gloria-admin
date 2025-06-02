import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import { toCamelCase } from '@api/common/utils/case-converter';
import {
  InspiredProduct,
  InspiredProductCreateOrUpdate,
} from '@app/core/models/inspired-product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserIdentitfier } from '@api/common/supabase-client';

export async function bulkCreateInspiredProducts(
  inputs: InspiredProductCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<InspiredProduct[]> {
  if (!inputs || inputs.length === 0) {
    throw new BadRequestException(
      'No inspired products provided for bulk creation'
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);
  const inspiredProductsForInsert = [];

  for (const input of inputs) {
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

    const inspiredProductForInsert = {
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      image: imageFileName || undefined,
      meta_title_en: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description_en: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      created_by: userIdentitfier,
      created_at: new Date().toISOString(),
    };

    inspiredProductsForInsert.push(inspiredProductForInsert);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.INSPIRED_PRODUCTS)
    .insert(inspiredProductsForInsert);

  if (error) {
    throw error;
  }

  return data
    ? ((data as any[]).map(toCamelCase) as InspiredProduct[])
    : (inspiredProductsForInsert.map(toCamelCase) as InspiredProduct[]);
}
