import { OrderStatus } from '../constants/order-status.enum';
import { Address } from './address.model';
import { Product } from './product.model';

export interface Order {
  id?: number; // ID of the order
  orderCode?: string; // Unique order code
  status?: OrderStatus; // Status of the order (e.g., pending, completed)
  note?: string; // Optional note for the order
  userNote?: string; // Note from the user
  totalPrice?: number; // Total price of the order
  createdAt?: string; // Timestamp of order creation
  address?: Address; // Address associated with the order
  items?: OrderItem[]; // Items in the order
}

export interface OrderItem {
  productId: number; // ID of the product in the order
  quantity: number; // Quantity of the product
  size?: string; // Size of the product (optional)
  color?: string; // Color of the product (optional)
  product?: Product; // Detailed product information
}
