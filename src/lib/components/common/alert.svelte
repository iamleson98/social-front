<script lang="ts">
	import type { SocialVariant } from '$lib/utils';
	import { SocialVariantIconsMap } from '$lib/utils/consts';
	import { fade } from 'svelte/transition';

	interface Props {
		content: string | unknown;
		/** default 'info' */
		variant?: SocialVariant;
		classes?: string;
	}

	let { content, variant = 'info', classes = '' }: Props = $props();
</script>

<div
	class={`text-xs alert-${variant} flex gap-2 items-center rounded p-2 ${classes}`}
	transition:fade
>
	<span class="text-2xl">
		<svelte:component this={SocialVariantIconsMap[variant]} />
	</span>
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
