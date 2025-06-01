import { Product } from './product.model';

export interface Bundle {
  productId?: number; // ID of the main product
  bundleName?: string; // Name of the bundle
  items?: number[]; // Array of product IDs in the bundle
  bundles?: Product[]; // Array of product bundles
  price?: number; // Current price of the bundle
  oldPrice?: number; // Old price of the bundle (optional)
  isActive?: boolean; // Whether the bundle is active
  id?: string; // ID of the created bundle
  createdAt?: string; // Timestamp of creation
  updatedAt?: string; // Timestamp of last update
  createdBy?: string; // Email of the user who created the bundle
  updatedBy?: string; // Email of the user who last updated the bundle
  isDeleted?: boolean; // Whether the bundle is deleted
  inCart?: boolean; // Whether the bundle is in the cart
}
