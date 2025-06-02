import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { FacadeService } from '../facade-service.service';
import { tap, Observable } from 'rxjs';
import {
  Order,
  OrderQuery,
  OrderCreateOrUpdate,
  OrderStatusUpdate,
  OrderCheckout,
  OrderCheckoutDirect,
} from '@app/core/models/order.model';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'orders';
  facadeService = inject(FacadeService);

  // GET /api/orders/:id - Get order by ID
  getById(id: string): Observable<Order> {
    return this.fn.callFunction<Order>(`${this.endpoint}/byId/${id}`, {
      method: 'GET',
    });
  }

  // GET /api/orders - Get orders list with pagination
  list(params?: { page?: number; pageSize?: number }): Observable<Order[]> {
    return this.fn.callFunction<Order[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: params,
    });
  }

  // POST /api/orders/filter - Filter orders with pagination
  filter(query: OrderQuery): Observable<PaginatedResponse<Order>> {
    return this.fn.callFunction<PaginatedResponse<Order>>(
      `${this.endpoint}/filter`,
      {
        method: 'POST',
        body: query,
      }
    );
  }

  // POST /api/orders - Create a new order
  create(orderData: OrderCreateOrUpdate): Observable<Order> {
    return this.fn.callFunction<Order>(`${this.endpoint}`, {
      method: 'POST',
      body: orderData,
    });
  }

  // POST /api/orders/bulk - Create multiple orders
  bulkCreate(orders: OrderCreateOrUpdate[]): Observable<Order[]> {
    return this.fn.callFunction<Order[]>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: orders,
    });
  }

  // PUT /api/orders/:id - Update an order
  update(id: string, orderData: OrderCreateOrUpdate): Observable<Order> {
    return this.fn.callFunction<Order>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: { ...orderData, id },
    });
  }

  // PUT /api/orders/bulk - Update multiple orders
  bulkUpdate(orders: OrderCreateOrUpdate[]): Observable<Order[]> {
    return this.fn.callFunction<Order[]>(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: orders,
    });
  }

  // PUT /api/orders/:id/status - Update order status
  updateStatus(
    id: string,
    statusData: Omit<OrderStatusUpdate, 'id'>
  ): Observable<{ status: string }> {
    return this.fn.callFunction<{ status: string }>(
      `${this.endpoint}/${id}/status`,
      {
        method: 'PUT',
        body: statusData,
      }
    );
  }

  // PUT /api/orders/:orderCode/status - Update order status by order code
  updateStatusByCode(
    orderCode: string,
    statusData: Omit<OrderStatusUpdate, 'orderCode'>
  ): Observable<{ status: string }> {
    return this.fn.callFunction<{ status: string }>(
      `${this.endpoint}/${orderCode}/status`,
      {
        method: 'PUT',
        body: statusData,
      }
    );
  }

  // DELETE /api/orders/:id - Delete an order
  delete(id: string): Observable<void> {
    return this.fn.callFunction<void>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // DELETE /api/orders/bulk - Delete multiple orders
  bulkDelete(orderIds: string[]): Observable<void> {
    return this.fn.callFunction<void>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: orderIds,
    });
  }

  // POST /api/orders/checkout - Checkout from cart
  checkout(checkoutData: OrderCheckout): Observable<Order> {
    return this.fn
      .callFunction<Order>(`${this.endpoint}/checkout`, {
        method: 'POST',
        body: checkoutData,
      })
      .pipe(
        tap(() => {
          this.facadeService.cartService.updateCartCount();
        })
      );
  }

  // POST /api/orders/checkout-direct - Direct checkout
  directCheckout(checkoutData: OrderCheckoutDirect): Observable<Order> {
    return this.fn
      .callFunction<Order>(`${this.endpoint}/checkout-direct`, {
        method: 'POST',
        body: checkoutData,
      })
      .pipe(
        tap(() => {
          this.facadeService.cartService.updateCartCount();
        })
      );
  }
}
