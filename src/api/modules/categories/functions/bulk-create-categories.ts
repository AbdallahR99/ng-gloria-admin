import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import { toCamelCase } from '@api/common/utils/case-converter';
import {
  Category,
  CategoryCreateOrUpdate,
} from '@app/core/models/category.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserIdentitfier } from '@api/common/supabase-client';

export async function bulkCreateCategories(
  inputs: CategoryCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<Category[]> {
  if (!inputs || inputs.length === 0) {
    throw new BadRequestException('No categories provided for bulk creation');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);
  const categoriesForInsert = [];

  for (const input of inputs) {
    const {
      nameEn,
      nameAr,
      slug,
      slugAr,
      imageFile,
      metaTitleEn,
      metaTitleAr,
      metaDescriptionEn,
      metaDescriptionAr,
    } = input;

    if (!nameEn || !nameAr) {
      throw new BadRequestException(
        'Category name in both English and Arabic is required'
      );
    }

    if (!slug || !slugAr) {
      throw new BadRequestException(
        'Category slug in both English and Arabic is required'
      );
    }

    let imageFileName: string | undefined;
    if (imageFile) {
      const fileName = `categories/category_${slug}_${crypto.randomUUID()}`;
      const { fileName: filename } = await supabaseUploadAssest(
        fileName,
        imageFile
      );
      imageFileName = filename;
    }

    const categoryForInsert = {
      name_en: nameEn,
      name_ar: nameAr,
      slug,
      slug_ar: slugAr,
      image: imageFileName || undefined,
      meta_title_en: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description_en: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      created_by: userIdentitfier,
      created_at: new Date().toISOString(),
    };

    categoriesForInsert.push(categoryForInsert);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .insert(categoriesForInsert);

  if (error) {
    throw error;
  }

  return data
    ? ((data as any[]).map(toCamelCase) as Category[])
    : (categoriesForInsert.map(toCamelCase) as Category[]);
}
