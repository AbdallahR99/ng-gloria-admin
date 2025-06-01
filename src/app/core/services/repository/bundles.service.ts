import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { Bundle } from '@app/core/models/bundle.model';

@Injectable({ providedIn: 'root' })
export class BundlesService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'bundles';

  getByProductSlug(slug: string) {
    return this.fn.callFunction<Bundle>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: { slug },
    });
  }

  create(bundle: Partial<Bundle>) {
    return this.fn.callFunction<Bundle>(`${this.endpoint}`, {
      method: 'POST',
      body: bundle,
    });
  }

  update(bundle: Partial<Bundle>) {
    return this.fn.callFunction<Bundle>(`${this.endpoint}`, {
      method: 'PUT',
      body: bundle,
    });
  }

  delete(id: number) {
    return this.fn.callFunction<Bundle>(`${this.endpoint}`, {
      method: 'DELETE',
      body: { id },
    });
  }

  bulkCreate(bundles: Partial<Bundle>[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: bundles,
    });
  }

  bulkDelete(ids: number[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: ids,
    });
  }
}
