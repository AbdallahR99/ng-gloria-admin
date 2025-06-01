import { Category } from './category.model';
import { PaginatedRequest } from './common/paginated-request';

export interface ProductQuery extends PaginatedRequest {
  categoryId?: string;
  categorySlug?: string; // Slug for category filtering
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  size?: string;
  color?: string;
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
  inspiredById?: string; // ID of the product that this product is inspired by
  isBanned?: boolean; // Indicates if the product is banned
  isDeleted?: boolean; // Indicates if the product is deleted
  keywords?: string[]; // Keywords for search optimization
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

export interface ProductCreateOrUpdate extends Product {
  imagesFiles?: string[]; // Array of image file paths for upload
  thumbnailFile?: string; // Path to the thumbnail image file for upload
  categorySlug?: string; // Slug for category filtering
}
