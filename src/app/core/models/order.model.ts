import { OrderStatus } from '../constants/order-status.enum';
import { Address } from './address.model';
import { PaginatedRequest } from './common/paginated-request';
import { Product } from './product.model';

export interface OrderQuery extends PaginatedRequest<Order> {
  userId?: string; // ID of the user who placed the order
  status?: OrderStatus; // Status of the order (e.g., pending, completed)
  fromDate?: string; // Start date for filtering orders
  toDate?: string; // End date for filtering orders
  showDeleted?: boolean; // Whether to include deleted orders
  addressId?: string; // ID of the address associated with the order
}

export interface OrderStatusUpdate extends Pick<OrderCreateOrUpdate, 'status' | 'note' | 'userNote' | 'userId' | 'id' | 'orderCode'> {

}

export interface OrderCheckoutDirect extends OrderCheckout {
  productId: string; // ID of the product to be ordered
  quantity?: number; // Quantity of the product to be ordered
  size?: string | null; // Size of the product (optional)
  color?: string | null; // Color of the product (optional)
}

export interface OrderCheckout extends Omit<OrderCreateOrUpdate, 'items' | 'id' | 'status' | 'note'> {

}

export interface OrderCreateOrUpdate extends Omit<Order, 'createdAt' | 'address' | 'totalPrice'> {

}

export interface Order {
  id?: string; // ID of the order
  orderCode?: string; // Unique order code
  status?: OrderStatus; // Status of the order (e.g., pending, completed)
  note?: string; // Optional note for the order
  userNote?: string; // Note from the user
  totalPrice?: number; // Total price of the order
  createdAt?: string; // Timestamp of order creation
  address?: Address; // Address associated with the order
  addressId?: string; // ID of the address associated with the order
  items?: OrderItem[]; // Items in the order
  userId?: string; // ID of the user who placed the order
}

export interface OrderItem {
  productId: number; // ID of the product in the order
  quantity: number; // Quantity of the product
  size?: string; // Size of the product (optional)
  color?: string; // Color of the product (optional)
  product?: Product; // Detailed product information
}
