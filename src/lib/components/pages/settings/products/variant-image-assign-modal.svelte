<script lang="ts">
	import { T } from '$i18n';
	import { Alert } from '$lib/components/ui/Alert';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { MediaObject } from '$lib/utils/types';

	type Props = {
		open: boolean;
		productMedias: MediaObject[];
		onChooseMedia: (media?: MediaObject) => void;
		/** currently selected media, kept in parent, not saved */
		selectedMedia?: MediaObject;
		onClose?: () => void;
		/** Saved media, undefined in product creation page, maybe set in product edit page */
		initialMedia?: MediaObject;
	};

	let { open, productMedias, onChooseMedia, selectedMedia, onClose, initialMedia }: Props =
		$props();
	const InitialMediaIndex = $derived(
		selectedMedia
			? productMedias.findIndex((m) => m.url === selectedMedia.url || m.id === selectedMedia.id)
			: undefined,
	);
	let selectedMediaIndex = $state(InitialMediaIndex);

	$effect(() => {
		selectedMediaIndex = InitialMediaIndex;
	});

	const onOk = () => {
		onChooseMedia(selectedMediaIndex !== undefined ? productMedias[selectedMediaIndex] : undefined);
		onClose?.();
	};

	/** acts as reset function */
	const onCancel = () => {
		selectedMediaIndex = undefined;
		// 1) In product edit page, we reset to default media when reset button is clicked.
		if (initialMedia) onChooseMedia(initialMedia);
		// 2) In product create page, we reset to no media when reset button is clicked.
		else if (!selectedMedia || (selectedMedia && selectedMedia.url.startsWith('blob:')))
			onChooseMedia(undefined);
		else onChooseMedia(selectedMedia);

		onClose?.();
	};
</script>

<Modal
	cancelText={$T('common.reset')}
	header={$T('product.assignModalHead')}
	{onClose}
	{open}
	{onOk}
	{onCancel}
	disableOkBtn={selectedMediaIndex === InitialMediaIndex}
	disableCancelBtn={selectedMediaIndex === InitialMediaIndex}
>
	<div class="flex gap-1.5 flex-wrap">
		{#each productMedias as media, idx (idx)}
			<label
				class="w-30 relative focus:ring-blue-500 bg-center bg-cover focus:ring-2 h-30 flex items-center cursor-pointer justify-center rounded-lg ring ring-gray-200"
				style="background-image: url({media.url});"
			>
				<div class="absolute top-1! right-1!">
					<RadioButton size="sm" bind:group={selectedMediaIndex} value={idx} />
				</div>
			</label>
		{:else}
			<Alert variant="warning" size="sm">{$T('product.noMediaHint')}</Alert>
		{/each}
	</div>
</Modal>
