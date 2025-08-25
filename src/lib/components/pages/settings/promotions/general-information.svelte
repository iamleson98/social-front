<script lang="ts">
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { PromotionTypeEnum } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { OutputData } from '@editorjs/editorjs';
	import dayjs from 'dayjs';
	import z, { any, array, object, string } from 'zod';

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
		name: string().nonempty(CommonState.FieldRequiredError),
		type: string().nonempty(CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).min(1, CommonState.FieldRequiredError),
		}).nullable(),
		startDate: string().nonempty(CommonState.FieldRequiredError),
	});

	type PromotionSchema = z.infer<typeof PromotionSchema>;

	let promotionFormErrors = $state.raw<Partial<Record<keyof PromotionSchema, string[]>>>({});

	const DiscountTypeOptions = Object.values(PromotionTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	const validate = () => {
		const parseResult = PromotionSchema.safeParse({
			name,
			type,
			description,
			startDate,
			endDate,
		});
		promotionFormErrors = parseResult.success ? {} : parseResult.error.formErrors.fieldErrors;
		ok = parseResult.success;
		return parseResult.success;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General information</SectionHeader>

	<div class="flex gap-2 items-start">
		<Select
			options={DiscountTypeOptions}
			label="Discount type"
			required
			class="flex-1/3"
			size="md"
			bind:value={type}
			disabled={!isCreatePage || disabled}
			onblur={validate}
			onchange={validate}
			variant={promotionFormErrors?.type?.length ? 'error' : 'info'}
			subText={promotionFormErrors?.type?.[0]}
		/>
		<Input
			placeholder="Promotion name"
			label="Promotion name"
			required
			class="flex-2/3"
			size="md"
			bind:value={name}
			{disabled}
			variant={promotionFormErrors?.name?.length ? 'error' : 'info'}
			subText={promotionFormErrors?.name?.[0]}
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
		/>
	</div>

	<EditorJSComponent
		label="Promotion description"
		required
		placeholder="Promotion description"
		bind:value={description}
		{disabled}
		variant={promotionFormErrors?.description?.length ? 'error' : 'info'}
		subText={promotionFormErrors?.description?.[0]}
		onchange={validate}
	/>

	<div class="gap-2 grid grid-cols-2">
		<EaseDatePicker
			required
			label="Start date"
			placeholder="Start date"
			value={{ date: startDate }}
			{disabled}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
				validate();
			}}
			variant={promotionFormErrors?.startDate?.length ? 'error' : 'info'}
			subText={promotionFormErrors?.startDate?.[0]}
			onblur={validate}
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
			label="End date"
			placeholder="End date"
			value={{ date: endDate }}
			{disabled}
			onchange={(value) => {
				endDate = dayjs(value.date).format(RFC3339TimeFormat);
				validate();
			}}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			onblur={validate}
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
