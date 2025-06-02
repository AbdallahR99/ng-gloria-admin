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

export async function createCategory(
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

  // Check if slug already exists
  const { data: existingCategory } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .select('id')
    .or(`slug.eq.${slug},slug_ar.eq.${slugAr}`)
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

  const categoryForCreate = {
    name_en: nameEn,
    name_ar: nameAr,
    slug,
    slug_ar: slugAr,
    image: imageFileName || '',
    meta_title_en: metaTitleEn,
    meta_title_ar: metaTitleAr,
    meta_description_en: metaDescriptionEn,
    meta_description_ar: metaDescriptionAr,
    created_by: userIdentitfier,
  };

  const { data, error } = await supabase
    .from(SupabaseTableNames.CATEGORIES)
    .insert(categoryForCreate)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create category');
  }

  return toCamelCase(data) as Category;
}
