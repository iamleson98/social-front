<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import { onMount, type Component } from 'svelte';
	import {
		Facebook,
		Instagram,
		JapanFlag,
		KoreaFlag,
		Twitter,
		UsaFlag,
		VietnamFlag
	} from '../icons/SvgOuterIcon';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { setTranslation, type LanguageCode } from '$i18n';
	import { DropDown, MenuItem, type DropdownTriggerInterface } from '../ui/Dropdown';
	import { Button } from '../ui';

	type LanguageProps = { code: LanguageCodeEnum; name: string; icon: Component };

	const languageOptions: LanguageProps[] = [
		{ icon: UsaFlag, name: 'English', code: LanguageCodeEnum.En },
		{ icon: VietnamFlag, name: 'Tiếng Việt', code: LanguageCodeEnum.Vi },
		{ icon: KoreaFlag, name: '한국어', code: LanguageCodeEnum.Ko },
		{ icon: JapanFlag, name: '日本語', code: LanguageCodeEnum.Ja }
	];

	type FooterItemStructure = {
		title: string;
		items: FooterItemProps[];
	};

	type FooterItemProps = {
		title: string;
		href?: string;
	};

	let activeLanguage = $state(languageOptions[0]);

	onMount(async () => {
		const cookieLanguage = clientSideGetCookieOrDefault(LANGUAGE_KEY, LanguageCodeEnum.En);
		const language = languageOptions.find((lang) => lang.code === cookieLanguage);
		if (language) {
			activeLanguage = language;
		}
	});

	const handleSwitchLanguageCode = async (index: number) => {
		document.cookie = `${LANGUAGE_KEY}=${languageOptions[index].code}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; Secure; SameSite=Lax`;
		activeLanguage = languageOptions[index];

		setTranslation(languageOptions[index].code as LanguageCode);
	};
</script>

<footer class="p-6 max-w-6xl mx-auto">
	<div class="mx-auto max-w-[theme(screens.xl)]">
		<div class="md:flex md:justify-between">
			<div class="mb-6 md:mb-0">
				<a href={AppRoute.HOME} class="flex items-center">
					<img src="/logo.png" class="mr-3 h-8" alt="FlowBite Logo" />
				</a>
			</div>
			<div class="grid grid-cols-4 gap-4 tablet:grid-cols-2">
				<!-- resources -->
				<div>
					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Resources</h2>
					<ul class="text-gray-600">
						<li class="mb-4">
							<a href="/" class="hover:underline">Sitename</a>
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

				<div>
					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">Language</h2>
					{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
						<Button {onclick} {onfocus} size="xs" variant="outline">
							<activeLanguage.icon />
							{activeLanguage.name}
						</Button>
					{/snippet}
					<DropDown {trigger} placement='bottom-end'>
						{#each languageOptions as language, idx (idx)}
							<MenuItem onclick={() => handleSwitchLanguageCode(idx)}>
								<div class="flex items-center gap-2">
									<language.icon />
									<span class="text-nowrap">{language.name}</span>
								</div>
							</MenuItem>
						{/each}
					</DropDown>
				</div>
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
