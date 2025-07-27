<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
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
		inclusionType?: PostalCodeRuleInclusionTypeEnum;
	};

	type PartialShippingMethodPostalCodeRule = Partial<ShippingMethodPostalCodeRule>;

	let {
		existingCodeRules = [],
		addPostalCodeRules = $bindable(),
		deletePostalCodeRules = $bindable(),
		inclusionType = $bindable(),
	}: Props = $props();

	const RuleColumns: TableColumnProps<PartialShippingMethodPostalCodeRule>[] = [
		{
			title: 'start',
			child: start,
		},
		{
			title: 'end',
			child: end,
		},
		{
			title: 'inclusion type',
			child: inclusionTypeSnippet,
		},
		{
			title: 'action',
			child: action,
		},
	];

	let displayingPostalCodeRules = $state<PartialShippingMethodPostalCodeRule[]>(existingCodeRules);
	let openAddRuleRangeModal = $state(false);
	let addCodeRangeInput = $state<ShippingPostalCodeRulesCreateInputRange>({
		start: '',
	});
	let ruleDuplicated = $state(false);

	const handleAddCodeRange = () => {
		if (!addCodeRangeInput.start.trim() || ruleDuplicated) return;
		const newRule = {
			start: addCodeRangeInput.start.trim(),
			end: addCodeRangeInput.end?.trim(),
		};
		addPostalCodeRules.push(newRule);
		displayingPostalCodeRules.push(newRule);
		addCodeRangeInput = {
			start: '',
			end: '',
		};
		openAddRuleRangeModal = false;
	};

	const handleDeleteCodeRange = (item: PartialShippingMethodPostalCodeRule, idx: number) => {
		if (item.id && !deletePostalCodeRules.includes(item.id)) deletePostalCodeRules.push(item.id);

		displayingPostalCodeRules = displayingPostalCodeRules.filter((_, i) => i !== idx);
		addPostalCodeRules = addPostalCodeRules.filter(
			(rule) => rule.start !== item.start && rule.end !== item.end,
		);
	};

	const validateDuplication = () => {
		ruleDuplicated = displayingPostalCodeRules.some(
			(rule) => rule.start === addCodeRangeInput.start && rule.end === addCodeRangeInput.end,
		);
	};
</script>

{#snippet start({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<span>{item.start || '-'}</span>
{/snippet}

{#snippet end({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<span>{item.end || '-'}</span>
{/snippet}

{#snippet inclusionTypeSnippet({ item }: { item: PartialShippingMethodPostalCodeRule })}
	<Badge
		text={inclusionType || '-'}
		color={inclusionType === PostalCodeRuleInclusionTypeEnum.Include ? 'green' : 'red'}
	/>
{/snippet}

{#snippet action({ item, idx }: { item: PartialShippingMethodPostalCodeRule; idx: number })}
	<IconButton
		icon={Trash}
		size="xs"
		color="red"
		variant="light"
		onclick={() => handleDeleteCodeRange(item, idx)}
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
	disableOkBtn={!addCodeRangeInput.start?.trim() || ruleDuplicated}
>
	<div class="space-y-2">
		<div class="space-y-2">
			<RadioButton
				value={PostalCodeRuleInclusionTypeEnum.Include}
				label="Include"
				bind:group={inclusionType}
				subText="Added postal codes will be excluded from using this delivery methods. If none are added all postal codes will be able to use that shipping rate"
			/>
			<RadioButton
				value={PostalCodeRuleInclusionTypeEnum.Exclude}
				label="Exclude"
				bind:group={inclusionType}
				subText="Only added postal codes will be able to use this shipping rate"
			/>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<Input
				placeholder="start"
				type="text"
				label="Start"
				bind:value={addCodeRangeInput.start}
				inputDebounceOption={{ onInput: validateDuplication }}
				required
				variant={ruleDuplicated ? 'error' : 'info'}
				subText={ruleDuplicated
					? $tranFunc('common.duplicate', { val: addCodeRangeInput.start })
					: undefined}
			/>
			<Input
				placeholder="end"
				type="text"
				label="End"
				bind:value={addCodeRangeInput.end}
				inputDebounceOption={{ onInput: validateDuplication }}
				variant={ruleDuplicated ? 'error' : 'info'}
				subText={ruleDuplicated
					? $tranFunc('common.duplicate', { val: addCodeRangeInput.end })
					: undefined}
			/>
		</div>
	</div>
</Modal>
