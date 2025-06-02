import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { Product, ProductQuery, ProductCreateOrUpdate } from '@app/core/models/product.model';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'products';

  // GET /api/products/:slug - Get product by Slug
  getBySlug(slug: string) {
    return this.fn.callFunction<Product>(`${this.endpoint}/${slug}`, {
      method: 'GET',
    });
  }

  // GET /api/products/byId/:id - Get product by ID
  getById(id: string) {
    return this.fn.callFunction<Product>(`${this.endpoint}/byId/${id}`, {
      method: 'GET',
    });
  }

  // GET /api/products/:slug/related - Get related products
  getRelated(slug: string) {
    return this.fn.callFunction<Product[]>(`${this.endpoint}/${slug}/related`, {
      method: 'GET',
    });
  }

  // GET /api/products/list - Get all products with optional filtering
  list(query?: ProductQuery) {
    return this.fn.callFunction<Product[]>(`${this.endpoint}/list`, {
      method: 'GET',
      queryParams: query
        ? (Object.fromEntries(
            Object.entries({
              page: query.page,
              pageSize: query.pageSize,
              queryString: query.queryString,
              color: query.color,
              size: query.size,
              categoryId: query.categoryId,
              categorySlug: query.categorySlug,
              minPrice: query.minPrice,
              maxPrice: query.maxPrice,
              sortBy: query.sortBy,
              sortOrder: query.sortOrder,
              showDeleted: query.showDeleted,
            }).filter(([_, v]) => v !== undefined)
          ) as Record<string, string | number | boolean>)
        : undefined,
    });
  }

  // GET /api/products/filter - Get products with pagination via query params
  filterByQuery(query?: ProductQuery) {
    return this.fn.callFunction<PaginatedResponse<Product>>(`${this.endpoint}/filter`, {
      method: 'GET',
      queryParams: query
        ? (Object.fromEntries(
            Object.entries({
              page: query.page,
              pageSize: query.pageSize,
              queryString: query.queryString,
              color: query.color,
              size: query.size,
              categoryId: query.categoryId,
              categorySlug: query.categorySlug,
              minPrice: query.minPrice,
              maxPrice: query.maxPrice,
              sortBy: query.sortBy,
              sortOrder: query.sortOrder,
              showDeleted: query.showDeleted,
            }).filter(([_, v]) => v !== undefined)
          ) as Record<string, string | number | boolean>)
        : undefined,
    });
  }

  // POST /api/products/filter - Get products with pagination via body
  filter(body: ProductQuery) {
    return this.fn.callFunction<PaginatedResponse<Product>>(
      `${this.endpoint}/filter`,
      {
        method: 'POST',
        body,
      }
    );
  }

  // POST /api/products - Create a new product
  create(product: ProductCreateOrUpdate) {
    return this.fn.callFunction<Product>(`${this.endpoint}`, {
      method: 'POST',
      body: product,
    });
  }

  // PUT /api/products/:id - Update a product by ID
  update(id: string, product: ProductCreateOrUpdate) {
    return this.fn.callFunction<Product>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: product,
    });
  }

  // DELETE /api/products/:id - Delete a product by ID
  delete(id: string) {
    return this.fn.callFunction<void>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // POST /api/products/bulk - Create multiple products
  bulkCreate(products: ProductCreateOrUpdate[]) {
    return this.fn.callFunction<Product[]>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: products,
    });
  }

  // PUT /api/products/bulk - Update multiple products
  bulkUpdate(products: ProductCreateOrUpdate[]) {
    return this.fn.callFunction<Product[]>(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: products,
    });
  }

  // DELETE /api/products/bulk - Delete multiple products
  bulkDelete(ids: string[]) {
    return this.fn.callFunction<void>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }

  // GET /api/products - Get all products (alias for list)
  get(query?: ProductQuery) {
    return this.list(query);
  }
}
