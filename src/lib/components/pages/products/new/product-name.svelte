<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input } from '$lib/components/ui/Input';
	import type { ProductCreateInput } from '$lib/gql/graphql';

	type Props = {
		name: ProductCreateInput['name'];
	};

	let { name = $bindable() }: Props = $props();

	const now = new Date();
</script>

<!-- product name -->
<div class="mb-2">
	<span class="text-sm">{$tranFunc('product.prdName')}</span>
	<Input placeholder={$tranFunc('placeholders.enterPrdName')} size="md" bind:value={name} />
	<div class="text-right">
		<span class="text-xs">{now.toDateString()}</span>
	</div>
</div>
