<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import { SocialVariantIconsMap, type SocialVariant } from '$lib/utils/consts';
	import type { Snippet } from 'svelte';
	import type { SocialSize } from '../common';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		variant?: SocialVariant;
		children?: Snippet;
		size?: SocialSize;
		bordered?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		variant = 'info',
		children,
		size = 'md',
		bordered = false,
		class: className = '',
	}: Props = $props();
</script>

<div
	class={`alert ${className} alert-${variant} alert-${size} ${bordered ? 'border' : '!border-none'}`}
>
	<span class="flex items-center mr-1.5">
		<Icon icon={SocialVariantIconsMap[variant]} />
	</span>
	{#if children}
		{@render children()}
	{:else}
		<span>{variant}</span>
	{/if}
</div>

<style lang="postcss">
	.alert {
		@apply flex items-center rounded-lg;
	}
	.alert-info {
		@apply bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-400 dark:border-blue-400;
	}
	.alert-success {
		@apply bg-green-50 text-green-700 border-green-300 dark:bg-green-700 dark:text-green-400 dark:border-green-400;
	}
	.alert-warning {
		@apply bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-400 dark:border-yellow-400;
	}
	.alert-error {
		@apply bg-red-50 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-400 dark:border-red-400;
	}
	.alert-md {
		@apply p-3;
	}
	.alert-lg {
		@apply p-4 text-base;
	}
	.alert-xl {
		@apply p-5 text-lg font-semibold;
	}
	.alert-xs {
		@apply p-1 text-xs;
	}
	.alert-sm {
		@apply p-2 text-sm;
	}
</style>
