/**
 * @description you must call this function in client code
 * 
 * @param key name of the cookie you want to get value
 * @returns cookie value. If cookie does not have provided key, returns empty string
 */
export function getCookieByKey(key: string): string {
  if (!document) {
    return '';
  }

  const index = document.cookie.indexOf(`${key}=`);
  if (index < 0) {
    return '';
  }

  return document.cookie.slice(index + key.length + 1).split(';')[0];
}