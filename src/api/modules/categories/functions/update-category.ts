import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import {
  getUserIdentitfier,
  supabaseClient,
} from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import {
  Category,
  CategoryCreateOrUpdate,
} from '@app/core/models/category.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function updateCategory(
  categoryId: string,
  input: CategoryCreateOrUpdate,
  supabase: SupabaseClient = supabaseClient
): Promise<Category> {
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

  if (!categoryId) {
    throw new BadRequestException(
      'Category ID is required for updating a category'
    );
  }

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

  // Check if slug already exists for other categories
  const { data: existingCategory } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .select('id')
    .or(`slug.eq.${slug},slug_ar.eq.${slugAr}`)
    .neq('id', categoryId)
    .single();

  if (existingCategory) {
    throw new BadRequestException('Category with this slug already exists');
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user);

  const categoryForUpdate = {
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

  const { data, error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .update(categoryForUpdate)
    .eq('id', categoryId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to update category');
  }

  return toCamelCase(data) as Category;
}
