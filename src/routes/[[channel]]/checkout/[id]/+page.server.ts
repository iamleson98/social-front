import { serverSideTranslate } from '$lib/i18n';

export const load = async (event) => {
    return {
        meta: {
            title: await serverSideTranslate(event, 'pages.checkout'),
        },
    };
};
