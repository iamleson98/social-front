<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_CREATE_MUTATION } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Modal } from '$lib/components/ui/Modal';
	import type { GiftCardCreateInput, Mutation, MutationGiftCardCreateArgs } from '$lib/gql/graphql';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { array, number, object, string } from 'zod';

	type Props = {
		userEmail?: string;
	};

	let { userEmail }: Props = $props();

	let openCreateGiftcardModal = $state(false);
	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: userEmail,
		channel: '',
		balance: {
			amount: 0,
			currency: '',
		},
		isActive: false,
		note: '',
	});

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const customerSchema = object({
		amount: number(),
		currency: string().nonempty(REQUIRED_ERROR),
		channel: string().nonempty(REQUIRED_ERROR),
		note: string().nonempty(REQUIRED_ERROR),
		addTags: array(string()).nonempty(REQUIRED_ERROR),
	});

	const validate = () => {
		const parseResult = customerSchema.safeParse({
			amount: Number(giftCardInput.balance.amount),
			currency: giftCardInput.balance.currency,
			addTags: giftCardInput.addTags,
			channel: giftCardInput.channel,
			note: giftCardInput.note,
		});
		if (!parseResult.success) {
			customerFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};

	const addNewCard = async () => {
		if (!validate()) return;
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardCreate'>,
			MutationGiftCardCreateArgs
		>(GIFT_CARD_CREATE_MUTATION, {
			input: {
				addTags: giftCardInput.addTags,
				userEmail: giftCardInput.userEmail,
				channel: giftCardInput.channel,
				balance: {
					amount: giftCardInput.balance.amount,
					currency: giftCardInput.balance.currency,
				},
				isActive: giftCardInput.isActive,
				note: giftCardInput.note,
			},
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'giftCardCreate', 'Gift card created successfully')) {
			return;
		}
		newCardId = (result.data?.giftCardCreate?.giftCard?.id as string).slice(0, -1);
		isAddCardModalOpen = false;
		isNewCardModalOpen = true;
	};
</script>

<Modal
	open={openCreateGiftcardModal}
	header="Issue new gift card"
	size="sm"
	onCancel={() => (openCreateGiftcardModal = false)}
	onClose={() => (openCreateGiftcardModal = false)}
	onOk={addNewCard}
>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-3 items-start">
			<Input
				label="Amount"
				bind:value={giftCardInput.balance.amount}
				required
				type="number"
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.amount?.length ? 'error' : 'info'}
				subText={customerFormErrors.amount?.[0]}
			/>
			<Select
				label="Currency"
				options={currencyOptions}
				placeholder="Select a currency"
				bind:value={giftCardInput.balance.currency}
				onchange={validate}
				required
				onblur={validate}
				variant={customerFormErrors.currency?.length ? 'error' : 'info'}
				subText={customerFormErrors.currency?.[0]}
			/>
		</div>

		{#if $queryGiftCardTags.data?.giftCardTags?.edges?.length}
			{@const tags = $queryGiftCardTags.data?.giftCardTags?.edges?.map<SelectOption>((tag) => ({
				value: tag.node.id,
				label: tag.node.name,
			}))}
			<MultiSelect
				size="sm"
				options={tags}
				onchange={handleAddTags}
				label="Select tags"
				bind:value={selectedTagOptions}
				class="w-full"
				required
				onblur={validate}
				variant={customerFormErrors.addTags?.length ? 'error' : 'info'}
				subText={customerFormErrors.addTags?.[0]}
			/>
		{/if}

		<Input label="Customer" value={userName} disabled />
		{#if $queryChannel.data?.channels?.length}
			{@const channels = $queryChannel.data?.channels?.map<SelectOption>((channel) => ({
				value: channel.name,
				label: channel.name,
			}))}
			<Select
				label="Channel"
				options={channels}
				placeholder="Select a channel"
				bind:value={giftCardInput.channel as string}
				required
				onblur={validate}
				variant={customerFormErrors.channel?.length ? 'error' : 'info'}
				subText={customerFormErrors.channel?.[0]}
			/>
		{/if}

		<Input
			label="Note"
			bind:value={giftCardInput.note}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.note?.length ? 'error' : 'info'}
			subText={customerFormErrors.note?.[0]}
		/>
		<Checkbox label="Active" bind:checked={giftCardInput.isActive} />
	</div>
</Modal>
