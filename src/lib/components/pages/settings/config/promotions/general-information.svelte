<script lang="ts">
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { PromotionTypeEnum } from '$lib/gql/graphql';
	import type { OutputData } from '@editorjs/editorjs';
	import dayjs from 'dayjs';

	type Props = {
		/** indicate if current page is promotion create page */
		isCreatePage?: boolean;
		name: string;
		type: PromotionTypeEnum;
		loading?: boolean;
		description: OutputData;
		startDate: string;
		endDate?: string;
	};

	let {
		isCreatePage = false,
		name = $bindable(),
		type = $bindable(),
		loading,
		description = $bindable(),
		startDate = $bindable(),
		endDate = $bindable(),
	}: Props = $props();

	const DiscountTypeOptions = Object.values(PromotionTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2 mb-2">
	<SectionHeader>General information</SectionHeader>

	<div class="flex gap-2 items-start">
		<Select
			options={DiscountTypeOptions}
			label="Discount type"
			required
			class="flex-1/3"
			size="md"
			bind:value={type}
			disabled={!isCreatePage}
		/>
		<Input
			placeholder="Promotion name"
			label="Promotion name"
			required
			class="flex-2/3"
			size="md"
			bind:value={name}
			disabled={loading}
		/>
	</div>

	<EditorJSComponent
		label="Promotion description"
		required
		placeholder="Promotion description"
		bind:value={description}
		disabled={loading}
	/>

	<div class="flex items-start gap-2">
		<EaseDatePicker
			label="Start date"
			placeholder="Start date"
			required
			class="flex-1"
			value={{ date: startDate }}
			format={RFC3339TimeFormat}
			disabled={loading}
			onchange={(value) => (startDate = dayjs(value.start).format(RFC3339TimeFormat))}
		/>
		<EaseDatePicker
			label="End date"
			placeholder="End date"
			class="flex-1"
			value={{ date: endDate }}
			format={RFC3339TimeFormat}
			disabled={loading}
			onchange={(value) => (endDate = dayjs(value.start).format(RFC3339TimeFormat))}
		/>
	</div>
</div>
