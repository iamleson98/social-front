<script lang="ts">
	import Rating from '$lib/components/common/rating/rating.svelte';
	import { Select } from '$lib/components/ui/select';

	let rating = $state(1.2);

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
		disabled
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
		<Rating total={5} size={30} {rating} >
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
</div>
