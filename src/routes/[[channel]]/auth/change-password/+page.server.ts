import {
	HTTPStatusBadRequest,
	HTTPStatusSuccess,
} from '$lib/utils/consts';
import { error } from '@sveltejs/kit';
import { tranFunc } from '$lib/i18n';
import { get } from 'svelte/store';
import validator from 'validator';

export const load = async (event) => {
	const token = event.url.searchParams.get('token');
	const email = event.url.searchParams.get('email');

	if (!token || !email || !validator.isEmail(email)) {
		return error(HTTPStatusBadRequest, {
			message: get(tranFunc)('changePassword.invalidUrl')
		})
	}

	return {
		status: HTTPStatusSuccess,
		meta: {
			title: get(tranFunc)('changePassword.title'),
			description: 'Change your password by providing your new password',
		},
	};
};
