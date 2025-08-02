<script lang="ts">
	import { goto } from '$app/navigation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import IssueForm from '$lib/components/pages/settings/giftcards/issue-form.svelte';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	let triggerCreate = $state(false);
	let formOk = $state(false);
</script>

<div class={SitenameCommonClassName}>
	<IssueForm
		disabled={triggerCreate}
		bind:triggerCreate
		bind:formOk
		onCreateSuccess={(gc) => goto(AppRoute.SETTINGS_CONFIGS_GIFTCARD_DETAIL(gc.id))}
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
	onAddClick={() => (triggerCreate = true)}
	disabled={triggerCreate}
	disableCreateButton={!formOk}
/>
