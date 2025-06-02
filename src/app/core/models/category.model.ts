import { PaginatedRequest } from './common/paginated-request';

export interface CategoryQuery extends PaginatedRequest<Category> {}

export interface Category {
  id?: string;
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  slugAr?: string;
  image?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CategoryCreateOrUpdate {
  id?: string;
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  slugAr?: string;
  imageFile?: string; // base64 image
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
}
