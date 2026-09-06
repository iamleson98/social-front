<script lang="ts">
	import { SUPPORTED_LANGUAGES, switchTranslationLanguage, T } from '$i18n';
	import { Facebook, Instagram, Twitter } from '$lib/components/icons/SvgOuterIcon';
	import { Button } from '$lib/components/ui';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { LanguageCodeEnum } from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault, clientSideSetCookie } from '$lib/utils/cookies';
	import { buildHomePageLink } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	let activeLanguage = $state(SUPPORTED_LANGUAGES[0]);

	const setLanguageByCode = (idx: number): void => {
		activeLanguage = SUPPORTED_LANGUAGES[idx];
		void switchTranslationLanguage(activeLanguage.code);
		clientSideSetCookie(LANGUAGE_KEY, activeLanguage.code, {
			secure: true,
			path: '/',
			expires: new Date(3000, 1, 1),
			sameSite: 'lax',
		});
	};

	onMount(async () => {
		const cookieLang = clientSideGetCookieOrDefault(
			LANGUAGE_KEY,
			LanguageCodeEnum.En,
		).toUpperCase();
		const supportedLang = SUPPORTED_LANGUAGES.find((lang) => lang.code === cookieLang);
		if (supportedLang) {
			activeLanguage = supportedLang;
			void switchTranslationLanguage(activeLanguage.code);
		}
	});
</script>

<footer class="mt-auto bg-gray-950 text-gray-300">
	<!-- trust strip -->
	<div class="border-b border-gray-800/80">
		<div
			class="mx-auto max-w-[1350px] px-4 py-6 grid grid-cols-2 gap-6 md:grid-cols-4 text-center md:text-left"
		>
			{#each ['footer.trustAuthentic', 'footer.trustDelivery', 'footer.trustReturns', 'footer.trustSupport'] as trustKey (trustKey)}
				<div class="flex flex-col items-center md:flex-row gap-2.5 md:gap-3">
					<span class="text-2xl leading-none">
						{trustKey === 'footer.trustAuthentic'
							? '🛡️'
							: trustKey === 'footer.trustDelivery'
								? '🚚'
								: trustKey === 'footer.trustReturns'
									? '↩️'
									: '💬'}
					</span>
					<span class="text-sm text-gray-400">{$T(trustKey as never)}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- main footer columns -->
	<div class="mx-auto max-w-[1350px] px-4 py-10 md:py-12">
		<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
			<!-- brand -->
			<div class="lg:col-span-2">
				<a href={buildHomePageLink()} class="inline-flex items-center gap-3" aria-label="Sitename">
					<img src="/logo.png" class="h-9 w-auto brightness-0 invert" alt="Sitename logo" />
				</a>
				<p class="mt-4 text-sm leading-6 text-gray-400 max-w-xs">
					{$T('footer.brandTagline')}
				</p>
				<div class="mt-5 flex gap-4">
					<a
						href="https://www.facebook.com/profile.php?id=61572273849445"
						target="_blank"
						aria-label="Facebook"
						class="text-gray-400 hover:text-white transition-colors"
					>
						<Facebook />
					</a>
					<a
						href="/"
						aria-label="Instagram"
						class="text-gray-400 hover:text-white transition-colors"
					>
						<Instagram />
					</a>
					<a
						href="/"
						aria-label="Twitter / X"
						class="text-gray-400 hover:text-white transition-colors"
					>
						<Twitter />
					</a>
				</div>
			</div>

			<!-- shop links -->
			<nav aria-label={$T('footer.shop')}>
				<h2 class="text-sm font-semibold text-white uppercase tracking-wider">
					{$T('footer.shop')}
				</h2>
				<ul class="mt-4 space-y-3 text-sm">
					<li>
						<a href={buildHomePageLink()} class="hover:text-white transition-colors"
							>{$T('pages.home')}</a
						>
					</li>
					<li>
						<a href={AppRoute.TRENDING()} class="hover:text-white transition-colors"
							>{$T('pages.trending')}</a
						>
					</li>
					<li>
						<a href={AppRoute.WISHLIST()} class="hover:text-white transition-colors"
							>{$T('wishlist.title')}</a
						>
					</li>
					<li>
						<a href={AppRoute.SHOPPING_CART()} class="hover:text-white transition-colors"
							>{$T('cart.title')}</a
						>
					</li>
				</ul>
			</nav>

			<!-- social + community -->
			<nav aria-label={$T('footer.socialMedia')}>
				<h2 class="text-sm font-semibold text-white uppercase tracking-wider">
					{$T('footer.socialMedia')}
				</h2>
				<ul class="mt-4 space-y-3 text-sm">
					<li>
						<a
							href="https://www.facebook.com/profile.php?id=61572273849445"
							target="_blank"
							class="hover:text-white transition-colors">Facebook</a
						>
					</li>
					<li>
						<a
							href="https://discord.gg/4eeurUVvTy"
							target="_blank"
							class="hover:text-white transition-colors"
						>
							Discord
						</a>
					</li>
				</ul>
			</nav>

			<!-- language -->
			<div>
				<h2 class="text-sm font-semibold text-white uppercase tracking-wider">
					{$T('footer.language')}
				</h2>
				<div class="mt-4">
					<DropDown placement="top-end">
						{#snippet trigger({ onclick, onfocus })}
							<Button {onclick} {onfocus} size="xs" variant="outline" color="gray">
								<activeLanguage.icon />
								{activeLanguage.name}
							</Button>
						{/snippet}
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
			</div>
		</div>

		<div
			class="mt-10 border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
		>
			<span class="text-xs text-gray-500">
				© 2024 - now <a href="/" class="hover:text-gray-300">Sitename™</a>. {$T(
					'footer.allRightsReserved',
				)}
			</span>
			<div class="flex gap-5 text-xs text-gray-500">
				<a href="/" class="hover:text-gray-300 transition-colors">{$T('footer.policy')}</a>
				<a href="/" class="hover:text-gray-300 transition-colors">{$T('footer.terms')}</a>
			</div>
		</div>
	</div>
</footer>
