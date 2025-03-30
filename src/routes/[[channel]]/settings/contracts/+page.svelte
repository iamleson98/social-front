<script>
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
</script>

<div class="mt-3 rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<div>Products</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.SETTINGS_CONTRACTS_NEW()}>New Contract</Button>
	</div>
</div>

<div class="mt-3">Contracts</div>
