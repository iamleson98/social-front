<script lang="ts">
	import Rating from '$lib/components/pages/products/rating.svelte';
	import { Select } from '$lib/components/ui/select';
	import { onMount } from 'svelte';

	onMount(() => {
		fetch('/api/categories/fetch?first=10&after=hello').then(res => res.json()).then(console.log);
	});

	
</script>

<h1>
	This page is for experimental purposes only. You should import your components or idea here to
	test it.
</h1>

<div>
	<Rating rating={3.6} />
</div>

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
</div>
