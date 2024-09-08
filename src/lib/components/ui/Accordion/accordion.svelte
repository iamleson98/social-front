<script lang="ts" context="module">
	export type Props = {
		header: string;
		headerIcon?: IconType;
		class?: string;
		children: Snippet;
		open?: boolean;
		/** if `true`, the `open` stays the same as passed in */
		fixed?: boolean;
	};
</script>

<script lang="ts">
	import { ChevronDown, ChevronUp, Icon, type IconType } from '$lib/components/icons';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		class: className = '',
		children,
		open = $bindable(true),
		fixed = false,
		headerIcon
	}: Props = $props();

	const toggle = () => {
		if (!fixed) open = !open;
	};
</script>

<div class={`${className} py-2 px-3 rounded-md text-gray-800`}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="flex items-center justify-between cursor-pointer select-none"
		role="button"
		tabindex="0"
		onclick={toggle}
	>
		<div class="text-sm font-semibold flex items-center">
			{#if headerIcon}
				<Icon icon={headerIcon} class="mr-2" />
			{/if}
			<span>
				{header}
			</span>
		</div>
		<div>
			<Icon icon={open ? ChevronUp : ChevronDown} />
		</div>
	</div>

	{#if open}
		<div transition:slide class="mt-4">
			{@render children()}
		</div>
	{/if}
</div>
