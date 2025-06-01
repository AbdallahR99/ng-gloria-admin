import { Product } from './product.model';

export interface CartItem {
  id: string; // Unique identifier for the cart item
  userId?: string; // UUID of the user
  productId: string; // UUID of the product
  quantity: number; // Quantity of the product
  size?: string; // Size of the product (optional)
  color?: string; // Color of the product (optional)
  nameEn: string; // Product name in English
  nameAr: string; // Product name in Arabic
  descriptionEn: string; // Product description in English
  descriptionAr: string; // Product description in Arabic
  price: number; // Price of the product
  oldPrice: number; // Previous price of the product (if any)
  stars: number; // Rating of the product in stars
  reviews: number; // Number of reviews for the product
  thumbnail: string; // URL of the product thumbnail image
  slug: string; // URL slug for the product
  slugAr: string; // URL slug for the product in Arabic
  status?: 'added' | 'updated'; // Status of the cart operation
  product?: Product; // Detailed product information
  createdAt?: string; // Timestamp of creation
  updatedAt?: string; // Timestamp of last update
  createdBy?: string; // UUID of the user who created the cart entry
  updatedBy?: string; // UUID of the user who last updated the cart entry
}
