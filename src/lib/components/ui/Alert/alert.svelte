<script lang="ts">
	import { CloseX, Icon } from '$lib/components/icons';
	import { SocialVariantIconsMap, type SocialVariant } from '$lib/utils/consts';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import { ALERT_VARIANT_STYLE_MAP, ALERT_SIZE_STYLE_MAP } from './types';
	import type { SocialColor, SocialSize } from '../common';
	import { IconButton } from '../Button';

	type Props = {
		variant?: SocialVariant;
		children: Snippet;
		size?: SocialSize;
		bordered?: boolean;
		dismissable?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		variant = 'info',
		children,
		size = 'md',
		bordered = false,
		dismissable = false,
		class: className = ''
	}: Props = $props();

	const DISMISS_COLOR = ((): SocialColor => {
		if (variant === 'error') return 'red';
		if (variant === 'info') return 'blue';
		if (variant === 'warning') return 'orange';
		return 'green';
	})();

	let show = $state(true);
</script>

{#if show}
	<div
		class={`flex items-start gap-2 wrap-anywhere rounded-lg ${className} ${ALERT_VARIANT_STYLE_MAP[variant]} ${ALERT_SIZE_STYLE_MAP[size].container} ${bordered ? 'border' : 'border-none!'}`}
		in:fly={{ y: 10 }}
	>
		<span class="flex items-center">
			<Icon icon={SocialVariantIconsMap[variant]} class={`${ALERT_SIZE_STYLE_MAP[size].icon}`} />
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
					color={DISMISS_COLOR}
				/>
			</div>
		{/if}
	</div>
{/if}
