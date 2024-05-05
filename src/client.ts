import { HoudiniClient } from '$houdini';
import { accessTokenKey } from '$lib/stores/auth/store';
import { getCookieByKey } from '$lib/utils';

export default new HoudiniClient({
    url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
    fetchParams() {
        return {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookieByKey(accessTokenKey)}`,
            }
        }
    },
});
