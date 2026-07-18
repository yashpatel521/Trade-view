export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  expiresAt: string; // ISO String
}

export interface AuthState {
  success?: boolean;
  error?: string;
  user?: {
    name: string;
    email: string;
    password?: string;
  };
}
