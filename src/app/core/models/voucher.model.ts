export interface Voucher {
  id?: string;
  voucherCode: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface CreateVoucherRequest {
  voucherCode?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  notes?: string;
}

export interface UpdateVoucherRequest {
  id?: string;
  voucherCode?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  notes?: string;
}

export interface VoucherFilters {
  page?: number;
  pageSize?: number;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  voucherCode?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VouchersResponse {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    filters: VoucherFilters;
  };
  data: Voucher[];
}

export interface BulkCreateVouchersRequest {
  vouchers: CreateVoucherRequest[];
}

export interface BulkDeleteVouchersRequest {
  voucherIds?: string[];
  voucherCodes?: string[];
}
