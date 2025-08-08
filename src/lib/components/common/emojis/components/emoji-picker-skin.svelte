<script lang="ts">
	import { HandStop } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';

	type Props = {
		userSkinTone: string;
		onSkinSelected: (skin: string) => void;
		// intl: IntlShape;
	};

	let { userSkinTone, onSkinSelected }: Props = $props();

	let pickerExtended = $state(false);
	let pickerMounted = $state(false);
</script>

<IconButton icon={HandStop} size="xs" variant="light" />
