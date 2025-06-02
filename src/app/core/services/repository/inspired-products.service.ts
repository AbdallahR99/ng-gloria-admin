import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import {
  InspiredProduct,
  InspiredProductsQuery,
  InspiredProductCreateOrUpdate,
} from '@app/core/models/inspired-product.model';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class InspiredProductsService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'inspired-products';

  // GET /api/inspired-products - Get all inspired products with optional filtering
  getList(queryParams?: Partial<InspiredProductsQuery>) {
    return this.fn.callFunction<InspiredProduct[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams,
    });
  }

  // GET /api/inspired-products/list - Get all inspired products with optional filtering
  get(queryParams?: Partial<InspiredProductsQuery>) {
    return this.fn.callFunction<InspiredProduct[]>(`${this.endpoint}/list`, {
      method: 'GET',
      queryParams,
    });
  }

  // GET /api/inspired-products/byId/:id - Get inspired product by ID
  getById(id: string) {
    return this.fn.callFunction<InspiredProduct>(
      `${this.endpoint}/byId/${id}`,
      {
        method: 'GET',
      }
    );
  }

  // GET /api/inspired-products/filter - Get all inspired products with pagination and filtering
  getFilter(queryParams?: Partial<InspiredProductsQuery>) {
    return this.fn.callFunction<PaginatedResponse<InspiredProduct>>(
      `${this.endpoint}/filter`,
      {
        method: 'GET',
        queryParams,
      }
    );
  }

  // POST /api/inspired-products/filter - Get all inspired products with pagination and filtering in body
  postFilter(query: Partial<InspiredProductsQuery>) {
    return this.fn.callFunction<PaginatedResponse<InspiredProduct>>(
      `${this.endpoint}/filter`,
      {
        method: 'POST',
        body: query,
      }
    );
  }

  // POST /api/inspired-products - Create a new inspired product
  create(inspiredProduct: InspiredProductCreateOrUpdate) {
    return this.fn.callFunction<InspiredProduct>(`${this.endpoint}`, {
      method: 'POST',
      body: inspiredProduct,
    });
  }

  // POST /api/inspired-products/bulk - Create multiple inspired products
  bulkCreate(inspiredProducts: InspiredProductCreateOrUpdate[]) {
    return this.fn.callFunction<InspiredProduct[]>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: inspiredProducts,
    });
  }

  // PUT /api/inspired-products/:id - Update an inspired product by ID
  update(id: string, inspiredProduct: InspiredProductCreateOrUpdate) {
    return this.fn.callFunction<InspiredProduct>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: inspiredProduct,
    });
  }

  // PUT /api/inspired-products/bulk - Update multiple inspired products
  bulkUpdate(inspiredProducts: InspiredProductCreateOrUpdate[]) {
    return this.fn.callFunction<InspiredProduct[]>(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: inspiredProducts,
    });
  }

  // DELETE /api/inspired-products/:id - Delete an inspired product by ID
  delete(id: string) {
    return this.fn.callFunction<void>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // DELETE /api/inspired-products/bulk - Delete multiple inspired products
  bulkDelete(ids: string[]) {
    return this.fn.callFunction<void>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }
}
