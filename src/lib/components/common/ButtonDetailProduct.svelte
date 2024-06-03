<script lang="ts">
	export let text: string = '';
	export let icon: string = '';
	export let onClick: () => void = () => {};
	export let isToggle: boolean = false;
	export let isVisible: boolean = false;
	export let dropdownItems: Array<{ src: string; alt: string }> = [];
	export let toggleDropdown: () => void = () => {};
</script>

{#if isToggle}
	<div class="relative w-full">
		<button
			class="flex items-center justify-center bg-gray-200 text-gray-400 py-2 rounded hover:bg-gray-300 w-full tablet:h-6"
			on:click={toggleDropdown}
		>
			{text}
			{#if icon}
				<span class={icon + ' w-6 h-6 ml-1 text-gray-400 tablet:w-3 tablet:h-3'}></span>
			{:else}
				<svg
					class="w-6 h-6 text-gray-400 dark:text-white ml-1 tablet:w-3 tablet:h-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-width="2"
						d="M7.926 10.898 15 7.727m-7.074 5.39L15 16.29M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm12 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0-11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
					/>
				</svg>
			{/if}
		</button>
		{#if isVisible}
			<div
				class="absolute flex w-full p-2 justify-center items-center gap-2 bottom-full bg-white mb-2 rounded shadow-md"
			>
				{#each dropdownItems as item}
					<button>
						<img src={item.src} alt={item.alt} class="w-5 h-5 tablet:w-3 tablet:h-3" />
					</button>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="w-full">
		<button
			class="flex items-center justify-center bg-gray-200 text-gray-400 py-2 rounded hover:bg-gray-300 w-full tablet:h-6"
			on:click={onClick}
		>
			{text}
			<span class={icon + ' w-6 h-6 text-gray-400 tablet:w-3 tablet:h-3'}></span>
		</button>
	</div>
{/if}
