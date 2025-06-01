import { Category } from './category.model';
import { PaginatedRequest } from './common/paginated-request';

export interface ProductQuery extends PaginatedRequest {
  categoryId?: number;
  categorySlug?: string; // Slug for category filtering
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Product {
  id: string; // UUID for the product
  createdAt?: string; // Timestamp of creation
  nameEn: string;
  nameAr: string;
  descriptionEn: string; // English description
  descriptionAr: string; // Arabic description
  // metas
  metaTitleEn?: string; // Meta title in English
  metaTitleAr?: string; // Meta title in Arabic
  metaDescriptionEn?: string; // Meta description in English
  metaDescriptionAr?: string; // Meta description in Arabic
  sku?: string;
  stars: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  quantity: number;
  thumbnail: string; // Main image
  images: string[]; // Additional images
  sizes?: string[]; // Available sizes
  colors?: { name: string; hex: string }[]; // Available colors with name and hex value
  categoryId: number;
  category?: Category;
  slug: string; // URL-friendly identifier
  slugAr: string; // URL-friendly identifier
  inspiredBy?: {
    nameEn: string; // English name of the original product
    nameAr: string; // Arabic name of the original product
    descriptionEn: string; // English description of the inspiration
    descriptionAr: string; // Arabic description of the inspiration
    image: string; // Image of the original product
  };
  inFavorites?: boolean; // Indicates if the product is in the user's favorites
  inCart?: boolean; // Indicates if the product is in the user's cart
  cartQuantity?: number; // Quantity of the product in the user's cart
}
