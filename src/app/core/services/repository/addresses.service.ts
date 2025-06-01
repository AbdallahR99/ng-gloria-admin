import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import { PaginatedResponse } from '@app/core/models/common/paginated-response.model';
import { Address } from '@app/core/models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressesService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'addresses';

  get(addressId: string) {
    return this.fn.callFunction<Address>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: { addressId },
    });
  }
  getAll(userId?: string) {
    return this.fn.callFunction<Address[]>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: userId ? { userId } : undefined,
    });
  }

  create(address: Partial<Address>) {
    return this.fn.callFunction<Address>(`${this.endpoint}`, {
      method: 'POST',
      body: address,
    });
  }

  update(address: Partial<Address>) {
    return this.fn.callFunction<Address>(`${this.endpoint}`, {
      method: 'PUT',
      body: address,
    });
  }

  delete(addressId: string) {
    return this.fn.callFunction<Address>(`${this.endpoint}`, {
      method: 'DELETE',
      body: { addressId },
    });
  }

  setDefault(addressId: string, userId?: string) {
    return this.fn.callFunction<Address>(`${this.endpoint}/set-default`, {
      method: 'POST',
      body: { addressId, ...(userId ? { userId } : {}) },
    });
  }

  bulkCreate(addresses: Partial<Address>[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: addresses,
    });
  }

  bulkDelete(addressIds: string[]) {
    return this.fn.callFunction(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: addressIds,
    });
  }
}
