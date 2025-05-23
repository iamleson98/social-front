<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_CREATE_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { ClipboardCopy } from '$lib/components/icons';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import type {
		GiftCard,
		GiftCardCreateInput,
		Mutation,
		MutationGiftCardCreateArgs,
		QueryCustomersArgs,
		QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';
	import { array, number, object, string, z } from 'zod';

	type Props = {
		open: boolean;
		toCustomerEmail?: string;
		onSuccess?: (gc: GiftCard) => void;
	};

	let { open = $bindable(), toCustomerEmail }: Props = $props();

	type ExpiryType = 'in' | 'exact';
	// type ExpiryInUnit = 'year' | 'month' | 'day';

	const NOW = dayjs();
	const EXPIRY_TYPES: ExpiryType[] = ['exact', 'in'];
	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const NOTE_MAX_LENGTH = 300;
	const EXPIRY_IN_OPTIONS: dayjs.ManipulateType[] = ['day', 'month', 'year'];
	const giftcardSchema = object({
		channel: string().nonempty(REQUIRED_ERROR),
		note: string()
			.max(NOTE_MAX_LENGTH, `Note must be at most ${NOTE_MAX_LENGTH} characters.`)
			.optional(),
		addTags: array(string().nonempty(REQUIRED_ERROR)),
		amount: number().min(1, 'Please provide positive amount'),
		currency: string().nonempty(REQUIRED_ERROR),
		userEmail: string().email('Please provide valid email').optional(),
	});

	type GiftcardSchema = z.infer<typeof giftcardSchema>;
	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardSchema, string[]>>>({});

	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: toCustomerEmail,
		channel: '',
		balance: {
			amount: 0,
			currency: '',
		},
		isActive: false,
		note: '',
		expiryDate: '',
	});
	let loading = $state(false);
	let issuedGiftcardCode = $state<string>();
	let expiryType = $state<ExpiryType>('in');
	let expireInAmount = $state<number>(1);
	let expireInUnit = $state<dayjs.ManipulateType>('month');
	let setExpiryDate = $state(false);

	$effect(() => {
		if (!setExpiryDate) {
			if (giftCardInput.expiryDate !== undefined) giftCardInput.expiryDate = undefined;
			return;
		}
		if (expiryType === 'in' && expireInAmount && expireInUnit) {
			giftCardInput.expiryDate = NOW.add(expireInAmount, expireInUnit).format('YYYY-MM-DD');
		}
	});

	$effect(() => {
		if (expireInAmount < 0) expireInAmount = 1;
	});

	const validate = () => {
		const parseResult = giftcardSchema.safeParse({
			channel: giftCardInput.channel,
			note: giftCardInput.note,
			addTags: giftCardInput.addTags,
			amount: giftCardInput.balance.amount,
			currency: giftCardInput.balance.currency,
			userEmail: giftCardInput.userEmail,
		});

		giftcardFormErrors = parseResult.success ? {} : parseResult.error?.formErrors.fieldErrors;
		return parseResult.success;
	};

	const handleIssueGiftcard = async () => {
		if (!validate()) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardCreate'>,
			MutationGiftCardCreateArgs
		>(GIFT_CARD_CREATE_MUTATION, {
			input: giftCardInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardCreate', 'Giftcard issued successfully'))
			return;

		issuedGiftcardCode = result.data?.giftCardCreate?.giftCard?.code;
	};

	const handleClickCopyCode = () => {
		if (!issuedGiftcardCode) return;
		navigator.clipboard
			.writeText(issuedGiftcardCode)
			.then(() => toast.success(`Copied giftcard code ${issuedGiftcardCode} to clipboard.`));
	};
</script>

<Modal
	{open}
	size="md"
	header="Issue new gift card"
	onClose={() => (open = false)}
	onOk={handleIssueGiftcard}
	onCancel={() => (open = false)}
	disableElements={loading}
>
	<div class="flex flex-col gap-3">
		{#if issuedGiftcardCode}
			<Alert variant="success" size="md" bordered>
				<div class="">
					<p>Successfully issued giftcard with code:</p>
					<div class="flex items-center gap-2">
						<Badge text={issuedGiftcardCode} color="green" />
						<IconButton
							size="xs"
							icon={ClipboardCopy}
							variant="light"
							rounded
							onclick={handleClickCopyCode}
						/>
					</div>
				</div>
			</Alert>
		{/if}
		<div class="flex flex-row gap-3 items-start">
			<Input
				label="Amount"
				bind:value={giftCardInput.balance.amount}
				required
				type="number"
				size="sm"
				class="flex-1"
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				disabled={loading}
				min={0}
				variant={giftcardFormErrors.amount?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.amount?.[0]}
				placeholder="Money amount"
			/>
			<ShopCurrenciesSelect
				size="sm"
				label="Currency"
				class="flex-1"
				variant={giftcardFormErrors.currency?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.currency?.[0]}
				required
				placeholder="Currency"
				onchange={validate}
				bind:value={giftCardInput.balance.currency}
				disabled={loading}
			/>
		</div>

		<GraphqlPaginableSelect
			query={GIFT_CARD_TAGS_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
			resultKey="giftCardTags"
			variableSearchQueryPath="filter.search"
			optionValueKey="id"
			optionLabelKey="name"
			size="sm"
			requestPolicy="cache-and-network"
			multiple
			label="Giftcard Tags"
			placeholder="Giftcard tags"
			bind:value={giftCardInput.addTags}
			disabled={loading}
			variant={giftcardFormErrors.addTags?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.addTags?.[0]}
			onchange={validate}
		/>

		<GraphqlPaginableSelect
			query={CUSTOMER_LIST_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
			resultKey="customers"
			optionLabelKey="email"
			optionValueKey="email"
			size="sm"
			label="To Customer"
			placeholder="Specify customer"
			requestPolicy="cache-and-network"
			bind:value={giftCardInput.userEmail}
			disabled={loading || !!toCustomerEmail}
			variant={giftcardFormErrors.userEmail?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.userEmail?.[0]}
			onchange={validate}
		/>

		<Alert size="sm" bordered>
			Selected customer will be sent the generated gift card code. Someone else can redeem the gift
			card code. Gift card will be assigned to account which redeemed the code.
		</Alert>

		<Accordion
			header="Set gift card expiry date"
			bind:open={setExpiryDate}
			class="rounded-lg border border-gray-200 p-3"
		>
			<div class="flex items-center gap-2">
				{#each EXPIRY_TYPES as type, idx (idx)}
					<RadioButton
						class="flex-1"
						label={`Expires ${type}`}
						size="sm"
						value={type}
						bind:group={expiryType}
					/>
				{/each}
			</div>

			<div class="mt-2">
				{#if expiryType === 'exact'}
					<EaseDatePicker
						timeLock={{ minDate: NOW.toDate() }}
						timeConfig={false}
						placeholder="Set expiry date"
						label="Exact date"
						size="sm"
						value={{ date: giftCardInput.expiryDate }}
						allowSelectMonthYears={{
							showMonths: true,
							showYears: { min: NOW.year(), max: NOW.year() + 10 },
						}}
						onchange={(value) =>
							value?.date && (giftCardInput.expiryDate = dayjs(value.date).format('YYYY-MM-DD'))}
					/>
				{:else}
					{@const options = EXPIRY_IN_OPTIONS.map((item) => ({ value: item, label: item }))}
					<div class="flex items-start gap-2">
						<Input
							size="sm"
							placeholder="amount"
							type="number"
							min={1}
							class="flex-2/3"
							label="Amount"
							required
							bind:value={expireInAmount}
						/>
						<Select
							{options}
							placeholder="units"
							size="sm"
							class="flex-1/3"
							label="Unit"
							required
							bind:value={expireInUnit}
						/>
					</div>
				{/if}
			</div>

			<Alert size="sm" bordered class="mt-2">
				<div>Will expire on:</div>
				{#if giftCardInput.expiryDate}
					<Badge size="sm" text={giftCardInput.expiryDate} />
				{/if}
			</Alert>
		</Accordion>

		<ChannelSelect
			label="Channel"
			size="sm"
			bind:value={giftCardInput.channel}
			disabled={loading}
			variant={giftcardFormErrors.channel?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.channel?.[0] ??
				'Customer will be sent the gift card code via this channels email address'}
			placeholder="Please specify channel"
			required
			onchange={validate}
		/>

		<TextArea
			label="Note"
			bind:value={giftCardInput.note}
			required
			size="sm"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			inputClass="min-h-20"
			disabled={loading}
			variant={giftcardFormErrors.note?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.note?.[0] ??
				'Why was this gift card issued. This note will not be shown to the customer. Note will be stored in gift card history'}
			placeholder="Note for this giftcard"
		/>
		<Checkbox
			label="Active"
			size="sm"
			bind:checked={giftCardInput.isActive}
			disabled={loading}
			subText="All issued cards require activation by staff before use."
		/>
	</div>
</Modal>
