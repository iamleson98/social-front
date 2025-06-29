<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';

	type Props = {
		startDate: string;
		endDate: string;
	};

	let { startDate = $bindable(), endDate = $bindable() }: Props = $props();
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Active Dates</SectionHeader>

  <!-- <EaseDatePicker bind:value={startDate} /> -->
</div>
