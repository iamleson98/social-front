<script lang="ts">
	import { T } from '$i18n';
	import { Modal } from '$lib/components/ui/Modal';
	import type { MediaObject } from '$lib/utils/types';

	type Props = {
		open: boolean;
		productMedias: MediaObject[];
		onCancel: () => void;
		onChooseMedia: (media: MediaObject) => void;
	};

	let { open, productMedias, onCancel, onChooseMedia }: Props = $props();

	let selectedMedia = $state<MediaObject>();

	const handleCancel = () => {
		onCancel();
		selectedMedia = undefined;
	};
</script>

<Modal
	header={$T('product.assignModalHead')}
	{open}
	onCancel={handleCancel}
	onClose={handleCancel}
	onOk={() => {
		onChooseMedia(selectedMedia!);
		selectedMedia = undefined;
	}}
	disableOkBtn={!selectedMedia}
>
	<div class="flex gap-1.5 flex-wrap">
		{#each productMedias as media, idx (idx)}
			<div
				onclick={() => (selectedMedia = media)}
				role="button"
				tabindex={0}
				onkeyup={(e) => e.key === 'Enter' && (selectedMedia = media)}
				class="w-30 focus:ring-blue-500 focus:ring-2 h-30 flex items-center cursor-pointer justify-center rounded-lg ring ring-gray-200"
				style="background-image: url({media.url}); background-size: cover; background-position: center;"
			></div>
		{/each}
	</div>
</Modal>
