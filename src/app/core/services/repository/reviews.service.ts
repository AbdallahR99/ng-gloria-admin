import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { Review, RatingDistribution } from '@app/core/models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'reviews';

  get(slug: string) {
    return this.fn.callFunction<Review[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: { slug },
    });
  }
  getRatingDistribution(slug: string) {
    return this.fn.callFunction<RatingDistribution>(
      `${this.endpoint}/rating-distribution`,
      {
        method: 'GET',
        queryParams: { slug },
      }
    );
  }

  create(review: Partial<Review>) {
    return this.fn.callFunction<Review>(`${this.endpoint}`, {
      method: 'POST',
      body: review,
    });
  }

  update(review: Partial<Review>) {
    return this.fn.callFunction<Review>(`${this.endpoint}`, {
      method: 'PUT',
      body: review,
    });
  }

  delete(id: string) {
    return this.fn.callFunction(`${this.endpoint}`, {
      method: 'DELETE',
      body: { id },
    });
  }

  bulkCreate(reviews: Partial<Review>[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: reviews,
    });
  }

  bulkDelete(ids: string[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }
}
