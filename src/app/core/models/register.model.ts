export interface RegisterRequest {
  email: string; // User's email address
  password: string; // User's password
  firstName: string; // User's first name
  lastName: string; // User's last name
  phone?: string; // User's phone number (optional)
}

export interface RegisterResponse {
  message: string; // Success message
}
