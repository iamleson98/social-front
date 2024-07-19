import { writable } from "svelte/store";

export const ACCESS_TOKEN_KEY = "sitename_token";
export const CSRF_TOKEN_KEY = "sitename_csrf";
export const REFRESH_TOKEN_KEY = "sitename_refresh";
export const CHANNEL_KEY = "channel";

export function createAccessTokenStore(initValue: string | null = null) {
  const { subscribe, set } = writable<string | null>(initValue);

  return {
    subscribe,
    setAccessToken: (accessToken: string) => {
      set(accessToken);
    },
    removeAccessToken: () => {
      set(null);
    },
  };
};
