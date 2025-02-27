import { cookieOpts } from "$lib/api/client.js";
import { AppRoute } from "$lib/utils";
import { CHANNELS, DEFAULT_CHANNEL } from "$lib/utils/channels";
import { CHANNEL_KEY, HTTPStatusPermanentRedirect } from "$lib/utils/consts";
import {
  redirect
} from "@sveltejs/kit";


export const load = async ({ params, cookies }) => {
  if (!params.channel) {
    params.channel = DEFAULT_CHANNEL.slug;
  } else {
    if (!CHANNELS.some(chan => chan.slug === params.channel)) {
      params.channel = DEFAULT_CHANNEL.slug;
      redirect(HTTPStatusPermanentRedirect, AppRoute.HOME());
    }
  }

  cookies.set(CHANNEL_KEY, params.channel, { ...cookieOpts });

  return {
    meta: {
      title: 'Sitename',
      description: 'Sitename web interface',
    }
  };
};
