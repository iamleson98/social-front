import { userStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { AppRoute, getCookieByKey } from '$lib/utils';
import { accessTokenKey } from '$lib/stores/auth/store';
import { queryUserStore } from '$lib/stores/api';
import { redirect, error } from '@sveltejs/kit';
import { HTTPStatusServerError, HTTPStatusTemporaryRedirect, } from '$lib/utils/types';
import type { User } from '$lib/gql/graphql';

// This code must run on client side only
export const ssr = false;
export const csr = true;
export const prerender = false;

export const load: PageLoad = async () => {
  let user = get(userStore);
  if (!user) {
    const tokenCookie = getCookieByKey(accessTokenKey);
    if (tokenCookie.length) {
      const userInfoData = await queryUserStore.fetch();

      if (userInfoData.errors?.length) {
        error(HTTPStatusServerError, { message: 'Error fetching user data. Please try again later.' });
      }

      user = userInfoData.data?.me as User;
    }
  }
  if (!user) {
    redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
  }

  return { user };
}
