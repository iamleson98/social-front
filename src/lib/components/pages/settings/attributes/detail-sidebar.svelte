<script lang="ts">
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

<div class="w-3/10 tablet:w-full space-y-2">
	<div class={SitenameCommonClassName}>
		<SectionHeader>Organization</SectionHeader>

		<div class="text-sm text-gray-700 space-y-1.5">
			<Label required label="Type" />
			<div class="text-[10px] text-gray-600">
				Define where this attribute should be used in App system
			</div>
			{#each Object.values(AttributeTypeEnum) as value, idx (idx)}
				<RadioButton
					size="sm"
					{value}
					bind:group={type}
					label={value.toLowerCase().replace('_', ' ')}
					disabled={!isCreatePage || disabled}
				/>
			{/each}
		</div>
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>Properties</SectionHeader>

		<Checkbox
			label="Visible in storefront"
			size="sm"
			subText="If enabled, attribute will be accessible to customers."
			bind:checked={visibleInStorefront}
			{disabled}
		/>
	</div>
</div>
