export interface Category {
  id: string; // UUID for the category
  nameEn: string;
  nameAr: string;
  slug: string;
  image: string;
  metaTitleEn?: string; // Meta title in English
  metaTitleAr?: string; // Meta title in Arabic
  metaDescriptionEn?: string; // Meta description in English
  metaDescriptionAr?: string; // Meta description in Arabic
}
