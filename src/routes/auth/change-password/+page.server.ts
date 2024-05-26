import type { SetPassword$input } from "$houdini";
import { USER_SET_PASSWORD_MUTATION_STORE } from "$lib/stores/api/auth";
import { HTTPStatusBadRequest, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import type { Actions } from "@sveltejs/kit";

// export const csr = false;

export const actions = {
	default: async function (event): Promise<SocialResponse<unknown>> {
		const formData = await event.request.formData();
		const password = formData.get('newPassword');
		const confirmNewPassword = formData.get('confirmNewPassword');

		if (!password || !confirmNewPassword) {
			return {
				status: HTTPStatusBadRequest,
				error: "Please provide valid new passwords",
			};
		}

		if (password !== confirmNewPassword) {
			return {
				status: HTTPStatusBadRequest,
				error: "password and confirm password not matched.",
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

		const variables: SetPassword$input = {
			email,
			token,
			password: password.toString(),
		};
		const resetNewPasswordResult = await USER_SET_PASSWORD_MUTATION_STORE.mutate(variables, { event });
		if (resetNewPasswordResult.errors?.length) {
			return {
				status: HTTPStatusBadRequest,
				error: resetNewPasswordResult.errors[0].message,
			};
		}

		return {
			status: HTTPStatusSuccess,
			data: `Password reset successfully. Redirecting to sign in page...`,
		};
	},
} satisfies Actions;

