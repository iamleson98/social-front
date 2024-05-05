import { isBrowser } from "$houdini";

export function getCookieByKey(key: string): string {
  if (!isBrowser) {
    return '';
  }

  const index = document.cookie.indexOf(`${key}=`);
  if (index < 0) {
    return '';
  }

  return document.cookie.slice(index + key.length + 1).split(';')[0];
}
