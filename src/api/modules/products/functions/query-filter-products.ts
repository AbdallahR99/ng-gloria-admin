import { toSnakeCase } from '@api/common/utils/case-converter';
import { ProductQuery } from '@app/core/models/product.model';

export function queryFilterProducts<T>(query: T, input: ProductQuery): T {
  const {
    page,
    pageSize,
    queryString,
    color,
    size,
    categoryId,
    categorySlug,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    showDeleted,
  } = input;

  if (!showDeleted) {
    (query as any).eq('is_deleted', false);
  }
  if (queryString) {
    (query as any).or(
      `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,keywords.ilike.%${queryString}%,sku.ilike.%${queryString}%`
    );
  }
  if (categoryId) {
    (query as any).eq('category_id', categoryId);
  }
  if (categorySlug) {
    (query as any).or(
      `category.slug.eq.${categorySlug},category.slug_ar.eq.${categorySlug}`
    );
  }
  if (maxPrice) {
    (query as any).lte('price', +maxPrice);
  }
  if (minPrice) {
    (query as any).gte('price', +minPrice);
  }
  if (sortBy) {
    (query as any).order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' });
  } else {
    (query as any).order('created_at', { ascending: false });
  }

  if (page && pageSize) {
    (query as any).range((page - 1) * pageSize, page * pageSize - 1);
  }

  return query;
}
