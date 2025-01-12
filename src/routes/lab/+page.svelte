<script lang="ts">
	import { MegaMenu } from '$lib/components/ui/levelSelector';
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Menu } from '$lib/components/ui/Menu';
	import { MultiSelect, Select, type SelectOption } from '$lib/components/ui/select';

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

{#snippet openBtn()}
	<Button>Open</Button>
{/snippet}

<Menu trigger={openBtn}>MenuItem</Menu>

<MegaMenu
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
/>

<Badge text="lol" variant="outline" rounded size="xs" onDismiss={console.log} />
<Badge text="lol" variant="outline" size="sm" onDismiss={console.log} />
<Badge text="lol" variant="outline" size="md" onDismiss={console.log} />
<Badge text="lol" variant="outline" size="lg" onDismiss={console.log} />
<Badge text="lol" variant="outline" size="xl" onDismiss={console.log} />

<Select
	options={[
		{
			value: '1',
			label: 'Option 1'
		},
		{
			value: '2',
			label: 'Option 2'
		}
	]}
/>

<MultiSelect
	value={[]}
	size="sm"
	options={[
		{
			value: '1',
			label: 'Option 1'
		},
		{
			value: '2',
			label: 'Option 2'
		},
		{
			value: '3',
			label: 'Option 3'
		},
		{
			value: '4',
			label: 'Option 4'
		},
		{
			value: '5',
			label: 'Option 5'
		},
		{
			value: '6',
			label: 'Option 6'
		},
		{
			value: '7',
			label: 'Option 7'
		},
		{
			value: '8',
			label: 'Option 8'
		},
		{
			value: '9',
			label: 'Option 9'
		},
		{
			value: '10',
			label: 'Option 10'
		},
		{
			value: '11',
			label: 'Option 11'
		},
		{
			value: '12',
			label: 'Option 12'
		},
		{
			value: '13',
			label: 'Option 13'
		},
		{
			value: '14',
			label: 'Option 14'
		}
	]}
/>
