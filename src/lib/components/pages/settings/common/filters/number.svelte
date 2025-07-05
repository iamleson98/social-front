<script lang="ts">
	import type { FilterComponentType } from '$lib/components/common/filter-box';
	import { Input } from '$lib/components/ui/Input';

	let { onValue, initialValue, placeholder }: FilterComponentType = $props();
</script>

<Input
	size="xs"
	type="number"
	{placeholder}
	value={initialValue}
	onchange={(val) => onValue((val.target as HTMLInputElement).value)}
/>
