<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { GiftCard } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		giftcard: GiftCard;
	};

	let { giftcard }: Props = $props();

	const SECTIONS = [
		{
			title: 'Creation',
			content: dayjs(giftcard.created).format('YYYY/MM/DD'),
		},
		{
			title: 'Issued by',
			content: giftcard.createdByEmail,
		},
		{
			title: 'Order number',
			content: '-',
		},
		{
			title: 'Product bought to get gift card',
			content: '-',
		},
		{
			title: 'Used by',
			content: '-',
		},
	];
</script>

{#snippet inforSection({ title, content }: { title: string; content: unknown })}
	<div class="mb-2">
		<div class="text-xs text-gray-500">{title}</div>
		<div class="text-sm text-gray-700 font-medium">{content}</div>
	</div>
{/snippet}

<div class={[SitenameCommonClassName, 'w-3/10 tablet:w-full h-fit']}>
	<SectionHeader>Card information</SectionHeader>

	<div class="overflow-x-auto">
		{#each SECTIONS as section, idx (idx)}
			{@render inforSection(section)}
		{/each}
	</div>
</div>
