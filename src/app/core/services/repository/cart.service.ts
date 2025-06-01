import { inject, Injectable, signal } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { AuthService } from './auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of, tap } from 'rxjs';
import { CartItem } from '@app/core/models/cart-item.model';
import { CartSummary } from '@app/core/models/cart-summary.model';
type CartInput = {
  productId: string;
  userId?: string;
  color?: string;
  size?: string;
  quantity?: number;
};
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly fn = inject(SupabaseFunctionsService);
  authService = inject(AuthService);
  private readonly endpoint = 'cart';

  cartCount = rxResource({
    params: () => ({
      isAuth: this.authService.isLoggedIn(),
    }),
    stream: ({ params }) => {
      if (!params.isAuth) {
        return of(0);
      }
      return this.count().pipe(map((count) => count.count || 0));
    },
  });

  get(userId?: string) {
    return this.fn.callFunction<CartItem[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: userId ? { userId } : undefined,
    });
  }

  summary(userId?: string) {
    return this.fn.callFunction<CartSummary>(`${this.endpoint}/summary`, {
      method: 'GET',
      queryParams: userId ? { userId } : undefined,
    });
  }

  create(item: CartInput) {
    return this.fn
      .callFunction(`${this.endpoint}`, {
        method: 'POST',
        body: item,
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  update(item: any) {
    return this.fn
      .callFunction(`${this.endpoint}`, {
        method: 'PUT',
        body: item,
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  upsert(item: CartInput) {
    return this.fn
      .callFunction(`${this.endpoint}/upsert`, {
        method: 'POST',
        body: item,
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  delete({ productId, color, size }: CartInput, userId?: string) {
    return this.fn
      .callFunction(`${this.endpoint}`, {
        method: 'DELETE',
        body: { productId, color, size, userId },
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  bulkCreate(items: CartInput[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: items,
    });
  }

  bulkDelete(ids: string[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }

  count() {
    return this.fn.callFunction<{ count: number | null }>(
      `${this.endpoint}/count`,
      {
        method: 'GET',
      }
    );
  }

  updateQuantity(item: CartInput & { userId?: string }) {
    return this.fn.callFunction(`${this.endpoint}/update-quantity`, {
      method: 'POST',
      body: item,
    });
  }

  addBundle(bundleId: string, userId?: string) {
    return this.fn
      .callFunction(`${this.endpoint}/bundle`, {
        method: 'POST',
        body: { bundleId, ...(userId ? { bundleId } : {}) },
      })
      .pipe(tap(() => this.updateCartCount()));
  }

  updateCartCount() {
    this.cartCount.reload();
  }
}
