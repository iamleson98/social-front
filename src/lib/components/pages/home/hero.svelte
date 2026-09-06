<script lang="ts">
	import { T } from '$i18n';
	import { ArrowRight, Icon, IonFlame, ShieldCheck, TruckDelivery } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { buildHomePageLink } from '$lib/utils/utils';

	const trustIcons = { TruckDelivery, ShieldCheck } as const;
</script>

<section
	class="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 via-brand-600 to-violet-600 text-white"
	aria-label={$T('home.heroTitle')}
>
	<!-- decorative glow -->
	<div
		class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-violet-400/20 blur-3xl"
		aria-hidden="true"
	></div>
	<!-- subtle grid pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.07]"
		style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 44px 44px;"
		aria-hidden="true"
	></div>

	<div class="relative px-6 py-10 sm:px-10 sm:py-14 max-tablet:px-5 max-tablet:py-8">
		<div class="max-w-2xl">
			<p
				class="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wide uppercase"
			>
				<span aria-hidden="true">✨</span>
				{$T('home.heroBadge')}
			</p>

			<h1
				class="mt-4 text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-balance max-tablet:text-2xl"
			>
				{$T('home.heroTitle')}
			</h1>

			<p
				class="mt-4 text-base sm:text-lg text-white/85 leading-relaxed max-w-xl max-tablet:text-sm"
			>
				{$T('home.heroSubtitle')}
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-3">
				<a href={AppRoute.TRENDING()}>
					<Button
						variant="filled"
						color="dark"
						size="md"
						class="!bg-white !text-brand-700 hover:!bg-gray-100 shadow-lg"
						endIcon={IonFlame}
					>
						{$T('home.heroCtaTrending')}
					</Button>
				</a>
				<a href={buildHomePageLink()}>
					<Button
						variant="outline"
						size="md"
						class="!text-white !border-white/40 hover:!bg-white/10 hover:!border-white/60"
						endIcon={ArrowRight}
					>
						{$T('home.heroCtaBrowse')}
					</Button>
				</a>
			</div>
		</div>
	</div>

	<!-- trust strip -->
	<div class="relative border-t border-white/15 bg-black/10">
		<div class="px-6 sm:px-10 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 max-tablet:px-5">
			{#each ['home.trustFastDelivery', 'home.trustSecurePayment', 'home.trustEasyReturns'] as key (key)}
				<span class="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90">
					<Icon
						icon={key === 'home.trustSecurePayment'
							? trustIcons.ShieldCheck
							: trustIcons.TruckDelivery}
						class="size-3.5!"
					/>
					{$T(key as never)}
				</span>
			{/each}
		</div>
	</div>
</section>
