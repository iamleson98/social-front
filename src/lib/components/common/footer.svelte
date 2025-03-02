<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import { Facebook, Instagram, Twitter } from '../icons/SvgOuterIcon';
	import { SUPPORTED_LANGUAGES, switchTranslationLanguage } from '$i18n';
	import { DropDown, MenuItem, type DropdownTriggerInterface } from '../ui/Dropdown';
	import { Button } from '../ui';
	import { clientSideGetCookieOrDefault, clientSideSetCookie } from '$lib/utils/cookies';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { buildHomePageLink } from '$lib/utils/utils';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';

	let activeLanguage = $state(SUPPORTED_LANGUAGES[0]);

	const setLanguageByCode = (idx: number) => {
		activeLanguage = SUPPORTED_LANGUAGES[idx];
		switchTranslationLanguage(activeLanguage.code);
		clientSideSetCookie(LANGUAGE_KEY, activeLanguage.code, {
			secure: true,
			path: '/',
			expires: new Date(3000, 1, 1),
			sameSite: 'lax'
		});
	};

	onMount(async () => {
		const cookieLang = clientSideGetCookieOrDefault(
			LANGUAGE_KEY,
			LanguageCodeEnum.En
		).toUpperCase();
		const supportedLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === cookieLang);
		if (supportedLang) {
			activeLanguage = supportedLang;
			switchTranslationLanguage(activeLanguage.code);
		}
	});
</script>

<footer class="p-6 max-w-6xl mx-auto">
	<div class="mx-auto max-w-[theme(screens.xl)]">
		<div class="md:flex md:justify-between">
			<div class="mb-6 md:mb-0">
				<a href={buildHomePageLink()} class="flex items-center">
					<img src="/logo.png" class="mr-3 h-8" alt="FlowBite Logo" />
				</a>
			</div>
			<div class="grid grid-cols-4 gap-4 tablet:grid-cols-2">
				<!-- resources -->
				<div>
					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Resources</h2>
					<ul class="text-gray-600">
						<li class="mb-4">
							<a href={AppRoute.HOME()} class="hover:underline">Sitename</a>
						</li>
						<li>
							<a href="https://tailwindcss.com/" class="hover:underline">Tailwind CSS</a>
						</li>
					</ul>
				</div>
				<!-- social media -->
				<div>
					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Follow us</h2>
					<ul class="text-gray-600">
						<li class="mb-4">
							<a
								href="https://www.facebook.com/profile.php?id=61572273849445"
								target="_blank"
								class="hover:underline">Facebook</a
							>
						</li>
						<li>
							<a href="https://discord.gg/4eeurUVvTy" class="hover:underline">Youtube</a>
						</li>
					</ul>
				</div>

				<div>
					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Legal</h2>
					<ul class="text-gray-600">
						<li class="mb-4">
							<a href="/" class="hover:underline">Privacy Policy</a>
						</li>
						<li>
							<a href="/" class="hover:underline">Terms &amp; Conditions</a>
						</li>
					</ul>
				</div>

				{#if !$READ_ONLY_USER_STORE}
					<div>
						<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Language</h2>
						{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
							<Button {onclick} {onfocus} size="xs" variant="outline">
								<activeLanguage.icon />
								{activeLanguage.name}
							</Button>
						{/snippet}
						<DropDown {trigger} placement="bottom-end">
							{#each SUPPORTED_LANGUAGES as language, idx (idx)}
								<MenuItem onclick={() => setLanguageByCode(idx)}>
									<div class="flex items-center gap-2">
										<language.icon />
										<span class="text-nowrap">{language.name}</span>
									</div>
								</MenuItem>
							{/each}
						</DropDown>
					</div>
				{/if}
			</div>
		</div>
		<hr class="my-6 border-gray-200 sm:mx-auto lg:my-8" />
		<div class="sm:flex sm:items-center sm:justify-between">
			<span class="text-sm text-gray-500 text-right">
				© 2024 - now <a href="/" class="hover:underline">Sitename™</a>. All Rights Reserved.
			</span>
			<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
				<a
					href="https://www.facebook.com/profile.php?id=61572273849445"
					target="_blank"
					aria-label="Facebook"
					class="text-gray-500 hover:text-gray-900"
				>
					<Facebook />
				</a>
				<a href="/" aria-label="Instagram" class="text-gray-500 hover:text-gray-900">
					<Instagram />
				</a>
				<a href="/" aria-label="Twitter / X" class="text-gray-500 hover:text-gray-900">
					<Twitter />
				</a>
			</div>
		</div>
	</div>
</footer>
