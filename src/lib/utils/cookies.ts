import { browser } from "$app/environment";
import type { CookieSerializeOptions } from "cookie";

/**
 * @description you must call this function in client code.
 * Make sure your cookie is not `httpOnly`, otherwise you won't be able to access it from client side
 * 
 * @param key name of the cookie you want to get value
 * @returns cookie value. If cookie does not have provided key, returns empty string
 */
export function getCookieByKey(key: string): string {
  if (!browser) {
    return '';
  }

  const cookieSplit = document.cookie.split(';');
  const matchCookie = cookieSplit.find((cookie) => cookie.trim().startsWith(`${key}=`));
  if (!matchCookie)
    return '';

  return matchCookie.split('=')[1];
}

export const clientSideGetCookieOrDefault = (key: string, defaultValue: string = '') => {
  if (!browser) {
    return '';
  }

  return getCookieByKey(key) || defaultValue;
};

/**
 * @doc set cookie on client side
 * @param key cookie key
 * @param value cookie value
 * @param opts throw if opts.httpOnly is true. if maxAge === 0 => delete cookie
 */
export const clientSideSetCookie = async (key: string, value: string, opts: CookieSerializeOptions) => {
  if (!browser) {
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

export const clientSideDeleteCookie = (key: string) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
}
