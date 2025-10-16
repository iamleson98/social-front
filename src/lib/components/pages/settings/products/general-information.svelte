<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
</div>
