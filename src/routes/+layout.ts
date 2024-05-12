import { userStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { AppRoute, getCookieByKey } from '$lib/utils';
import { accessTokenKey } from '$lib/stores/auth/store';
import { queryUserStore } from '$lib/stores/api';
import { redirect, error } from '@sveltejs/kit';
import { HTTPStatusServerError, } from '$lib/utils/types';
import type { User } from '$lib/gql/graphql';

// This code must run on client side only
export const ssr = false;

export const load: PageLoad = async () => {
  const user = get(userStore);
  if (!user) {
    const tokenCookie = getCookieByKey(accessTokenKey);
    if (tokenCookie.length) {
      const userInfoData = await queryUserStore.fetch();

      if (userInfoData.errors?.length) {
        return error(HTTPStatusServerError, { message: 'Error fetching user data. Please try again later.' });
        // userInfoData.errors.forEach(item => {
        //   console.error(item.message);
        // });
        // redirect(307, AppRoute.AUTH_SIGNIN);
      }

      userStore.set(userInfoData.data?.me as User);
      return { user: userInfoData.data?.me as User };
    }

    redirect(307, AppRoute.AUTH_SIGNIN);
  }
}
