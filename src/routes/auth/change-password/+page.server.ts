import { HTTPStatusBadRequest, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import type { Actions } from "@sveltejs/kit";

export const actions = {
    request_password_reset: async function (event): Promise<SocialResponse<unknown>> {
        const formData = await event.request.formData();
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');

        if (!newPassword) {
            return {
                status: HTTPStatusBadRequest,
                error: "Please provide valid new password",
            };
        }

        if (!confirmNewPassword) {
            return {
                status: HTTPStatusBadRequest,
                error: "Please provide valid confirm new password",
            };
        }

        if (newPassword !== confirmNewPassword) {
            return {
                status: HTTPStatusBadRequest,
                error: "password and confirm password not matched.",
            };
        }

        return {
            status: HTTPStatusSuccess,
            data: `Successfully`
        };
    },
} satisfies Actions;

