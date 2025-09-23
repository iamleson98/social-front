import { serverSideTranslate } from '$lib/i18n';
import { HTTPStatusSuccess } from '$lib/utils/consts';

export const load = async (event) => {
	return {
		status: HTTPStatusSuccess,
		meta: {
			title: await serverSideTranslate(event, 'resetPassword.title'),
			description: 'Reset your password by providing your email address',
		},
	};
};
