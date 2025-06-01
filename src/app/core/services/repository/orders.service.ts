import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { FacadeService } from '../facade-service.service';
import { tap } from 'rxjs';
import { OrderStatus } from '@app/core/constants/order-status.enum';
import { Order } from '@app/core/models/order.model';
type CheckoutRequest = {
  addressId?: string;
  note?: string;
};

type CheckoutResponse = {
  orderId: string;
  orderCode: string;
};

type DirectCheckoutRequest = {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
  addressId: string;
  note?: string;
  userId?: string;
};

type DirectCheckoutResponse = {
  orderId: string;
  orderCode: string;
  totalPrice: number;
  deliveryFee: number;
  productId: string;
  quantity: number;
};

export interface OrderFilters {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | '';
}

export interface OrdersResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Order[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'orders';
  facadeService = inject(FacadeService);

  get(orderCode: string, userId?: string) {
    return this.fn.callFunction<Order>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: {
        orderCode,
        ...(userId ? { userId } : {}),
      },
    });
  }

  checkout(payload: CheckoutRequest) {
    return this.fn
      .callFunction<CheckoutResponse>(`${this.endpoint}/checkout`, {
        method: 'POST',
        body: payload,
      })
      .pipe(
        tap(() => {
          this.facadeService.cartService.updateCartCount();
        })
      );
  }

  directCheckout(payload: DirectCheckoutRequest) {
    return this.fn
      .callFunction<DirectCheckoutResponse>(
        `${this.endpoint}/direct-checkout`,
        {
          method: 'POST',
          body: payload,
        }
      )
      .pipe(
        tap(() => {
          this.facadeService.cartService.updateCartCount();
        })
      );
  }

  updateStatus(payload: {
    orderId?: string;
    orderCode?: string;
    status: string;
    note?: string;
  }) {
    return this.fn.callFunction<{ status: 'updated' }>(
      `${this.endpoint}/status`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  }

  list(filters?: OrderFilters) {
    return this.fn.callFunction<OrdersResponse>(`${this.endpoint}/filter`, {
      method: 'POST',
      body: filters,
    });
  }

  bulkUpdateStatus(
    payloads: { order_id: string; status: string; note?: string }[]
  ) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'PUT',
      body: payloads,
    });
  }

  bulkDelete(orderIds: string[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: orderIds,
    });
  }
}
