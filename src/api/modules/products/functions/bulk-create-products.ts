import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import { toCamelCase } from '@api/common/utils/case-converter';
import { Product, ProductCreateOrUpdate } from '@app/core/models/product.model';
import { SupabaseClient } from '@supabase/supabase-js';

export async function bulkCreateProducts(
  inputs: ProductCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<Product[]> {
  if (!inputs || inputs.length === 0) {
    throw new BadRequestException('No products provided for bulk creation');
  }

  const productsForInsert = [];

  for (const input of inputs) {
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

    let resolvedCategoryId = categoryId;
    if (!categoryId && categorySlug) {
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
      resolvedCategoryId = categoryData.id;
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

    const productForInsert = {
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
      images: images.length > 0 ? images : undefined,
      thumbnail: thumbnailFile || undefined,
      category_id: resolvedCategoryId,
      sizes: sizes,
      colors: colors,
      keywords: keywords,
      inspired_by_id: inspiredById || null,
      price: +price,
      old_price: oldPrice ? +oldPrice : null,
      slug: slug,
      slug_ar: slugAr,
      created_at: new Date().toISOString(),
    };

    productsForInsert.push(productForInsert);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.PRODUCTS)
    .insert(productsForInsert);

  if (error) {
    throw error;
  }
  return data
    ? ((data as any[]).map(toCamelCase) as Product[])
    : (productsForInsert.map(toCamelCase) as Product[]);
}
