<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { PromotionTypeEnum } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import dayjs from 'dayjs';
	import { any, array, object, string } from 'zod';

	type Props = {
		/** indicate if current page is promotion create page */
		isCreatePage?: boolean;
		name: string;
		type: PromotionTypeEnum;
		disabled?: boolean;
		description: OutputData;
		startDate: string;
		endDate?: string;
		ok: boolean;
	};

	let {
		isCreatePage = false,
		name = $bindable(),
		type = $bindable(),
		disabled,
		description = $bindable(),
		startDate = $bindable(),
		endDate = $bindable(),
		ok = $bindable(),
	}: Props = $props();

	const PromotionSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		type: string().nonempty($CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).min(1, $CommonState.FieldRequiredError),
		}).nullable(),
		startDate: string().nonempty($CommonState.FieldRequiredError),
	});
	const SchemaHandler = createSchemaHandler(
		PromotionSchema,
		() => ({
			name,
			type,
			description,
			startDate,
		}),
		(success) => (ok = success),
	);

	const DiscountTypeOptions = Object.values(PromotionTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>

	<div class="flex gap-2 items-start">
		<Select
			options={DiscountTypeOptions}
			label={$tranFunc('voucher.discountType')}
			required
			class="flex-1/3"
			size="md"
			bind:value={type}
			disabled={!isCreatePage || disabled}
			onblur={SchemaHandler.validate}
			onchange={SchemaHandler.validate}
			variant={$SchemaHandler?.type?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.type?.[0]}
		/>
		<Input
			placeholder={$tranFunc('common.name')}
			label={$tranFunc('common.name')}
			required
			class="flex-2/3"
			size="md"
			bind:value={name}
			{disabled}
			variant={$SchemaHandler?.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.name?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
		/>
	</div>

	<EditorJSComponent
		label={$tranFunc('settings.description')}
		required
		placeholder={$tranFunc('settings.description')}
		bind:value={description}
		{disabled}
		variant={$SchemaHandler?.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.description?.[0]}
		onchange={SchemaHandler.validate}
	/>

	<div class="gap-2 grid grid-cols-2">
		<EaseDatePicker
			required
			label={$tranFunc('common.startAt')}
			placeholder={$tranFunc('common.startAt')}
			value={{ date: startDate }}
			{disabled}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
				SchemaHandler.validate();
			}}
			variant={$SchemaHandler?.startDate?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.startDate?.[0]}
			onblur={SchemaHandler.validate}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			allowSelectMonthYears={{
				showMonths: true,
				showYears: {
					min: 2020,
					max: 2050,
				},
				showResetBtn: true,
			}}
		/>
		<EaseDatePicker
			label={$tranFunc('common.endAt')}
			placeholder={$tranFunc('common.endAt')}
			value={{ date: endDate }}
			{disabled}
			onchange={(value) => {
				endDate = dayjs(value.date).format(RFC3339TimeFormat);
				SchemaHandler.validate();
			}}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			onblur={SchemaHandler.validate}
			allowSelectMonthYears={{
				showMonths: true,
				showYears: {
					min: 2020,
					max: 2050,
				},
				showResetBtn: true,
			}}
		/>
	</div>
</div>
