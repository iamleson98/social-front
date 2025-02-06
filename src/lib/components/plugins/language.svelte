<script lang="ts">
	import { languageSupportInfer, switchLanguage, type LanguageCode } from '$i18n';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { getCookieByKey } from '$lib/utils';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { clientSideSetCookie } from '$lib/utils/cookies';
	import { onMount } from 'svelte';

	onMount(() => {
		// 1) check cookie
		let languageCode = getCookieByKey(LANGUAGE_KEY);

		// 2) check navigator
		if (!languageCode && typeof navigator !== 'undefined') {
			languageCode = navigator.language;
		}

		let code = languageSupportInfer(languageCode as LanguageCode);
		if (code === null) {
			code = LanguageCodeEnum.En;
		}

		switchLanguage(code);
		clientSideSetCookie(LANGUAGE_KEY, code, {
			expires: new Date(3000, 1, 1),
			secure: true,
			sameSite: 'lax'
		});

		return userStore.subscribe((user) => {
			if (user?.languageCode) {
				const code = languageSupportInfer(user.languageCode);
				if (code) {
					switchLanguage(code);
					clientSideSetCookie(LANGUAGE_KEY, code, {
						expires: new Date(2100, 1, 1),
						secure: true,
						sameSite: 'lax'
					});
				}
			}
		});
	});
</script>
