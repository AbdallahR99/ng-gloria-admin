import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import {
  Category,
  CategoryCreateOrUpdate,
} from '@app/core/models/category.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserIdentitfier } from '@api/common/supabase-client';

export async function bulkUpdateCategories(
  updates: CategoryCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<Category[]> {
  if (!updates || updates.length === 0) {
    throw new BadRequestException('No categories provided for bulk update');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);
  const categoriesForUpdate = [];

  for (const update of updates) {
    const {
      id,
      nameEn,
      nameAr,
      slug,
      slugAr,
      imageFile,
      metaTitleEn,
      metaTitleAr,
      metaDescriptionEn,
      metaDescriptionAr,
    } = update;

    if (!id) {
      throw new BadRequestException('Category ID is required for update');
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

    const categoryForUpdate = {
      id,
      name_en: nameEn,
      name_ar: nameAr,
      slug,
      slug_ar: slugAr,
      image: imageFileName || undefined,
      meta_title_en: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description_en: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      updated_by: userIdentitfier,
      updated_at: new Date().toISOString(),
    };

    categoriesForUpdate.push(categoryForUpdate);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .upsert(categoriesForUpdate, { onConflict: 'id' });

  if (error) {
    throw error;
  }

  return data
    ? ((data as any[]).map(toCamelCase) as Category[])
    : (categoriesForUpdate.map(toCamelCase) as Category[]);
}
