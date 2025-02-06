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
  if (!browser) return '';

  const cookieSplit = document.cookie.split(';');
  const matchCookie = cookieSplit.find((cookie) => cookie.trim().startsWith(`${key}=`));
  if (!matchCookie) return '';

  return matchCookie.split('=')[1];
}

export const clientSideGetCookieOrDefault = (key: string, defaultValue: string = '') => {
  return getCookieByKey(key) || defaultValue;
};

export const clientSideSetCookie = (key: string, value: string, opts?: CookieSerializeOptions) => {
  if (!browser) return;

  let options = '';

  if (opts) {
    if (opts.expires) options += `; expires=${opts.expires.toUTCString()}`;
    if (opts.path) options += `; path=${opts.path}`;
    if (opts.domain) options += `; domain=${opts.domain}`;
    if (opts.secure) options += '; secure';
    if (opts.sameSite) options += `; SameSite=${opts.sameSite}`;
  }

  document.cookie = `${key}=${value}${options}`;
};
