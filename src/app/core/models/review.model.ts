export interface Review {
  productId: string; // UUID of the product being reviewed
  rating: number; // Rating given to the product
  comment?: string | null; // Optional comment for the review
  images?: string[] | null; // Optional array of uploaded image filenames
  userId?: string | null; // UUID of the user who created the review
  id?: string | null; // UUID of the created review
  createdAt?: string | null; // Timestamp of creation
  updatedAt?: string | null; // Timestamp of last update
  createdBy?: string | null; // UUID of the user who created the review
  updatedBy?: string | null; // UUID of the user who last updated the review
  isDeleted?: boolean | null; // Whether the review is deleted
  userName?: string | null; // Name of the user who created the review
  userAvatar?: string | null; // Avatar of the user who created the review
  email?: string | null; // Email of the user who created the review
  firstName?: string | null; // First name of the user who created the review
  lastName?: string | null; // Last name of the user who created the review
}

export interface RatingDistribution {
  slug: string; // Product slug
  totalReviews: number; // Total number of reviews
  averageRating: number; // Average rating score
  distribution: {
    [key: string]: {
      count: number; // Number of reviews for this rating
      percentage: number; // Percentage of reviews for this rating
    };
  };
  breakdown: {
    stars: number; // Star rating (1-5)
    count: number; // Number of reviews with this rating
    percentage: number; // Percentage of reviews with this rating
  }[];
}
