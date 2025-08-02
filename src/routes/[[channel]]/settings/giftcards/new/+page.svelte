<script lang="ts">
	import { page } from '$app/state';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import IssueForm from '$lib/components/pages/settings/giftcards/issue-form.svelte';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	let triggerCreate = $state(false);
	let loading = $state(false);
	let formOk = $state(false);
</script>

<div class={SitenameCommonClassName}>
	<IssueForm
		toCustomerEmail={page.url.searchParams.get('customerEmail') as string}
		disabled={loading}
		bind:triggerCreate
		bind:formOk
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
	onAddClick={() => (triggerCreate = true)}
	disabled={loading}
	disableCreateButton={!formOk}
/>
