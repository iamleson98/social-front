import { toast } from "svelte-sonner";
import { HTTPStatusSuccess } from "./consts";
import { AppRoute } from "./routes";
import { tranFunc } from "$i18n";
import { setUserStoreValue } from "$lib/stores/auth";
import { invalidateAll } from "$app/navigation";
import { get } from "svelte/store";


export const handleLogout = async () => {
  const result = await fetch(AppRoute.AUTH_SIGNOUT(), { method: 'POST' });
  const parsedResult = await result.json();

  if (parsedResult.status !== HTTPStatusSuccess) {
    toast.error(get(tranFunc)('error.errorOccured'));
    return;
  }

  setUserStoreValue(null);
  await invalidateAll();
};
