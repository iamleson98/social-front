<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		PostalCodeRuleInclusionTypeEnum,
		type ShippingMethodPostalCodeRule,
		type ShippingPostalCodeRulesCreateInputRange,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		existingCodeRules?: ShippingMethodPostalCodeRule[];
		addPostalCodeRules: ShippingPostalCodeRulesCreateInputRange[];
		deletePostalCodeRules: string[];
	};

	type PartialShippingMethodPostalCodeRule = Partial<ShippingMethodPostalCodeRule>;

	let {
		existingCodeRules = [],
		addPostalCodeRules = $bindable(),
		deletePostalCodeRules = $bindable(),
	}: Props = $props();

	const RuleColumns: TableColumnProps<PartialShippingMethodPostalCodeRule>[] = [
		{
			title: 'range',
			child: range,
		},
		{
			title: 'inclusion type',
			child: inclusionType,
		},
		{
			title: 'action',
			child: action,
		},
	];

	let displayingPostalCodeRules = $state<PartialShippingMethodPostalCodeRule[]>(existingCodeRules);
	let openAddRuleRangeModal = $state(false);
	let addRuleInclusionType = $state<PostalCodeRuleInclusionTypeEnum>(
		PostalCodeRuleInclusionTypeEnum.Include,
	);
	let addCodeRangeInput = $state<ShippingPostalCodeRulesCreateInputRange>({
		start: '',
	});

	const handleAddCodeRange = () => {
		if (!addCodeRangeInput.start) return;

		addPostalCodeRules.push({
			start: addCodeRangeInput.start.trim(),
			end: addCodeRangeInput.end?.trim(),
		});
		addCodeRangeInput = {
			start: '',
			end: '',
		};
		openAddRuleRangeModal = false;
	};
</script>

{#snippet range({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<span>{item.start ?? '-'} {item.end ?? '-'}</span>
{/snippet}

{#snippet inclusionType({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<Badge
		text={item.inclusionType ?? ''}
		color={item.inclusionType === PostalCodeRuleInclusionTypeEnum.Include ? 'green' : 'red'}
	/>
{/snippet}

{#snippet action({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<IconButton
		icon={Trash}
		size="xs"
		color="red"
		variant="light"
		onclick={() => item.id && deletePostalCodeRules.push(item.id)}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Postal code rules</div>
		<Button size="xs" endIcon={Plus} variant="light" onclick={() => (openAddRuleRangeModal = true)}>
			Add range
		</Button>
	</SectionHeader>

	<Table items={displayingPostalCodeRules} columns={RuleColumns} />
</div>

<Modal
	header="Add range"
	open={openAddRuleRangeModal}
	size="sm"
	onClose={() => {
		openAddRuleRangeModal = false;
	}}
	closeOnEscape
	closeOnOutsideClick
	onCancel={() => {
		openAddRuleRangeModal = false;
	}}
	onOk={handleAddCodeRange}
	disableOkBtn={!addCodeRangeInput.start?.trim()}
>
	<div class="space-y-2">
		<Alert size="sm" bordered
			>Please provide range of postal codes you want to add to the include/exclude list.</Alert
		>
		<div class="grid grid-cols-2 gap-2">
			<RadioButton
				value={PostalCodeRuleInclusionTypeEnum.Include}
				label="Include"
				bind:group={addRuleInclusionType}
			/>
			<RadioButton
				value={PostalCodeRuleInclusionTypeEnum.Exclude}
				label="Exclude"
				bind:group={addRuleInclusionType}
			/>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<Input
				placeholder="start"
				type="text"
				label="Start"
				bind:value={addCodeRangeInput.start}
				required
			/>
			<Input placeholder="end" type="text" label="End" bind:value={addCodeRangeInput.end} />
		</div>
	</div>
</Modal>
