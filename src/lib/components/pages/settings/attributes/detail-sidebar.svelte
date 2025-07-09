<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { AttributeTypeEnum } from '$lib/gql/graphql';

	type Props = {
		visibleInStorefront: boolean;
		type?: AttributeTypeEnum;
	};

	let { visibleInStorefront = $bindable(), type }: Props = $props();
</script>

<div class="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
	<SectionHeader>Organization</SectionHeader>

	<div class="text-sm text-gray-700">
		<div class="font-semibold">Type</div>
		<div>{type?.toLowerCase().replace('_', ' ')}</div>
	</div>
</div>

<div class="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
	<SectionHeader>Properties</SectionHeader>

	<Checkbox
		label="Visible in storefront"
		size="sm"
		subText="If enabled, attribute will be accessible to customers."
		bind:checked={visibleInStorefront}
	/>
</div>
