import { cookieOpts } from "$lib/client";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusBadRequest, HTTPStatusSuccess, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";


export const POST = async (evt: RequestEvent) => {
  if (!evt.cookies.get(ACCESS_TOKEN_KEY))
    return json({
      status: HTTPStatusBadRequest,
    });

  evt.cookies.delete(ACCESS_TOKEN_KEY, cookieOpts);
  evt.cookies.delete(REFRESH_TOKEN_KEY, cookieOpts);
  evt.cookies.delete(CSRF_TOKEN_KEY, cookieOpts);

  return json({
    status: HTTPStatusSuccess,
  })
};
