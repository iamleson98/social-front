<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { noop } from 'es-toolkit';
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>Default Settings</SectionHeader>
</div>

<ActionBar onUpdateClick={noop} backButtonUrl={AppRoute.TAX_SETTINGS_CHANNELS()} />
