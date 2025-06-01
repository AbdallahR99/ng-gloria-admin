export interface InvoiceProduct {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  oldPrice?: number;
}

export interface Invoice {
  id?: string;
  invoiceCode: string;
  orderCode?: string;
  subtotal?: number;
  discount?: number;
  deliveryFees?: number;
  totalPrice: number;
  products: InvoiceProduct[];
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  userAddress?: string;
  reviews?: number;
  notes?: string;
  userNotes?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface CreateInvoiceRequest {
  invoiceCode?: string;
  subtotal?: number;
  discount?: number;
  deliveryFees?: number;
  totalPrice: number;
  products: InvoiceProduct[];
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  userAddress?: string;
  notes?: string;
  userNotes?: string;
  reviews?: number;
}

export interface UpdateInvoiceRequest {
  id?: string;
  invoiceCode?: string;
  subtotal?: number;
  discount?: number;
  deliveryFees?: number;
  totalPrice?: number;
  products?: InvoiceProduct[];
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  userAddress?: string;
  notes?: string;
  userNotes?: string;
  reviews?: number;
}

export interface InvoiceFilters {
  page?: number;
  pageSize?: number;
  userEmail?: string;
  invoiceCode?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoicesResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Invoice[];
  filters: InvoiceFilters;
}

export interface CreateInvoiceFromOrderRequest {
  orderId?: string;
  orderCode?: string;
  notes?: string;
  userNotes?: string;
}

export interface BulkCreateInvoicesRequest {
  invoices: CreateInvoiceRequest[];
}

export interface BulkDeleteInvoicesRequest {
  invoiceIds?: string[];
  invoiceCodes?: string[];
}
