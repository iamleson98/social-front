<script lang="ts">
	import { GIFT_CARD_CREATE_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, TextArea } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type {
		GiftCard,
		GiftCardCreateInput,
		MetadataInput,
		Mutation,
		MutationGiftCardCreateArgs,
		MutationUpdateMetadataArgs,
		QueryCustomersArgs,
		QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import type z from 'zod';
	import { array, number, object, string } from 'zod';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { GiftcardChannelMetadataKey, GiftcardUserEmailMetadataKey } from '$lib/utils/consts';
	import { METADATA_UPDATE_MUTATION } from '$lib/api/admin/metadata';
	import { tranFunc } from '$i18n';

	type Props = {
		toCustomerEmail?: string;
		onCreateSuccess?: (gc: GiftCard) => void;
		disabled?: boolean;
		triggerCreate: boolean;
		formOk: boolean;
	};

	let {
		toCustomerEmail,
		onCreateSuccess,
		disabled,
		triggerCreate = $bindable(),
		formOk = $bindable(),
	}: Props = $props();
	let issuedGiftcardCode = $state<string>('');
	const NOTE_MAX_LENGTH = 300;
	let loading = $state(false);

	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: toCustomerEmail,
		channel: '',
		balance: {
			amount: 0,
			currency: '',
		},
		isActive: true,
		note: '',
		expiryDate: '',
	});

	const giftcardSchema = object({
		channel: string().nonempty(CommonState.FieldRequiredError),
		note: string()
			.max(NOTE_MAX_LENGTH, `Note must be at most ${NOTE_MAX_LENGTH} characters.`)
			.optional(),
		addTags: array(string().nonempty(CommonState.FieldRequiredError)),
		amount: number().min(1, 'Please provide positive amount'),
		currency: string().nonempty(CommonState.FieldRequiredError),
		userEmail: string().email('Please provide valid email').optional(),
	});

	type GiftcardSchema = z.infer<typeof giftcardSchema>;
	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardSchema, string[]>>>({});

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

	$effect(() => {
		formOk = !Object.keys(giftcardFormErrors).length;
	});

	const handleIssueGiftcard = async () => {
		// validate for error first
		if (!validate()) return;

		// perform creation
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardCreate'>,
			MutationGiftCardCreateArgs
		>(GIFT_CARD_CREATE_MUTATION, {
			input: giftCardInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardCreate')) return;

		// post success handling
		issuedGiftcardCode = result.data?.giftCardCreate?.giftCard?.code!;

		// create metadata for this giftcard
		const metas: MetadataInput[] = [];
		if (giftCardInput.userEmail) {
			metas.push({
				key: GiftcardUserEmailMetadataKey,
				value: giftCardInput.userEmail,
			});
		}
		if (giftCardInput.channel) {
			metas.push({
				key: GiftcardChannelMetadataKey,
				value: giftCardInput.channel,
			});
		}

		if (!metas.length) return;

		const metaResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'updateMetadata'>,
			MutationUpdateMetadataArgs
		>(METADATA_UPDATE_MUTATION, {
			id: result.data?.giftCardCreate?.giftCard?.id!,
			input: metas,
		});
		if (
			checkIfGraphqlResultHasError(metaResult, 'updateMetadata', $tranFunc('common.createSuccess'))
		)
			return;

		onCreateSuccess?.(result.data?.giftCardCreate?.giftCard!);
	};

	$effect(() => {
		if (triggerCreate) {
			handleIssueGiftcard().finally(() => (triggerCreate = false));
		}
	});
</script>

<div class="space-y-2">
	<div class="flex flex-row gap-3 items-start">
		<Input
			label="Amount"
			bind:value={giftCardInput.balance.amount}
			required
			type="number"
			class="flex-1"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			{disabled}
			min={0}
			variant={giftcardFormErrors.amount?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.amount?.[0]}
			placeholder="Money amount"
		/>
		<ShopCurrenciesSelect
			label="Currency"
			class="flex-1"
			variant={giftcardFormErrors.currency?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.currency?.[0]}
			required
			placeholder="Currency"
			onchange={validate}
			bind:value={giftCardInput.balance.currency}
			{disabled}
		/>
	</div>

	<GraphqlPaginableSelect
		query={GIFT_CARD_TAGS_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
		resultKey="giftCardTags"
		variableSearchQueryPath="filter.search"
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		multiple
		label="Giftcard Tags"
		placeholder="Giftcard tags"
		bind:value={giftCardInput.addTags}
		{disabled}
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
		label="To Customer"
		placeholder="Specify customer"
		requestPolicy="cache-and-network"
		bind:value={giftCardInput.userEmail}
		disabled={disabled || !!toCustomerEmail}
		variant={giftcardFormErrors.userEmail?.length ? 'error' : 'info'}
		subText={giftcardFormErrors.userEmail?.[0]}
		onchange={validate}
	/>

	<Alert bordered size="sm">
		Selected customer will be sent the generated gift card code. Someone else can redeem the gift
		card code. Gift card will be assigned to account which redeemed the code.
	</Alert>

	<GiftcardExpirationForm {disabled} bind:expiryDate={giftCardInput.expiryDate} />

	<ChannelSelect
		label="Channel"
		bind:value={giftCardInput.channel}
		{disabled}
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
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		inputClass="min-h-20"
		{disabled}
		variant={giftcardFormErrors.note?.length ? 'error' : 'info'}
		subText={giftcardFormErrors.note?.[0] ??
			'Why was this gift card issued. This note will not be shown to the customer. Note will be stored in gift card history'}
		placeholder="Note for this giftcard"
	/>
	<Checkbox
		label="Active"
		bind:checked={giftCardInput.isActive}
		{disabled}
		subText="All issued cards require activation by staff before use."
	/>
</div>
