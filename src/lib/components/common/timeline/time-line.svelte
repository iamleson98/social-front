<script lang="ts">
	import { tClient } from '$i18n';
	import { TimeLine } from '$lib/components/ui/timeline';

	type Props = {
		/** >= 1 and <= 4*/
		numberOfItemToEnable: number;
	};

	let { numberOfItemToEnable = 1 }: Props = $props();
</script>

<TimeLine
	items={[
		{ title: tClient('pages.cart'), done: 1 <= numberOfItemToEnable },
		{ title: tClient('pages.checkout'), done: 2 <= numberOfItemToEnable },
		{ title: tClient('pages.payment'), done: 3 <= numberOfItemToEnable },
		{ title: tClient('pages.orderConfirm'), done: 4 <= numberOfItemToEnable }
	]}
	class="py-4 my-1"
/>
