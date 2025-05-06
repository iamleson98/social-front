<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/config/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import { AppRoute } from '$lib/utils';

	const onDeleteClick = () => {};

	const onAddClick = () => {};
</script>

<div class="flex gap-2 flex-row">
	<div class="w-3/4 flex flex-col gap-2">
		<GeneralInformationForm />
		<ProductListForm />
		<SeoForm />
	</div>

	<div class="w-1/4">
		<AvailabilityForm />
	</div>
</div>

<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()} {onAddClick} />
