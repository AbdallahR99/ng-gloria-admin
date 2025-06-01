import { inject, Injectable } from '@angular/core';
import { SupabaseFunctionsService } from './supabase-functions.service';
import {
  Invoice,
  InvoicesResponse,
  InvoiceFilters,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateInvoiceFromOrderRequest,
  BulkCreateInvoicesRequest,
  BulkDeleteInvoicesRequest,
} from '@app/core/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly fn = inject(SupabaseFunctionsService);
  private readonly endpoint = 'invoices';
  /**
   * Get invoice by ID
   */
  getById(invoiceId: string) {
    return this.fn.callFunction<Invoice>(`${this.endpoint}`, {
      method: 'GET',
      queryParams: {
        invoiceId,
      },
    });
  }

  /**
   * Get invoice by invoice code
   */
  getByCode(invoiceCode: string) {
    return this.fn.callFunction<Invoice>(
      `${this.endpoint}/code/${invoiceCode}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * List invoices with filters
   */
  list(filters?: InvoiceFilters) {
    return this.fn.callFunction<InvoicesResponse>(`${this.endpoint}/filter`, {
      method: 'POST',
      body: filters || {},
    });
  }

  /**
   * Create a new invoice
   */
  create(payload: CreateInvoiceRequest) {
    return this.fn.callFunction<{
      message: string;
      invoice: Invoice;
      invoiceCode: string;
    }>(`${this.endpoint}`, {
      method: 'POST',
      body: payload,
    });
  }
  /**
   * Update an existing invoice
   */
  update(payload: UpdateInvoiceRequest) {
    return this.fn.callFunction<{
      message: string;
      invoice: Invoice;
      updatedFields: string[];
    }>(`${this.endpoint}`, {
      method: 'PUT',
      body: payload,
    });
  }
  /**
   * Delete an invoice
   */
  delete(invoiceId?: string, invoiceCode?: string) {
    const body: any = {};
    if (invoiceId) body.invoiceId = invoiceId;
    if (invoiceCode) body.invoiceCode = invoiceCode;

    return this.fn.callFunction<{ message: string }>(`${this.endpoint}`, {
      method: 'DELETE',
      body,
    });
  }

  /**
   * Create invoice from existing order
   */
  createFromOrder(payload: CreateInvoiceFromOrderRequest) {
    return this.fn.callFunction<{ message: string; invoice: Invoice }>(
      `${this.endpoint}/from-order`,
      {
        method: 'POST',
        body: payload,
      }
    );
  }
  /**
   * Bulk create invoices
   */
  bulkCreate(payload: BulkCreateInvoicesRequest) {
    return this.fn.callFunction<{
      message: string;
      createdCount: number;
      invoices: Invoice[];
    }>(`${this.endpoint}/bulk`, {
      method: 'POST',
      body: payload,
    });
  }
  /**
   * Bulk delete invoices
   */
  bulkDelete(payload: BulkDeleteInvoicesRequest) {
    return this.fn.callFunction<{
      message: string;
      deletedCount: number;
    }>(`${this.endpoint}/bulk`, {
      method: 'DELETE',
      body: payload,
    });
  }
}
