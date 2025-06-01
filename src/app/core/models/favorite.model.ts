import { Product } from './product.model';

export interface Favorite {
  productId: number; // ID of the product being toggled
  product?: Product;
  userId?: string; // Optional user ID (if not authenticated)
  status?: 'added' | 'removed'; // Status of the favorite toggle
  createdAt?: string; // Timestamp of creation (if added)
  createdBy?: string; // Email of the user who created the favorite (if added)
}
