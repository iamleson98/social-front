<script lang="ts">
	import { GIFT_CARD_RESEND_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, CircleCheck, Send } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		type QueryGiftCardTagsArgs,
		type QueryCustomersArgs,
		type Mutation,
		type MutationGiftCardResendArgs,
		type MetadataItem,
	} from '$lib/gql/graphql';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { array, number, object, string, z } from 'zod';
	import { tranFunc } from '$i18n';
	import { difference } from 'es-toolkit';
	import { Modal } from '$lib/components/ui/Modal';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { GiftcardChannelMetadataKey, GiftcardUserEmailMetadataKey } from '$lib/utils/consts';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { Alert } from '$lib/components/ui/Alert';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { toast } from 'svelte-sonner';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';

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
	let activeTags = $state([...existingTags]);

	let giftCardChannel = $state(
		metadata?.find((item) => item.key === GiftcardChannelMetadataKey)?.value,
	);
	let customerEmailOfGiftcard = $state(
		metadata?.find((item) => item.key === GiftcardUserEmailMetadataKey)?.value,
	);

	let loading = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const GiftcardUpdateSchema = object({
		balanceAmount: number().min(1, 'Amount must be greater than 0'),
		expiryDate: string().optional(),
		addTags: array(string().nonempty(REQUIRED_ERROR)).optional(),
		removeTags: array(string().nonempty(REQUIRED_ERROR)).optional(),
	});

	type GiftcardUpdateSchema = z.infer<typeof GiftcardUpdateSchema>;

	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardUpdateSchema, string[]>>>({});

	const validate = () => {
		const result = GiftcardUpdateSchema.safeParse({
			balanceAmount,
			expiryDate,
			addTags,
			removeTags,
		});
		giftcardFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const handleTagsChange = () => {
		if (!activeTags.length) {
			addTags = [];
			removeTags = existingTags;
			return;
		}

		addTags = difference(activeTags, existingTags);
		removeTags = difference(existingTags, activeTags);
		validate();
	};

	const handleResendGiftcard = async () => {
		if (!giftCardChannel) {
			toast.warning('Please specify channel');
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

		if (checkIfGraphqlResultHasError(result, 'giftCardResend', 'Successfully resent giftcard'))
			return;

		openResendModal = false;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>
			<span>Giftcard details</span>
			<Badge
				text={isActive ? 'Active' : 'Disabled'}
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
				variant="light"
				startIcon={isActive ? Ban : CircleCheck}
				onclick={() => onActiveChange(!isActive)}
				disabled={loading || disabled}
			>
				{isActive ? 'Deactivate' : 'Activate'}
			</Button>
			<Button
				size="xs"
				startIcon={Send}
				color="violet"
				disabled={loading || disabled}
				onclick={() => (openResendModal = true)}>Resend code</Button
			>
		</div>
	</SectionHeader>

	<div class="flex items-start gap-2">
		<Input
			size="sm"
			type="number"
			min={1}
			placeholder="Set balance amount"
			label="Balance amount"
			class="flex-2/3"
			bind:value={balanceAmount}
			disabled={loading || disabled}
			required
			inputDebounceOption={{ onInput: validate }}
			variant={giftcardFormErrors.balanceAmount?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.balanceAmount?.[0]}
		/>
		<Input
			readonly
			value={balanceCurrency}
			label="Currency"
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
		label="Giftcard Tags"
		placeholder="Giftcard tags"
		bind:value={activeTags}
		onchange={handleTagsChange}
		{disabled}
	/>

	<GiftcardExpirationForm {disabled} bind:expiryDate />
</div>

<Modal
	size="sm"
	open={openResendModal}
	header="Resend giftcard code"
	onClose={() => (openResendModal = false)}
	onCancel={() => (openResendModal = false)}
	okText="Resend code to user"
	onOk={handleResendGiftcard}
	disableElements={loading || disabled}
>
	<div class="flex flex-col gap-2">
		<Alert size="sm">
			Gift Card Code will be resent to email provided during checkout. You can provide a different
			email address if you want to:
		</Alert>
		<ChannelSelect
			size="sm"
			bind:value={giftCardChannel}
			disabled={loading || disabled}
			label="Channel to send from"
			placeholder="Please specify channel"
			required
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
			bind:value={customerEmailOfGiftcard}
			disabled={loading || disabled}
			subText="Email of customer who received this giftcard"
			onchange={validate}
		/>
	</div>
</Modal>
