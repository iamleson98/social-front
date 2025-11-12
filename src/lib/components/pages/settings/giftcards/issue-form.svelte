<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_CREATE_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { METADATA_UPDATE_MUTATION } from '$lib/api/admin/metadata';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
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
	import { GiftcardChannelMetadataKey, GiftcardUserEmailMetadataKey } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { omit } from 'es-toolkit';
	import { array, email, number, object, string } from 'zod';

	type Props = {
		toCustomerEmail?: string;
		onCreateSuccess?: (gc: GiftCard) => void;
		loading?: boolean;
		triggerCreate: boolean;
		formOk: boolean;
	};

	let {
		toCustomerEmail,
		onCreateSuccess,
		loading = $bindable(),
		triggerCreate = $bindable(),
		formOk = $bindable(),
	}: Props = $props();
	const NOTE_MAX_LENGTH = 300;

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
		channel: string().nonempty($CommonState.FieldRequiredError),
		note: string()
			.max(
				NOTE_MAX_LENGTH,
				$tranFunc('error.lengthInvalid', {
					name: $tranFunc('giftcard.form.note'),
					max: NOTE_MAX_LENGTH,
					min: 1,
				}),
			)
			.optional(),
		amount: number().min(1, $CommonState.NonNegativeError),
		currency: string().nonempty($CommonState.FieldRequiredError),
		addTags: array(string().nonempty($CommonState.FieldRequiredError)),
		userEmail: email($CommonState.InvalidEmail).optional(),
	});
	const SchemaHandler = createSchemaHandler(
		giftcardSchema,
		() => ({
			...omit(giftCardInput, ['balance']),
			amount: giftCardInput.balance.amount,
			currency: giftCardInput.balance.currency,
		}),
		(ok) => (formOk = ok),
	);

	const handleIssueGiftcard = async () => {
		// validate for error first
		if (!SchemaHandler.validate()) return;

		// perform creation
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardCreate'>,
			MutationGiftCardCreateArgs
		>(GIFT_CARD_CREATE_MUTATION, {
			input: giftCardInput,
		});

		if (checkIfGraphqlResultHasError(result, 'giftCardCreate')) {
			loading = false;
			return;
		}

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
		loading = false;

		if (checkIfGraphqlResultHasError(metaResult, 'updateMetadata', $CommonState.CreateSuccess))
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
			label={$tranFunc('giftcard.form.amount')}
			bind:value={giftCardInput.balance.amount}
			required
			type="number"
			class="flex-1"
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			disabled={loading}
			min={0}
			variant={$SchemaHandler.amount?.length ? 'error' : 'info'}
			subText={$SchemaHandler.amount?.[0]}
		/>
		<ShopCurrenciesSelect
			label={$tranFunc('common.currency')}
			class="flex-1"
			variant={$SchemaHandler.currency?.length ? 'error' : 'info'}
			subText={$SchemaHandler.currency?.[0]}
			required
			onchange={SchemaHandler.validate}
			onblur={SchemaHandler.validate}
			bind:value={giftCardInput.balance.currency}
			disabled={loading}
		/>
	</div>

	<GraphqlPaginableSelect
		query={GIFT_CARD_TAGS_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
		resultKey="giftCardTags"
		variableSearchQueryPath="filter.search"
		optionValueKey="name"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		multiple
		label={$tranFunc('giftcard.form.tags')}
		bind:value={giftCardInput.addTags}
		disabled={loading}
		variant={$SchemaHandler.addTags?.length ? 'error' : 'info'}
		subText={$SchemaHandler.addTags?.[0]}
		onchange={SchemaHandler.validate}
	/>

	<GraphqlPaginableSelect
		query={CUSTOMER_LIST_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
		resultKey="customers"
		optionLabelKey="email"
		optionValueKey="email"
		label={$tranFunc('giftcard.form.customer')}
		requestPolicy="cache-and-network"
		bind:value={giftCardInput.userEmail}
		disabled={loading || !!toCustomerEmail}
		variant={$SchemaHandler.userEmail?.length ? 'error' : 'info'}
		subText={$SchemaHandler.userEmail?.[0]}
		onchange={SchemaHandler.validate}
	/>

	<Alert bordered size="sm">
		{$tranFunc('giftcard.issueFormAlert')}
	</Alert>

	<GiftcardExpirationForm disabled={loading} bind:expiryDate={giftCardInput.expiryDate} />

	<ChannelSelect
		label={$tranFunc('giftcard.form.channel')}
		bind:value={giftCardInput.channel}
		disabled={loading}
		variant={$SchemaHandler.channel?.length ? 'error' : 'info'}
		subText={$SchemaHandler.channel?.[0] ?? $tranFunc('giftcard.form.channelSubText')}
		required
		onchange={SchemaHandler.validate}
		onblur={SchemaHandler.validate}
	/>

	<TextArea
		label={$tranFunc('giftcard.form.note')}
		bind:value={giftCardInput.note}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		inputClass="min-h-20"
		disabled={loading}
		variant={$SchemaHandler.note?.length ? 'error' : 'info'}
		subText={$SchemaHandler.note?.[0] ?? $tranFunc('giftcard.form.noteSubText')}
	/>
	<Checkbox
		label={$tranFunc('giftcard.activate')}
		bind:checked={giftCardInput.isActive}
		disabled={loading}
		subText={$tranFunc('giftcard.form.activeSubText')}
	/>
</div>
