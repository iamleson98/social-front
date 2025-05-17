<script lang="ts">
	import { ChevronSort, CloseX, Icon } from '$lib/components/icons';

	let {
		value,
		onClear,
		openSelect,
	}: { value: string | number; onClear: () => void; openSelect: boolean } = $props();
</script>

{#if !!value}
	<span
		onclick={onClear}
		role="button"
		tabindex="0"
		onkeydown={(evt) => evt.key === 'Enter' && onClear()}
		class="cursor-pointer select-none!"
		title="Clear"
	>
		<Icon icon={CloseX} size="xs" />
	</span>
{:else if !openSelect}
	<Icon icon={ChevronSort} size="xs" />
{/if}
