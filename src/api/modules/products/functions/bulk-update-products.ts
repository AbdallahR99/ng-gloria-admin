import { BadRequestException } from '@api/common/exceptions/bad-request.exception';
import { supabaseClient } from '@api/common/supabase-client';
import { SupabaseTableNames } from '@api/common/supabase-table-names';
import { supabaseUploadAssest } from '@api/common/supabase-upload-image';
import { Product, ProductCreateOrUpdate } from '@app/core/models/product.model';
import { toCamelCase } from '@app/core/utils/case-converter';
import { SupabaseClient } from '@supabase/supabase-js';

export async function bulkUpdateProducts(
  updates: ProductCreateOrUpdate[],
  supabase: SupabaseClient = supabaseClient
): Promise<Product[]> {
  if (!updates || updates.length === 0) {
    throw new BadRequestException('No products provided for bulk update');
  }

  const productsForUpdate = [];

  for (const update of updates) {
    const {
      id,
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
    } = update;

    if (!id) {
      throw new BadRequestException('Product ID is required for update');
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

    const productForUpdate = {
      id,
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
      updated_at: new Date().toISOString(),
    };

    productsForUpdate.push(productForUpdate);
  }

  const { data, error } = await supabase
    .from(SupabaseTableNames.PRODUCTS)
    .upsert(productsForUpdate, { onConflict: 'id' });

  if (error) {
    throw error;
  }
  return data
    ? ((data as any[]).map(toCamelCase) as Product[])
    : (productsForUpdate.map(toCamelCase) as Product[]);
}
