<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import { ChevronSort } from '$lib/components/icons';

	interface Props {
		label?: string;
		class?: string;
		id?: string;
		choices: {
			label: string;
			value: string | number;
		}[];
	}
	let { label, class: className, id, choices }: Props = $props();

	let hidden = $state(true);

	/** 0 based */
	let selectedIndex = $state<number | null>(null);
</script>

<div class={`${className}`}>
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<div class="mt-2 relative">
		<button
			type="button"
			class="select-btn"
			aria-haspopup="listbox"
			aria-expanded="true"
			aria-labelledby="listbox-label"
      onclick={() => (hidden = !hidden)}
		>
			<span class="flex items-center">
				<span class="ml-3 block truncate">
					{#if selectedIndex}
						{choices[selectedIndex].label}
					{:else}
						Please select
					{/if}
				</span>
				<span class="select-icon">
					<Icon class="h-5 w-5 text-gray-400" icon={ChevronSort} />
				</span>
			</span>
		</button>
		<ul class:hidden role="listbox" tabindex="-1" class="option-list">
			{#each choices as choice, idx (idx)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="select-option"
					class:selected-option={selectedIndex === idx}
					onclick={() => (selectedIndex = idx)}
				>
					{choice.label}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style lang="postcss">
	.select-btn {
		@apply relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 ring-inset ring-gray-300 tablet:text-sm tablet:leading-6;
	}
	.selected-option {
		@apply text-blue-800 bg-blue-200;
	}
	.select-option {
		@apply relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100;
	}
	.option-list {
		@apply absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg tablet:text-sm;
	}
	.select-item {
		@apply pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2;
	}
</style>
