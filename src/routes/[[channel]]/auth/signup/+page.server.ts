import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { serverSideTranslate } from "$lib/i18n";


export const load = async (event) => {
  // If user is logged in but unexpectedly navigate to the signup page, 
  // We must remove the cookie
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
    event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/' });
    event.cookies.delete(CSRF_TOKEN_KEY, { path: '/' });
  }

  return {
    meta: {
      title: await serverSideTranslate(event, 'signup.title'),
      description: "Sign up to create an account on our platform",
    },
  };
}
