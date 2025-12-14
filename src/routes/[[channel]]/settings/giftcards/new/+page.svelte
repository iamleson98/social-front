<script lang="ts">
	import { goto } from '$app/navigation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import IssueForm from '$lib/components/pages/settings/giftcards/issue-form.svelte';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import toast from 'svelte-french-toast';

	let triggerCreate = $state(false);
	let formOk = $state(false);
	let loading = $state(false);
</script>

<div class={SitenameCommonClassName}>
	<IssueForm
		bind:loading
		bind:triggerCreate
		bind:formOk
		onCreateSuccess={(gc) => {
			goto(AppRoute.SETTINGS_CONFIGS_GIFTCARD_DETAIL(gc.id));
			toast.success($CommonState.CreateSuccess);
		}}
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
	onAddClick={() => (triggerCreate = true)}
	disabled={loading}
	disableCreateButton={!formOk}
/>
