<script lang="ts" context="module">
	export type Props = {
		header: string;
		class?: string;
		children: Snippet;
		open?: boolean;
	};
</script>

<script lang="ts">
	import { ChevronDown, ChevronUp, Icon } from '$lib/components/icons';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let { header, class: className = '', children, open = $bindable(true) }: Props = $props();
</script>

<div class={`${className} py-2 px-3 rounded-md text-gray-800`}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="flex items-center justify-between cursor-pointer select-none"
		role="button"
		tabindex="0"
		onclick={() => (open = !open)}
	>
		<div class="text-sm font-semibold">
			{header}
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
