import {
	HTTPStatusBadRequest,
	HTTPStatusSuccess,
} from '$lib/utils/consts';
import { error } from '@sveltejs/kit';
import { serverSideTranslate } from '$lib/i18n';
import validator from 'validator';

export const load = async (event) => {
	const token = event.url.searchParams.get('token');
	const email = event.url.searchParams.get('email');

	if (!token || !email || !validator.isEmail(email)) {
		return error(HTTPStatusBadRequest, {
			message: await serverSideTranslate('changePassword.invalidUrl', event)
		})
	}

	return {
		status: HTTPStatusSuccess,
		meta: {
			title: await serverSideTranslate('changePassword.title', event),
			description: 'Change your password by providing your new password',
		},
	};
};
