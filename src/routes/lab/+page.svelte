<script lang="ts">
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Menu } from '$lib/components/ui/Menu';
	import { MultiSelect, Select } from '$lib/components/ui/select';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { DropDown, type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { UserCog } from '$lib/components/icons';
	import { EditorJSComponent } from '$lib/components/common/editorjs';

	let option = $state(1);

	const add = () => (option += 1);

	let date = $state({});

	// $inspect(date);
</script>

<Button onclick={add}>add</Button>

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
	disabled
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

<EaseDatePicker bind:value={date} onchange={console.log}  size="sm" allowSelectRange />

{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
	<Button {onclick} {onfocus}>Open</Button>
{/snippet}

<DropDown {trigger} options={[{ children: 'test' }, { children: 'another', startIcon: UserCog }]} />

<Select
	options={[{ value: '1', label: 'Option 1' }]}
	variant="error"
	subText="Something went wrong"
/>

<EditorJSComponent
	header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
	simpleImage
	list={{
		defaultStyle: 'unordered',
		maxLevel: 3,
		inlineToolbar: true
	}}
	embed={{
		services: {
			youtube: true
		}
	}}
	quote={{ inlineToolbar: true }}
	onchange={console.log}
/>
