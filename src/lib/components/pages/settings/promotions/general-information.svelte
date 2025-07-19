<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { PromotionTypeEnum } from '$lib/gql/graphql';
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

	const RequiredErr = $tranFunc('helpText.fieldRequired');

	const PromotionSchema = object({
		name: string().nonempty(RequiredErr),
		type: string().nonempty(RequiredErr),
		description: object({
			blocks: array(any()).min(1, RequiredErr),
		}).nullable(),
		startDate: string().nonempty(RequiredErr),
	});

	type PromotionSchema = z.infer<typeof PromotionSchema>;

	let promotionFormErrors = $state.raw<Partial<Record<keyof PromotionSchema, string[]>>>({});

	const DiscountTypeOptions = Object.values(PromotionTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	$effect(() => {
		ok = !Object.keys(promotionFormErrors).length;
	});

	const validate = () => {
		const parseResult = PromotionSchema.safeParse({
			name,
			type,
			description,
			startDate,
			endDate,
		});
		promotionFormErrors = parseResult.success ? {} : parseResult.error.formErrors.fieldErrors;
		return parseResult.success;
	};
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
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

	<div class="flex items-start gap-2">
		<EaseDatePicker
			label="Start date"
			placeholder="Start date"
			required
			class="flex-1"
			value={{ date: startDate }}
			{disabled}
			onchange={(value) => (startDate = dayjs(value.start).format(RFC3339TimeFormat))}
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
			class="flex-1"
			value={{ date: endDate }}
			{disabled}
			onchange={(value) => (endDate = dayjs(value.start).format(RFC3339TimeFormat))}
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
