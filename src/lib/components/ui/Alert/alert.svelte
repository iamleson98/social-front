<script lang="ts">
	import { CloseX, Icon } from '$lib/components/icons';
	import { SocialVariantIconsMap, type SocialVariant } from '$lib/utils/consts';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import { ALERT_VARIANT_STYLE_MAP } from './types';
	import type { SocialColor, SocialSize } from '$lib/components/ui/common';
	import { IconButton } from '$lib/components/ui/Button';
	import { classNames } from '$lib/utils/utils';

	type Props = {
		variant?: SocialVariant;
		children: Snippet;
		size?: SocialSize | 'xxs';
		bordered?: boolean;
		dismissable?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		variant = 'info',
		children,
		size = 'md',
		bordered = false,
		dismissable = false,
		class: className = '',
	}: Props = $props();

	let dismissColor = $derived.by<SocialColor>(() => {
		if (variant === 'error') return 'red';
		if (variant === 'info') return 'blue';
		if (variant === 'warning') return 'orange';
		return 'green';
	});

	let show = $state(true);
</script>

{#if show}
	<div
		class={`flex items-start gap-2 wrap-anywhere rounded-lg alert-${size} ${className} ${ALERT_VARIANT_STYLE_MAP[variant]} ${bordered ? 'border' : 'border-none!'}`}
		in:fly={{ y: 10 }}
	>
		<span class="flex items-center">
			<Icon icon={SocialVariantIconsMap[variant]} {size} />
		</span>
		<div>
			{@render children()}
		</div>
		{#if dismissable}
			<div>
				<IconButton
					aria-label="dismiss"
					onclick={() => (show = false)}
					icon={CloseX}
					rounded
					size="xs"
					variant="light"
					color={dismissColor}
				/>
			</div>
		{/if}
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	.alert-xs {
		@apply p-1.5 text-xs;
	}
	.alert-xxs {
		@apply p-1 text-[10px];
	}
	.alert-sm {
		@apply p-2 text-sm;
	}
	.alert-md {
		@apply p-3 text-base;
	}
	.alert-lg {
		@apply p-4 text-lg font-medium;
	}
	.alert-xl {
		@apply p-5 text-lg font-semibold;
	}
</style>
