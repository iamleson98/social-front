<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Label, RadioButton } from '$lib/components/ui/Input';
	import { AttributeTypeEnum } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		visibleInStorefront: boolean;
		type: AttributeTypeEnum;
		isCreatePage?: boolean;
		disabled?: boolean;
	};

	let {
		visibleInStorefront = $bindable(),
		type = $bindable(),
		isCreatePage,
		disabled,
	}: Props = $props();
</script>

<div class="tablet:w-full space-y-2">
	<div class={SitenameCommonClassName}>
		<SectionHeader>{$tranFunc('common.org')}</SectionHeader>

		<div class="text-sm text-gray-700 space-y-1.5">
			<Label required label="Type" />
			<div class="text-[10px] text-gray-600">
				{$tranFunc('attributes.defineUseinApps')}
			</div>
			{#each Object.values(AttributeTypeEnum) as value, idx (idx)}
				<RadioButton
					size="sm"
					{value}
					bind:group={type}
					label={$tranFunc(`attributes.${value}`)}
					disabled={!isCreatePage || disabled}
				/>
			{/each}
		</div>
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>{$tranFunc('attributes.props')}</SectionHeader>

		<Checkbox
			label={$tranFunc('attributes.visibleInStore')}
			size="sm"
			subText={$tranFunc('attributes.visibleInStoreHint')}
			bind:checked={visibleInStorefront}
			{disabled}
		/>
	</div>
</div>
