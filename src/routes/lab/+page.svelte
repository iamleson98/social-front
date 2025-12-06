<script lang="ts">
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import EmojiPicker from '$lib/components/common/emojis/emoji-picker.svelte';
	import { Select, type SelectOption } from '$lib/components/ui/select';

	let value = $state([]);
</script>

<!-- <iframe
	src="https://manufacturing.apple.com/analytics/dashboards/52bc33b41a78413288f4f8afc45d0c71"
	title="W3Schools Free Online Web Tutorials"
></iframe> -->

<EmojiPicker onEmojiClick={console.log} filter="" />
