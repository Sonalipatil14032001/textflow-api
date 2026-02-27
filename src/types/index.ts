export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'user' | 'admin' | 'enterprise';
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}