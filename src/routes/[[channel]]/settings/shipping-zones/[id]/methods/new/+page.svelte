<script lang="ts">
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
</script>

<div class="breadcrumbs text-sm">
	<ul>
		<li><a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id)}>Parent</a></li>
		<li>Shipping methods</li>
		<li>New</li>
	</ul>
</div>
