<script lang="ts">
	import MegaMenu from '$lib/components/common/level-selector/mega-menu.svelte';
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
	import { Button } from '$lib/components/ui';
	import { Menu } from '$lib/components/ui/Menu';
	import MenuItem from '$lib/components/ui/Menu/menuItem.svelte';
	import MenuItems from '$lib/components/ui/Menu/menuItems.svelte';
	import { type SelectOption } from '$lib/components/ui/select';
	import type { EventHandler } from 'svelte/elements';

	const options: SelectOption[] = [
		{ value: '1', label: 'Option 1' },
		{ value: '2', label: 'Option 2' },
		{ value: '3', label: 'Option 3' },
		{ value: '4', label: 'Option 4' },
		{ value: '5', label: 'Option 5' }
	];
</script>

<SlideShow />

<h1>Lab page</h1>

{#snippet openBtn({ onclick }: { onclick: EventHandler })}
	<Button {onclick}>Open</Button>
{/snippet}

<Menu trigger={openBtn}>
	<MenuItems>
		<MenuItem onClick={() => {}}>item 1 hihihihi</MenuItem>
		<MenuItem onClick={() => {}}>item 1</MenuItem>
		<MenuItem onClick={() => {}}>item 1</MenuItem>
	</MenuItems>
</Menu>

<!-- <MegaMenu
	items={[
		{
			title: 'Level 1',
			value: '1',
			children: [
				{ title: 'Level 1.1', value: '1.1' },
				{ title: 'Level 1.2', value: '1.2' },
				{ title: 'Level 1.3', value: '1.3' }
			]
		},
		{
			title: 'Level 2',
			value: '2',
			children: [
				{ title: 'Level 2.1', value: '2.1' },
				{ title: 'Level 2.2', value: '2.2' },
				{ title: 'Level 2.3', value: '2.3' }
			]
		},
		{
			title: 'Level 3',
			value: '3',
			children: [
				{ title: 'Level 3.1', value: '3.1' },
				{ title: 'Level 3.2', value: '3.2' },
				{ title: 'Level 3.3', value: '3.3' }
			]
		},
		{
			title: 'Level 1',
			value: '1',
			children: [
				{ title: 'Level 1.1', value: '1.1' },
				{ title: 'Level 1.2', value: '1.2' },
				{ title: 'Level 1.3', value: '1.3' }
			]
		},
		{
			title: 'Level 2',
			value: '2',
			children: [
				{ title: 'Level 2.1', value: '2.1' },
				{ title: 'Level 2.2', value: '2.2' },
				{ title: 'Level 2.3', value: '2.3' }
			]
		},
		{
			title: 'Level 3',
			value: '3',
			children: [
				{ title: 'Level 3.1', value: '3.1' },
				{ title: 'Level 3.2', value: '3.2' },
				{ title: 'Level 3.3', value: '3.3' }
			]
		},
		{
			title: 'Level 1',
			value: '1',
			children: [
				{ title: 'Level 1.1', value: '1.1' },
				{ title: 'Level 1.2', value: '1.2' },
				{ title: 'Level 1.3', value: '1.3' }
			]
		},
		{
			title: 'Level 2',
			value: '2',
			children: [
				{
					title: 'Level 2.1',
					value: '2.1',
					children: [
						{ title: 'Level 2.1.1', value: '2.1.1' },
						{ title: 'Level 2.1.2', value: '2.1.2' },
						{ title: 'Level 2.1.3', value: '2.1.3' }
					]
				},
				{ title: 'Level 2.2', value: '2.2' },
				{ title: 'Level 2.3', value: '2.3' }
			]
		},
		{
			title: 'Level 3',
			value: '3',
			children: [
				{ title: 'Level 3.1', value: '3.1' },
				{ title: 'Level 3.2', value: '3.2' },
				{ title: 'Level 3.3', value: '3.3' }
			]
		}
	]}
	onSelect={console.log}
/> -->
