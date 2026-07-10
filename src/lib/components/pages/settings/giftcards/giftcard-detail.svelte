<script lang="ts">
	import { T } from '$i18n';
	import { GIFT_CARD_RESEND_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, CircleCheck, Send } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		type QueryGiftCardTagsArgs,
		type QueryCustomersArgs,
		type Mutation,
		type MutationGiftCardResendArgs,
		type MetadataItem,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { GiftcardChannelMetadataKey, GiftcardUserEmailMetadataKey } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { difference } from 'es-toolkit';
	import { toast } from 'svelte-sonner';
	import { array, number, object, string } from 'zod';

	type Props = {
		id: string;
		balanceAmount: number;
		expiryDate: string;
		isActive: boolean;
		addTags: string[];
		disabled?: boolean;
		removeTags: string[];
		metadata: MetadataItem[];
		balanceCurrency: string;
		onActiveChange: (active: boolean) => void;
		/** tag ids that already in use */
		existingTags: string[];
	};

	let {
		balanceAmount = $bindable(),
		expiryDate = $bindable(),
		isActive,
		addTags = $bindable([]),
		disabled,
		removeTags = $bindable(),
		id,
		metadata = [],
		balanceCurrency,
		onActiveChange,
		existingTags = [],
	}: Props = $props();

	let openResendModal = $state(false);
	let activeTags = $state(existingTags);

	let giftCardChannel = $state(
		metadata?.find((item) => item.key === GiftcardChannelMetadataKey)?.value,
	);
	let customerEmailOfGiftcard = $state(
		metadata?.find((item) => item.key === GiftcardUserEmailMetadataKey)?.value,
	);

	let loading = $state(false);

	const GiftcardUpdateSchema = object({
		balanceAmount: number().min(1, $CommonState.NonNegativeError),
		expiryDate: string().optional(),
		addTags: array(string().nonempty($CommonState.FieldRequiredError)).optional(),
		removeTags: array(string().nonempty($CommonState.FieldRequiredError)).optional(),
	});
	const SchemaHandler = createSchemaHandler(GiftcardUpdateSchema, () => ({
		balanceAmount,
		expiryDate,
		addTags,
		removeTags,
	}));

	const handleTagsChange = () => {
		addTags = difference(activeTags, existingTags);
		removeTags = difference(existingTags, activeTags);
		SchemaHandler.validate();
	};

	const handleResendGiftcard = async () => {
		if (!giftCardChannel) {
			toast.error($T('giftcard.specifyChannel'));
			return;
		}

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardResend'>,
			MutationGiftCardResendArgs
		>(GIFT_CARD_RESEND_MUTATION, {
			input: {
				id,
				channel: giftCardChannel,
				email: customerEmailOfGiftcard,
			},
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'giftCardResend',
				$T('giftcard.events.giftcardResent'),
			)
		)
			return;

		openResendModal = false;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>
			<span>{$T('giftcard.title')}</span>
			<Badge
				text={$T(isActive ? 'staff.active' : 'giftcard.status.deactivated')}
				color={isActive ? 'green' : 'red'}
				rounded
				variant="light"
				size="sm"
			/>
		</div>
		<div class="flex gap-1 items-center">
			<Button
				size="xs"
				color={isActive ? 'red' : 'green'}
				endIcon={isActive ? Ban : CircleCheck}
				onclick={() => onActiveChange(!isActive)}
				disabled={loading || disabled}
			>
				{$T(isActive ? 'giftcard.deactivate' : 'giftcard.activate')}
			</Button>
			<Button
				size="xs"
				endIcon={Send}
				color="violet"
				disabled={loading || disabled}
				onclick={() => (openResendModal = true)}>{$T('giftcard.resendCode')}</Button
			>
		</div>
	</SectionHeader>

	<div class="flex items-start gap-2">
		<Input
			size="sm"
			type="number"
			min={1}
			placeholder={$T('giftcard.form.amount')}
			label={$T('giftcard.form.amount')}
			class="flex-2/3"
			bind:value={balanceAmount}
			disabled={loading || disabled}
			required
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.balanceAmount?.length ? 'error' : 'info'}
			subText={$SchemaHandler.balanceAmount?.[0]}
		/>
		<Input
			readonly
			value={balanceCurrency}
			label={$T('common.currency')}
			required
			size="sm"
			class="flex-1/3"
			disabled
		/>
	</div>
	<GraphqlPaginableSelect
		query={GIFT_CARD_TAGS_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
		resultKey="giftCardTags"
		variableSearchQueryPath="filter.search"
		optionValueKey="name"
		optionLabelKey="name"
		size="sm"
		requestPolicy="cache-and-network"
		multiple
		label={$T('giftcard.form.tags')}
		placeholder={$T('giftcard.form.tags')}
		bind:value={activeTags}
		onchange={handleTagsChange}
		{disabled}
	/>

	<GiftcardExpirationForm {disabled} bind:expiryDate />
</div>

<Modal
	size="sm"
	open={openResendModal}
	header={$T('giftcard.resendCode')}
	onClose={() => (openResendModal = false)}
	onCancel={() => (openResendModal = false)}
	okText={$T('giftcard.resendCode')}
	onOk={handleResendGiftcard}
	disableElements={loading || disabled}
>
	<div class="flex flex-col gap-2">
		<Alert size="sm">
			{$T('giftcard.resendCodeAlert')}
		</Alert>
		<ChannelSelect
			size="sm"
			bind:value={giftCardChannel}
			disabled={loading || disabled}
			label={$T('giftcard.form.channel')}
			placeholder={$T('giftcard.form.channel')}
			required
		/>
		<GraphqlPaginableSelect
			query={CUSTOMER_LIST_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
			resultKey="customers"
			optionLabelKey="email"
			optionValueKey="email"
			size="sm"
			label={$T('giftcard.form.customer')}
			placeholder={$T('giftcard.form.customer')}
			requestPolicy="cache-and-network"
			bind:value={customerEmailOfGiftcard}
			disabled={loading || disabled}
			subText={$T('giftcard.form.customerSubtext')}
			onchange={SchemaHandler.validate}
		/>
	</div>
</Modal>
