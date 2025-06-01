export interface User {
  id: string; // Added user ID field
  email: string; // Email address of the user
  firstName: string; // First name of the user
  lastName: string; // Last name of the user
  phone?: string; // Optional phone number
  avatar?: string; // Optional avatar URL
  createdAt?: string; // Timestamp of user creation
  updatedAt?: string; // Timestamp of last update
}
