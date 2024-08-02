import { HTTPStatusSuccess } from "$lib/utils/consts";
import type { Load } from "@sveltejs/kit";


export const load: Load = async () => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: 'Sitename',
      description: 'Sitename web interface',
    }
  };
};
