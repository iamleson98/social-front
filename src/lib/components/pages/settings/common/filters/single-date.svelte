<script lang="ts">
	import type { FilterComponentType } from '$lib/components/common/filter-box';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';

	let { onValue, initialValue = '', placeholder }: FilterComponentType = $props();
</script>

<EaseDatePicker
	size="xs"
	{placeholder}
	value={{ date: initialValue as string }}
	onchange={(val) => onValue(val.date?.toString() as string)}
/>
