<script lang="ts">
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import dayjs from 'dayjs';

	type Props = {
		startDate: string;
		endDate: string;
		disabled?: boolean;
	};

	let { startDate = $bindable(), endDate = $bindable(), disabled }: Props = $props();
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Effective Dates</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<EaseDatePicker
			required
			{disabled}
			label="Start date"
			value={{ date: startDate }}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
			placeholder="Start date"
		/>

		<EaseDatePicker
			{disabled}
			label="End date"
			placeholder="End date"
			value={{ date: endDate }}
			onchange={(value) => {
				endDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
		/>
	</div>
</div>
