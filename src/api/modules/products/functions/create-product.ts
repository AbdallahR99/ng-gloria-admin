import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import {
  getUserIdentitfier,
  supabaseClient,
} from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import { Product, ProductCreateOrUpdate } from '@app/core/models/product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';
export async function createProduct(
  input: ProductCreateOrUpdate,
  supabase: SupabaseClient = supabaseClient
): Promise<Product> {
  const {
    sku,
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    metaTitleAr,
    metaTitleEn,
    metaDescriptionAr,
    metaDescriptionEn,
    quantity,
    imagesFiles,
    thumbnail,
    categoryId,
    categorySlug,
    sizes,
    colors,
    keywords,
    inspiredById,
    slug,
    slugAr,
    price,
    oldPrice,
  } = input;
  if (!nameEn || !nameAr) {
    throw new BadRequestException(
      'Product name in both English and Arabic is required'
    );
  }
  if (!descriptionEn || !descriptionAr) {
    throw new BadRequestException(
      'Product description in both English and Arabic is required'
    );
  }
  if (!categoryId) {
    if (!categorySlug)
      throw new BadRequestException('Category ID or slug is required');

    // find the category by slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .or(`slug.eq.${categorySlug},slug_ar.eq.${categorySlug}`)
      .single();
    if (categoryError || !categoryData) {
      throw new BadRequestException(
        `Category with slug ${categorySlug} not found`
      );
    }
  }
  if (!sku) {
    throw new BadRequestException('SKU is required to create a product');
  } else {
    // find if the product already exists
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();
    if (data) {
      throw new BadRequestException(`Product with SKU ${sku} already exists`);
    }
  }

  let images: string[] = [];
  if (imagesFiles && imagesFiles.length > 0) {
    for (const base64 of imagesFiles) {
      const fileName = `products/product_${sku}_image_${crypto.randomUUID()}`;
      const { fileName: filename } = await supabaseUploadAssest(
        fileName,
        base64
      );
      images.push(filename);
    }
  }
  let thumbnailFile: string | undefined;
  if (thumbnail) {
    const fileName = `products/product_${sku}_thumbnail_${crypto.randomUUID()}`;
    const { fileName: filename } = await supabaseUploadAssest(
      fileName,
      thumbnail
    );
    thumbnailFile = filename;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userIdentitfier = getUserIdentitfier(user); // 'user identity or anonymous';

  const productForCreate = {
    sku,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    meta_title_en: metaTitleEn,
    meta_title_ar: metaTitleAr,
    meta_description_en: metaDescriptionEn,
    meta_description_ar: metaDescriptionAr,
    quantity: +(quantity ?? 0),
    images,
    thumbnail: thumbnailFile || '',
    category_id: categoryId,
    sizes: sizes,
    colors: colors,
    keywords: keywords,
    inspired_by_id: inspiredById || null,
    price: +(price ?? 0),
    old_price: oldPrice ? +oldPrice : null,
    slug: slug,
    slug_ar: slugAr,
    created_by: userIdentitfier,
  };
  const { data, error } = await supabase
    .from(SupabaseTableNames.PRODUCTS)
    .insert(productForCreate)
    .select('*')
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('Failed to create product');
  }
  return toCamelCase(data) as Product;
}
