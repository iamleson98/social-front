<script lang="ts" module>
	import { TablerPhoto } from '$lib/components/icons/consts';
	import { IconButton } from '$lib/components/ui/Button';
	import { Modal } from '$lib/components/ui/Modal';
	import { type MediaObject } from '$lib/utils/types';

	export const VariantMediaSnippets = { VariantImageBtn, VariantMediaModal };
</script>

{#snippet VariantImageBtn(variantName: string, style: string, onclick: () => void, disabled?: boolean)}
	<dir class="flex flex-col items-center">
		<div>
			{variantName}
		</div>
		<IconButton
			color="gray"
			icon={TablerPhoto}
			size="xl"
			{style}
			{disabled}
			{onclick}
			variant="outline"
		/>
	</dir>
{/snippet}

{#snippet VariantMediaModal(open: boolean, productMedias: MediaObject[], onChooseMedia: (mdia: MediaObject) => void, onclose: () => void)}
	<Modal
		header="Assign media to variant"
		{open}
		onCancel={onclose}
		onClose={onclose}
		onOk={onclose}
	>
		<div class="flex gap-1.5 flex-wrap">
			{#each productMedias as media, idx (idx)}
				<div
					onclick={() => onChooseMedia(media)}
					role="button"
					tabindex={0}
					onkeyup={(e) => {
						if (e.key === 'Enter') onChooseMedia(media);
					}}
					class="w-30 focus:ring-blue-500 focus:ring-2 h-30 flex items-center cursor-pointer justify-center rounded-lg ring ring-gray-200"
					style="background-image: url({media.url}); background-size: cover; background-position: center;"
				></div>
			{/each}
		</div>
	</Modal>
{/snippet}
