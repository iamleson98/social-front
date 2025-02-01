<script lang="ts">
	import { tranFunc } from '$i18n';
	import { TimeLine } from '$lib/components/ui/timeline';

	type Props = {
		/** must be in range [1, 4] */
		numberOfItemToEnable: number;
	};

	let { numberOfItemToEnable = 1 }: Props = $props();
</script>

<TimeLine
	items={[
		{ title: $tranFunc('pages.cart'), done: 1 <= numberOfItemToEnable },
		{ title: $tranFunc('pages.checkout'), done: 2 <= numberOfItemToEnable },
		{ title: $tranFunc('pages.payment'), done: 3 <= numberOfItemToEnable },
		{ title: $tranFunc('pages.orderConfirm'), done: 4 <= numberOfItemToEnable }
	]}
	class="py-4 my-1"
/>
