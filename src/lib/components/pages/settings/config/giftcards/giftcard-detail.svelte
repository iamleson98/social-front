<script lang="ts">
	import { GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, CircleCheck, Send } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		type GiftCardUpdateInput,
		type GiftCard,
		type QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import MetadataEditor from '../../common/metadata-editor.svelte';
	import GiftcardEvents from './giftcard-events.svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { GiftcardUtil } from './utils.svelte';

	type Props = {
		giftcard: GiftCard;
		disabled?: boolean;
	};

	let { giftcard, disabled }: Props = $props();
	const giftcardUtils = new GiftcardUtil();

	let loading = $derived(giftcardUtils.loading);

	let giftCardInput = $state<GiftCardUpdateInput>({
		addTags: giftcard.tags.map((item) => item.id),
		expiryDate: giftcard.expiryDate,
	});
</script>

<div class="w-7/10 flex flex-col gap-2">
	<div class="rounded-lg border border-gray-200 bg-white flex flex-col gap-3 p-3">
		<SectionHeader class="flex items-center justify-between">
			<div>
				<span>Giftcard details</span>
				<Badge
					text={giftcard.isActive ? 'Active' : 'Disabled'}
					color={giftcard.isActive ? 'green' : 'red'}
					rounded
					variant="light"
					size="sm"
				/>
			</div>
			<div class="flex gap-1 items-center">
				<Button
					size="xs"
					color={giftcard.isActive ? 'red' : 'green'}
					variant="light"
					startIcon={giftcard.isActive ? Ban : CircleCheck}
					onclick={() => giftcardUtils.handleToggleGiftcardStatus(giftcard.id, !giftcard.isActive)}
					disabled={loading}
				>
					{giftcard.isActive ? 'Deactivate' : 'Activate'}
				</Button>
				<Button size="xs" startIcon={Send} color="violet" disabled={loading}>Resend code</Button>
			</div>
		</SectionHeader>

		<div class="flex items-center gap-2">
			<Input
				size="sm"
				type="number"
				min={1}
				placeholder="Amount"
				label="Money amount"
				class="flex-2/3"
				value={giftcard.currentBalance.amount}
				required
			/>
			<Input
				readonly
				value={giftcard.currentBalance.currency}
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
			optionValueKey="id"
			optionLabelKey="name"
			size="sm"
			requestPolicy="cache-and-network"
			multiple
			label="Giftcard Tags"
			placeholder="Giftcard tags"
			bind:value={giftCardInput.addTags}
			{disabled}
		/>

		<GiftcardExpirationForm {disabled} expiryDate={giftCardInput.expiryDate} />
	</div>

	<div class="p-3 rounded-lg border border-gray-200 bg-white flex flex-col gap-3">
		<MetadataEditor title="Metadata" data={giftcard.metadata} />
		<MetadataEditor title="Private Metadata" data={giftcard.privateMetadata} />
	</div>

	<div class="p-3 rounded-lg border border-gray-200 bg-white flex flex-col gap-3">
		<SectionHeader>Giftcard timeline</SectionHeader>
		<GiftcardEvents id={giftcard.id} />
	</div>
</div>
