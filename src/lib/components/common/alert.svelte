<script lang="ts">
	import type { SocialVariant } from '$lib/utils';
	import { SocialVariantIconsMap } from '$lib/utils/types';
	import { fade } from 'svelte/transition';

	export let content: string = '';
	/**
	 * @default 'info'
	 */
	export let variant: SocialVariant = 'info';
	export let classes: string = '';
	export let display: boolean = true;
</script>

{#if display}
	<div
		class={`text-xs alert-${variant} flex gap-2 items-center rounded p-2 ${classes}`}
    transition:fade
	>
		<div class={`${SocialVariantIconsMap[variant]} text-2xl`}>
		</div>
		<p>{content}</p>
	</div>

	<style lang="postcss">
		.alert-error {
			@apply text-red-500 bg-red-100;
		}
		.alert-success {
			@apply text-green-500 bg-green-100;
		}
		.alert-warning {
			@apply text-orange-500 bg-orange-100;
		}
		.alert-info {
			@apply text-blue-500 bg-blue-100;
		}
	</style>
{/if}
