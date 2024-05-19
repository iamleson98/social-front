import { HoudiniClient } from '$houdini';
import { ACCESS_TOKEN_KEY } from '$lib/stores/auth/store';
import { getCookieByKey } from '$lib/utils';

export default new HoudiniClient({
    url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
    fetchParams() {
        const headers: HeadersInit = {};
        const tokenCookie = getCookieByKey(ACCESS_TOKEN_KEY);
        if (tokenCookie.length) {
            headers['Authorization'] = `Bearer ${tokenCookie}`;
        }

        return {
            headers,
        };
    },
});
