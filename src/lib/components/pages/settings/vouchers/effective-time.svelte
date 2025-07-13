<script lang="ts">
	import { tranFunc } from '$i18n';
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
	<SectionHeader>{$tranFunc('voucher.effectDate')}</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<EaseDatePicker
			required
			{disabled}
			label={$tranFunc('common.startAt')}
			value={{ date: startDate }}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
			placeholder={$tranFunc('common.startAt')}
		/>

		<EaseDatePicker
			{disabled}
			label={$tranFunc('common.endAt')}
			placeholder={$tranFunc('common.endAt')}
			value={{ date: endDate }}
			onchange={(value) => {
				endDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
		/>
	</div>
</div>
