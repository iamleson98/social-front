<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { CommonEaseDatePickerFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	type Props = {
		startDate: string;
		endDate: string;
	};

	let { startDate = $bindable(), endDate = $bindable() }: Props = $props();
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Effective Dates</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<EaseDatePicker
			required
			label="Start date"
			value={{ date: startDate ? dayjs(startDate).toDate() : undefined }}
			onchange={(value) => {
				startDate = value.date!.toString();
			}}
			placeholder="Start date"
			format={CommonEaseDatePickerFormat}
		/>

		<EaseDatePicker
			label="End date"
			placeholder="End date"
			value={{ date: endDate ? dayjs(endDate).toDate() : undefined }}
			onchange={(value) => {
				endDate = value.date!.toString();
			}}
			format={CommonEaseDatePickerFormat}
			timeLock={{
				minDate: startDate ? dayjs(startDate).add(1, 'day').toDate() : undefined,
			}}
		/>
	</div>
</div>
