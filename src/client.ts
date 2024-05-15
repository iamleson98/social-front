import { HoudiniClient, isBrowser } from '$houdini';
import { accessTokenKey } from '$lib/stores/auth/store';
import { getCookieByKey } from '$lib/utils';

export default new HoudiniClient({
    url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
    fetchParams() {
        const headers: HeadersInit = {};
        if (isBrowser) {
            const tokenCookie = getCookieByKey(accessTokenKey);
            if (tokenCookie.length) {
                headers['Authorization'] = `Bearer ${tokenCookie}`;
            }
        }

        return {
            headers,
        };
    },
});
