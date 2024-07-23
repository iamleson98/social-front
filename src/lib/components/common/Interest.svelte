<script lang="ts">
	import GradientCard from './gradient-card.svelte';

	interface Interest {
		id: number;
		name: string;
		icon: string;
		selected: boolean;
		bgFrom: string;
		bgTo: string;
	}

	let interests: Interest[] = [
		{
			id: 1,
			name: 'Sport & Travel',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-red-200',
			bgTo: 'to-red-700'
		},
		{
			id: 2,
			name: 'Books',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-pink-200',
			bgTo: 'to-pink-800'
		},
		{
			id: 3,
			name: 'Men fashion',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-yellow-200',
			bgTo: 'to-pink-900'
		},
		{
			id: 4,
			name: 'Women handbag',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-yellow-200',
			bgTo: 'to-green-700'
		},
		{
			id: 5,
			name: 'Women fashion',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-yellow-200',
			bgTo: 'to-pink-900'
		},
		{
			id: 6,
			name: 'Men handbag',
			icon: 'icon-[system-uicons--button-minus]',
			selected: false,
			bgFrom: 'from-yellow-200',
			bgTo: 'to-green-700'
		}
	];

	function toggleSelection(id: number) {
		interests = interests.map((item) =>
			item.id === id ? { ...item, selected: !item.selected } : item
		);
	}
</script>

<div>
	<div class="responsive-grid w-full pl-3 pr-3 mr-10 h-97 overflow-y-auto">
		{#each interests as { id, name, icon, selected, bgFrom, bgTo }}
			<GradientCard {icon} {name} {bgFrom} {bgTo} {selected} on:click={() => toggleSelection(id)}>
				<span class={icon} style="color: #fff; width: 51px; height:51px"></span>
			</GradientCard>
		{/each}
	</div>

	<div class="flex justify-end mt-10 mr-5">
		<button class="common-button bg-red-100 text-red-400 mr-2">Cancel</button>
		<button class="common-button bg-blue-100 text-blue-400">Save</button>
	</div>
</div>

<style lang="postcss">
	.common-button {
		@apply px-4 py-1 font-bold rounded;
	}

	@media (max-width: 800px) {
		.responsive-grid {
			@apply grid grid-cols-1 gap-3;
		}
	}

	@media (min-width: 801px) {
		.responsive-grid {
			@apply grid grid-cols-2 gap-3;
		}
	}
</style>
