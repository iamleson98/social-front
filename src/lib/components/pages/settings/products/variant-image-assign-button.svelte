<script lang="ts">
	import { T } from '$i18n';
	import { TablerPhoto } from '$lib/components/icons/consts';
	import { IconButton } from '$lib/components/ui/Button';

	type Props = {
		onclick: () => void;
		/** used when parent is in loading state, so this button must be disabled */
		disabled?: boolean;
		backgroundImageUrl?: string;
	};

	let { onclick, disabled, backgroundImageUrl }: Props = $props();
</script>

<IconButton
	color="gray"
	icon={TablerPhoto}
	size="xl"
	style="background-image: url({backgroundImageUrl});"
	class="{backgroundImageUrl
		? 'text-gray-600/0! hover:text-gray-600! bg-cover bg-center'
		: ''} tooltip tooltip-top border border-gray-200!"
	data-tip={$T('product.assignMedia')}
	{disabled}
	{onclick}
	variant="outline"
/>
