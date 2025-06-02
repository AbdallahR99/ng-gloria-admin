import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { Category, CategoryQuery, CategoryCreateOrUpdate } from '@app/core/models/category.model';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'categories';

  // GET /api/categories - Get all categories with optional filtering
  getList(queryParams?: Partial<CategoryQuery>) {
    return this.fn.callFunction<Category[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams,
    });
  }

  // GET /api/categories/list - Get all categories with optional filtering
  get(queryParams?: Partial<CategoryQuery>) {
    return this.fn.callFunction<Category[]>(`${this.endpoint}/list`, {
      method: 'GET',
      queryParams,
    });
  }

  // GET /api/categories/byId/:id - Get category by ID
  getById(id: string) {
    return this.fn.callFunction<Category>(`${this.endpoint}/byId/${id}`, {
      method: 'GET',
    });
  }

  // GET /api/categories/bySlug/:slug - Get category by slug
  getBySlug(slug: string) {
    return this.fn.callFunction<Category>(`${this.endpoint}/bySlug/${slug}`, {
      method: 'GET',
    });
  }

  // GET /api/categories/filter - Get all categories with pagination and filtering
  getFilter(queryParams?: Partial<CategoryQuery>) {
    return this.fn.callFunction<PaginatedResponse<Category>>(`${this.endpoint}/filter`, {
      method: 'GET',
      queryParams,
    });
  }

  // POST /api/categories/filter - Get all categories with pagination and filtering in body
  postFilter(query: Partial<CategoryQuery>) {
    return this.fn.callFunction<PaginatedResponse<Category>>(`${this.endpoint}/filter`, {
      method: 'POST',
      body: query,
    });
  }

  // POST /api/categories - Create a new category
  create(category: CategoryCreateOrUpdate) {
    return this.fn.callFunction<Category>(`${this.endpoint}`, {
      method: 'POST',
      body: category,
    });
  }

  // POST /api/categories/bulk - Create multiple categories
  bulkCreate(categories: CategoryCreateOrUpdate[]) {
    return this.fn.callFunction<Category[]>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: categories,
    });
  }

  // PUT /api/categories/:id - Update a category by ID
  update(id: string, category: CategoryCreateOrUpdate) {
    return this.fn.callFunction<Category>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: category,
    });
  }

  // PUT /api/categories/bulk - Update multiple categories
  bulkUpdate(categories: CategoryCreateOrUpdate[]) {
    return this.fn.callFunction<Category[]>(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: categories,
    });
  }

  // DELETE /api/categories/:id - Delete a category by ID
  delete(id: string) {
    return this.fn.callFunction<void>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // DELETE /api/categories/bulk - Delete multiple categories
  bulkDelete(ids: string[]) {
    return this.fn.callFunction<void>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }
}
