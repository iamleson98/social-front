import { writable } from "svelte/store";


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
