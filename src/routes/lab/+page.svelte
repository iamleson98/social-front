<script lang="ts">
	import Rating from '$lib/components/common/rating/rating.svelte';
	import { Email, OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';

	let rating = $state(1.2);

	let ref = $state<HTMLButtonElement>();
	let openDropdown = $state(false);

	$effect(() => {
		console.log(rating);
	});
</script>

<h1>
	This page is for experimental purposes only. You should import your components or idea here to
	test it.
</h1>

<div></div>
<div>
	<Select
		options={[
			{ label: 'Option 1', value: 'option1' },
			{ label: 'Option 2', value: 'option2' },
			{ label: 'Option 3', value: 'option3' },
			{ label: 'Option 1', value: 'option1' },
			{ label: 'Option 2', value: 'option2' },
			{ label: 'Option 3', value: 'option3' },
			{ label: 'Option 1', value: 'option1' },
			{ label: 'Option 2', value: 'option2' },
			{ label: 'Option 3', value: 'option3' },
			{ label: 'Option 1', value: 'option1' },
			{ label: 'Option 2', value: 'option2' },
			{ label: 'Option 3', value: 'option3' },
			{ label: 'Option 1', value: 'option1' },
			{ label: 'Option 2', value: 'option2' },
			{ label: 'Option 3', value: 'option3' }
		]}
		label="Select an option"
	/>
	<div>
		<Rating total={5} size={30} {rating}>
			<!-- <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400" ></span>
			<a
				href="/"
				class="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white"
			>
				73 reviews
			</a> -->
		</Rating>

		<!-- </Rating> -->
	</div>
	<button onclick={() => (rating += 1)}>add one</button>

	<Button variant="filled" size="xs">Hello</Button>
	<Button variant="light" size="sm">Hello</Button>
	<Button variant="gradient" size="md">Hello</Button>
	<Button variant="outline" size="lg">Hello</Button>

	<Button variant="filled" color="dark" size="xl" startIcon={Email}>
		<!-- <Icon icon={Email} /> -->
		hello
	</Button>
	<Button variant="light" color="grape">Hello</Button>
	<Button variant="light" color="red">Hello</Button>
	<Button variant="gradient" color="gray">Hello</Button>
	<Button variant="outline">Hello</Button>
</div>

<div>
	<Input
		placeholder="Hello world"
		label="Enter name"
		startIcon={Email}
		variant="error"
		subText="hello world"
	/>
	<Input
		placeholder="Hello world"
		label="Enter name"
		startIcon={OpenEye}
		variant="success"
		subText="hello world"
		size="sm"
		type="number"
		disabled
	/>
</div>

<IconButton icon={Email} shape="circle" color="grape" variant="light" size="xs" />

<Alert size="md" bordered variant="error" />
<Alert size="sm" />
<Alert size="xs" bordered />
<Alert size="lg" bordered variant="warning" />
<Alert size="xl" bordered variant="success" />

<button bind:this={ref} onclick={() => (openDropdown = !openDropdown)} class="text-red-500"
	>toggle</button
>
<DropDown
	header="Hello world"
	items={[
		{
			text: 'hello',
			startIcon: Email,
			hasDivider: true
		},
		{
			text: 'lol'
		}
	]}
	parentRef={ref}
	open={openDropdown}
	onClose={() => (openDropdown = false)}
/>

<Accordion header="Hello world" class="bg-white">
	<p>This is children</p>
</Accordion>

<Badge text="hello" onDismiss={console.log} color="blue" variant="outline" />

<div class="h-screen">hello</div>
