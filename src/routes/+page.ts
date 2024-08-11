import type { Load } from "@sveltejs/kit";


export const load: Load = async () => {
  return {
    meta: {
      title: 'Sitename',
      description: 'Sitename web interface',
    }
  };
};
