<script lang="ts" module>
	export type DropdownItemProps = {
		startIcon?: IconType;
		text: string;
		subText?: string;
		hasDivider?: boolean;
		onSelect?: () => void;
	};

	export type Props = {
		class?: string;
		parentRef: HTMLElement;
		items: DropdownItemProps[];
		open: boolean;
		header?: string;
		onClose: () => void;
		placement?: 'dropdown-top' | 'dropdown-right' | 'dropdown-bottom' | 'dropdown-left';
	};
</script>

<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
	import { fly } from 'svelte/transition';
	import { clickOutside } from '$lib/actions/click-outside';

	const idealOffset = 12;

	let {
		parentRef,
		items,
		open,
		class: className = '',
		header,
		onClose,
		placement = 'dropdown-right'
	}: Props = $props();
	let dropdownRef = $state<HTMLDivElement>();

	$effect(() => {
		if (open && parentRef && dropdownRef) {
			const parentRect = parentRef.getBoundingClientRect();
			const dropDownRect = dropdownRef.getBoundingClientRect();
			const { innerHeight, innerWidth } = window;
			let x: number;
			let y: number;
			// let position: string;

			// Determine the best placement for the dropdown
			if (parentRect.top - dropDownRect.height - idealOffset >= 0) {
				placement = 'dropdown-top';
				x = parentRect.left + parentRect.width / 2 - dropDownRect.width / 2;
				y = parentRect.top - dropDownRect.height - idealOffset;
			} else if (parentRect.right + dropDownRect.width + idealOffset <= innerWidth) {
				placement = 'dropdown-right';
				x = parentRect.right + idealOffset;
				y = parentRect.top + parentRect.height / 2 - dropDownRect.height / 2;
			} else if (parentRect.bottom + dropDownRect.height + idealOffset <= innerHeight) {
				placement = 'dropdown-bottom';
				x = parentRect.left + parentRect.width / 2 - dropDownRect.width / 2;
				y = parentRect.bottom + idealOffset;
			} else {
				placement = 'dropdown-left';
				x = parentRect.left - dropDownRect.width - idealOffset;
				y = parentRect.top + parentRect.height / 2 - dropDownRect.height / 2;
			}

			// Adjust the placement to fit within the viewport
			if (x < 0) {
				x = idealOffset;
			} else if (x + dropDownRect.width > innerWidth) {
				x = innerWidth - dropDownRect.width - idealOffset;
			}

			if (y < 0) {
				y = idealOffset;
			} else if (y + dropDownRect.height > innerHeight) {
				y = innerHeight - dropDownRect.height - idealOffset;
			}

			dropdownRef.className += ` ${placement}`;
			dropdownRef.style.left = `${x}px`;
			dropdownRef.style.top = `${y}px`;
		}
	});
</script>

{#if open}
	<div
		bind:this={dropdownRef}
		transition:fly={{ y: 5 }}
		class={`dropdown ${className}`}
		use:clickOutside={{
			onOutclick: onClose
		}}
	>
		{#if header}
			<div class="px-4 py-3 font-semibold">
				{header}
			</div>
		{/if}
		<ul>
			{#each items as item, idx (idx)}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<li
					class={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${item.hasDivider ? 'border-b border-gray-100' : ''}`}
					onclick={item.onSelect}
					onkeydown={(e) => e.key === 'Enter' && item.onSelect?.()}
					tabindex="0"
				>
					<div class="flex items-center space-x-2">
						{#if item.startIcon}
							<Icon icon={item.startIcon} />
						{/if}
						<div>
							<p class="text-sm">{item.text}</p>
							{#if item.subText}
								<p class="text-xs">{item.subText}</p>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	@import "tailwindcss/theme";

	.dropdown {
		@apply z-99999999 !rounded absolute transform bg-white py-2 block text-gray-800 w-56 list-none text-sm shadow divide-y divide-gray-100 dark:bg-gray-700 dark:text-white dark:divide-gray-600;
	}
	.dropdown-top::before {
		@apply -bottom-1.5 left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-b-0 border-t-inherit;
	}
	.dropdown-bottom::before {
		@apply -top-1.5 left-1/2 -translate-x-1/2 border-x-[6px] border-b-[6px] border-t-0 border-b-inherit;
	}
	.dropdown-left::before {
		@apply -right-1.5 top-1/2 -translate-y-1/2 border-y-[6px] border-l-[6px] border-r-0 border-l-inherit;
	}
	.dropdown-right::before {
		@apply -left-1.5 top-1/2 -translate-y-1/2 border-y-[6px] border-r-[6px] border-l-0 border-r-inherit;
	}
</style>
