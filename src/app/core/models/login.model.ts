export interface LoginRequest {
  identifier: string; // User's email address or phone
  password: string; // User's password
}

export interface LoginResponse {
  token: string; // Access token for the session
  user: {
    id: string; // User's unique identifier
    email: string; // User's email address
    [key: string]: any; // Additional user properties
  };
}
