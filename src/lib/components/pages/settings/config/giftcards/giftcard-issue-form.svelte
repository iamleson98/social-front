<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		CUSTOMER_LIST_QUERY,
		GIFT_CARD_CREATE_MUTATION,
		GIFT_CARD_TAGS_QUERY,
	} from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type {
		GiftCardCreateInput,
		Mutation,
		MutationGiftCardCreateArgs,
		QueryCustomersArgs,
		QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { array, number, object, string, z } from 'zod';

	type Props = {
		open: boolean;
		toCustomerEmail?: string;
	};

	let { open = $bindable(), toCustomerEmail }: Props = $props();

	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: '',
		channel: '',
		balance: {
			amount: 0,
			currency: '',
		},
		isActive: false,
		note: '',
	});
	let loading = $state(false);
	let issuedGiftcardCode = $state<string>();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const giftcardSchema = object({
		amount: number(),
		currency: string().nonempty(REQUIRED_ERROR),
		channel: string().nonempty(REQUIRED_ERROR),
		note: string().nonempty(REQUIRED_ERROR),
		addTags: array(string()),
	});

	type GiftcardSchema = z.infer<typeof giftcardSchema>;
	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardSchema, string[]>>>({});

	const validate = () => {
		const parseResult = giftcardSchema.safeParse({
			amount: Number(giftCardInput.balance.amount),
			currency: giftCardInput.balance.currency,
			addTags: giftCardInput.addTags,
			channel: giftCardInput.channel,
			note: giftCardInput.note,
		});
		if (!parseResult.success) {
			giftcardFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		giftcardFormErrors = {};
		return true;
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
</script>

<Modal
	{open}
	size="md"
	header="Issue new gift card"
	onClose={() => (open = false)}
	onOk={handleIssueGiftcard}
	onCancel={() => (open = false)}
>
	<div class="flex flex-col gap-3">
		{#if issuedGiftcardCode}
			<Alert variant="success" size="md" bordered>
				<div class="flex items-center gap-2">
					<span>Successfully issued giftcard with code:</span>
					<span class="rounded-lg border border-green-200 px-2 py-1">{issuedGiftcardCode}</span>
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
				variant={giftcardFormErrors.amount?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.amount?.[0]}
				disabled={loading}
			/>
			<ShopCurrenciesSelect size="sm" label="Currency" class="flex-1" />
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
			bind:value={giftCardInput.addTags}
			disabled={loading}
		/>

		<!-- <Input label="Customer" value={userName} disabled size="sm" /> -->

		<GraphqlPaginableSelect
			query={CUSTOMER_LIST_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
			resultKey="customers"
			optionLabelKey="email"
			optionValueKey="email"
			size="sm"
			label="To Customer"
			requestPolicy="cache-and-network"
			bind:value={giftCardInput.userEmail}
			disabled={loading}
		/>

		<Alert size="sm" bordered>
			Selected customer will be sent the generated gift card code. Someone else can redeem the gift
			card code. Gift card will be assigned to account which redeemed the code.
		</Alert>

		<ChannelSelect
			label="Channel"
			size="sm"
			bind:value={giftCardInput.channel}
			subText="Customer will be sent the gift card code via this channels email address"
			disabled={loading}
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
		/>
		<Checkbox label="Active" bind:checked={giftCardInput.isActive} disabled={loading} />
	</div>
</Modal>
