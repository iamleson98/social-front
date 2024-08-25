import type { CookieSerializeOptions } from "cookie";

/**
 * @description you must call this function in client code.
 * Make sure your cookie is not `httpOnly`, otherwise you won't be able to access it from client side
 * 
 * @param key name of the cookie you want to get value
 * @returns cookie value. If cookie does not have provided key, returns empty string
 */
export function getCookieByKey(key: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const index = document.cookie.indexOf(`${key}=`);
  if (index < 0) {
    return '';
  }

  return document.cookie.slice(index + key.length + 1).split(';')[0];
}

export const clientSideGetCookieOrDefault = (key: string, defaultValue: string = '') => {
  if (typeof document === 'undefined') {
    throw new Error('This function must be called in client code');
  }

  return getCookieByKey(key) || defaultValue;
};

/**
 * @doc set cookie on client side
 * @param key cookie key
 * @param value cookie value
 * @param opts throw if opts.httpOnly is true. if maxAge === 0 => delete cookie
 */
export const clientSideSetCookie = (key: string, value: string, opts: CookieSerializeOptions) => {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in client code');
  }
  if (opts.httpOnly) {
    throw new Error('You cannot set httpOnly cookie from client side');
  }

  const cookieOptions = [];

  if (opts.path !== undefined) {
    cookieOptions.push(`path=${opts.path.trim()}`);
  }
  if (opts.secure) {
    cookieOptions.push('secure');
  }
  if (opts.maxAge !== undefined) {
    cookieOptions.push(`max-age=${opts.maxAge}`);
  }

  document.cookie = `${key}=${value}; ${cookieOptions.join('; ')}`;
};