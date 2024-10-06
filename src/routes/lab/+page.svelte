<script lang="ts">
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
import { Select, type SelectOption } from '$lib/components/ui/select';

	const options: SelectOption[] = [
		{ value: '1', label: 'Option 1' },
		{ value: '2', label: 'Option 2' },
		{ value: '3', label: 'Option 3' },
		{ value: '4', label: 'Option 4' },
		{ value: '5', label: 'Option 5' }
	];
</script>

<SlideShow />
