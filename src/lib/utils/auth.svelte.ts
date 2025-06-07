import { toast } from "svelte-sonner";
import { HTTPStatusSuccess } from "./consts";
import { AppRoute } from "./routes";
import { setUserStoreValue } from "$lib/stores/auth";
import { invalidateAll } from "$app/navigation";


export const handleLogout = async (translationFunc: (key: string, args?: Record<string, unknown>) => string) => {
  const result = await fetch(AppRoute.AUTH_SIGNOUT(), { method: 'POST' });
  const parsedResult = await result.json();

  if (parsedResult.status !== HTTPStatusSuccess) {
    toast.error(translationFunc('error.errorOccured'));
    return;
  }

  setUserStoreValue(null);
  await invalidateAll();
};
