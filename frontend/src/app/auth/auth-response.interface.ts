export interface AuthResponse {
    token: string;
    refreshToken?: string;
    username?: string;
    roles?: string[];
    message?: string;
    expiresIn?: number;
  }