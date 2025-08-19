
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
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonStr = new TextDecoder().decode(
    Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  );
  return JSON.parse(jsonStr);
};
