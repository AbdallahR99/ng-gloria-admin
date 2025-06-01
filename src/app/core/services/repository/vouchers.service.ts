import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import {
  Voucher,
  VouchersResponse,
  VoucherFilters,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  BulkCreateVouchersRequest,
  BulkDeleteVouchersRequest,
} from '@app/core/models/voucher.model';

@Injectable({ providedIn: 'root' })
export class VouchersService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'vouchers';

  /**
   * Get voucher by ID
   */
  getById(voucherId: string) {
    return this.fn.callFunction<Voucher>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: {
        voucherId,
      },
    });
  }

  /**
   * Get voucher by voucher code
   */
  getByCode(voucherCode: string) {
    return this.fn.callFunction<Voucher>(
      `${this.endpoint}/code/${voucherCode}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * List vouchers with filters
   */
  list(filters?: VoucherFilters) {
    return this.fn.callFunction<VouchersResponse>(`${this.endpoint}/filter`, {
      method: 'POST',
      body: filters || {},
    });
  }

  /**
   * Create a new voucher
   */
  create(payload: CreateVoucherRequest) {
    return this.fn.callFunction<{
      message: string;
      voucher: Voucher;
      voucherCode: string;
    }>(`${this.endpoint}`, {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Update an existing voucher
   */
  update(payload: UpdateVoucherRequest) {
    return this.fn.callFunction<{
      message: string;
      voucher: Voucher;
      updatedFields: string[];
    }>(`${this.endpoint}`, {
      method: 'PUT',
      body: payload,
    });
  }

  /**
   * Delete a voucher
   */
  delete(voucherId?: string, voucherCode?: string) {
    const body: any = {};
    if (voucherId) body.voucherId = voucherId;
    if (voucherCode) body.voucherCode = voucherCode;

    return this.fn.callFunction<{ message: string }>(`${this.endpoint}`, {
      method: 'DELETE',
      body,
    });
  }

  /**
   * Bulk create vouchers
   */
  bulkCreate(payload: BulkCreateVouchersRequest) {
    return this.fn.callFunction<{
      message: string;
      createdCount: number;
      vouchers: Voucher[];
    }>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Bulk delete vouchers
   */
  bulkDelete(payload: BulkDeleteVouchersRequest) {
    return this.fn.callFunction<{
      message: string;
      deletedCount: number;
    }>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: payload,
    });
  }
}
