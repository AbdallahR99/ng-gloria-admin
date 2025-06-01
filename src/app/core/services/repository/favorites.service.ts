import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { Favorite } from '@app/core/models/favorite.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'favorites';

  toggle(productId: string, userId?: string) {
    return this.fn.callFunction<Favorite>(`${this.endpoint}/toggle`, {
      method: 'POST',
      body: { productId, userId },
    });
  }

  get(userId?: string) {
    return this.fn.callFunction<Favorite[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: userId ? { user_id: userId } : undefined,
    });
  }

  manage(body: {
    productId: number;
    userId: string;
    action: 'add' | 'remove';
  }) {
    return this.fn.callFunction(`${this.endpoint}/manage`, {
      method: 'POST',
      body,
    });
  }

  create(favorite: Partial<Favorite>) {
    return this.fn.callFunction(`${this.endpoint}`, {
      method: 'POST',
      body: favorite,
    });
  }

  update(favorite: Partial<Favorite>) {
    return this.fn.callFunction(`${this.endpoint}`, {
      method: 'PUT',
      body: favorite,
    });
  }

  delete(favorite: Pick<Favorite, 'productId' | 'userId'>) {
    return this.fn.callFunction(`${this.endpoint}`, {
      method: 'DELETE',
      body: favorite,
    });
  }

  bulkCreate(favorites: Partial<Favorite>[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: favorites,
    });
  }

  bulkDelete(ids: number[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }
}
