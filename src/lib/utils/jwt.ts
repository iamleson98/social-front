import jwt from 'jsonwebtoken';

export type JsonWebToken = {
  iat: number;
  owner: string;
  iss: string;
  exp: number;
  token: string;
  email: string;
  type: string;
  user_id: string;
  is_staff: boolean;
};

export const decodeJWT = (token: string): JsonWebToken => {
  return jwt.decode(token) as JsonWebToken;
};
