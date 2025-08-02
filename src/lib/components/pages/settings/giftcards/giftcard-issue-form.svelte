<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_CREATE_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { ClipboardCopy } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
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
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';
	import { array, number, object, string, z } from 'zod';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { GiftcardChannelMetadataKey, GiftcardUserEmailMetadataKey } from '$lib/utils/consts';
	import { METADATA_UPDATE_MUTATION } from '$lib/api/admin/metadata';

	type Props = {
		open: boolean;
		toCustomerEmail?: string;
		onSuccess?: (gc: GiftCard) => void;
	};

	let { open = $bindable(), toCustomerEmail }: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const NOTE_MAX_LENGTH = 300;

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
	let issuedGiftcardCode = $state<string>('');

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

		if (checkIfGraphqlResultHasError(result, 'giftCardCreate', 'Giftcard issued successfully'))
			return;

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
		checkIfGraphqlResultHasError(metaResult, 'updateMetadata');
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
	<div class="space-y-2">
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

		<GiftcardExpirationForm disabled={loading} bind:expiryDate={giftCardInput.expiryDate} />

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
