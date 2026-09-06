<script lang="ts">
	import { T } from '$i18n';
	import { Icon, ShieldCheck, TruckDelivery, RosetteDiscountChecked } from '$lib/components/icons';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex items-center justify-center w-full py-8 max-tablet:py-4 px-4">
	<div
		class="card-surface overflow-hidden grid grid-cols-5 max-tablet:grid-cols-1 w-full max-w-4xl shadow-lg"
	>
		<!-- brand panel -->
		<div
			class="relative max-tablet:hidden col-span-2 bg-linear-to-br from-brand-700 via-brand-600 to-violet-600 p-10 text-white overflow-hidden"
		>
			<div
				class="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute -bottom-24 -left-12 size-56 rounded-full bg-violet-400/20 blur-2xl"
				aria-hidden="true"
			></div>

			<div class="relative flex flex-col h-full justify-between">
				<div>
					<h2 class="text-2xl font-bold leading-tight tracking-tight">
						{$T('auth.panelTitle')}
					</h2>
					<p class="mt-3 text-sm text-white/80 leading-relaxed">
						{$T('auth.panelSubtitle')}
					</p>
				</div>

				<ul class="space-y-3.5 mt-8">
					{#each [{ icon: TruckDelivery, key: 'footer.trustDelivery' }, { icon: ShieldCheck, key: 'footer.trustAuthentic' }, { icon: RosetteDiscountChecked, key: 'footer.trustReturns' }] as benefit (benefit.key)}
						<li class="flex items-center gap-3 text-sm font-medium text-white/90">
							<span class="rounded-full bg-white/15 p-2">
								<Icon icon={benefit.icon} class="size-4!" />
							</span>
							{$T(benefit.key as never)}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- form panel -->
		<div class="col-span-3 max-tablet:col-span-1 p-8 max-tablet:p-6">
			{@render children()}
		</div>
	</div>
</div>
