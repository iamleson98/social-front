<script lang="ts">
	import { Icon, Star } from '$lib/components/icons';
import { MAX_RATING } from '$lib/utils/consts';

	export let rating: number;

	let percent = (rating / MAX_RATING) * 100;
</script>

<div class="">
	<div class="bg-red-500 inline-flex" style={`width: ${percent}%;`}>
    <Icon icon={Star} />
    <Icon icon={Star} />
    <Icon icon={Star} />
    <Icon icon={Star} />
    <Icon icon={Star} />
  </div>
</div>
