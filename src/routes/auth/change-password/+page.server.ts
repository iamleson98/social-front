import {  performServerSideGraphqlRequest } from '$lib/api/client';
import type { Mutation } from '$lib/gql/graphql';
import {
	HTTPStatusBadRequest,
	HTTPStatusServerError,
	HTTPStatusSuccess,
	type SocialResponse
} from '$lib/utils/consts';
import type { Actions } from '@sveltejs/kit';
import { tranFunc } from '$lib/i18n';
import { get } from 'svelte/store';
import { USER_SET_PASSWORD_MUTATION_STORE } from '$lib/api/auth';

export const load = async () => {
	return {
		status: HTTPStatusSuccess,
		meta: {
			title: get(tranFunc)('changePassword.title'),
			description: 'Change your password by providing your new password',
		},
	};
};

export const actions = {
	default: async function (event): Promise<SocialResponse<unknown>> {
		const formData = await event.request.formData();
		const password = formData.get('newPassword')?.toString();
		const confirmNewPassword = formData.get('confirmNewPassword')?.toString();

		if (!password || !confirmNewPassword) {
			return {
				status: HTTPStatusBadRequest,
				error: 'Please provide valid new passwords',
			};
		}

		if (password !== confirmNewPassword) {
			return {
				status: HTTPStatusBadRequest,
				error: "password and confirm password don't match.",
			};
		}

		const token = event.url.searchParams.get('token');
		const email = event.url.searchParams.get('email');
		if (!token || !email) {
			return {
				status: HTTPStatusBadRequest,
				error: 'Invalid url',
			};
		}

		const variables = {
			email,
			token,
			password,
		};
		const resetNewPasswordResult = await performServerSideGraphqlRequest<
			Pick<Mutation, 'setPassword'>
		>('mutation', USER_SET_PASSWORD_MUTATION_STORE, variables, event);
		if (resetNewPasswordResult.error) {
			return {
				status: HTTPStatusServerError,
				error: resetNewPasswordResult.error.message
			};
		}
		if (resetNewPasswordResult.data?.setPassword?.errors.length) {
			return {
				status: HTTPStatusBadRequest,
				error: resetNewPasswordResult.data.setPassword.errors[0].message as string
			};
		}

		return {
			status: HTTPStatusSuccess,
			data: `Password reset successfully. Redirecting to sign in page...`
		};
	}
} satisfies Actions;
