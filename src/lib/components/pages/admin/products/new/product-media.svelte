<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Edit, PhotoUp, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';

	const MAX_MEDIAS = 6;

	type Props = {
		medias: ImageWithUrl[];
	};

	type ImageWithUrl = {
		file?: File;
		url: string;
		alt: string;
	};

	let { medias = [] }: Props = $props();
	let filesMap = $state<Record<string, ImageWithUrl>>({});

	const handleFileSelect = (fileList: FileList) => {
		if (!fileList.length) return;

		const addFilesMap: Record<string, ImageWithUrl> = {};
		for (const file of fileList) {
			if (!file) continue;

			const key = `${file.name}-${file.size}`;
			if (filesMap[key]) continue;

			const url = URL.createObjectURL(file);
			const alt = file.name.replace(IMAGE_EXTENSION_REGEX, ''); // remove file extension

			addFilesMap[key] = { file, url, alt };
		}

		filesMap = { ...filesMap, ...addFilesMap };
	};

	const handleDeleteImage = (key: string) => {
		const newFilesMap = { ...filesMap };
		delete newFilesMap[key];
		filesMap = newFilesMap;
	};
</script>

<div class="mb-3">
	<Label label="Product Images" required requiredAtPos="end" />
	<div class="rounded-lg bg-gray-50 border border-gray-200 flex gap-1 p-3 flex-wrap">
		{#each Object.keys(filesMap) as key, idx (idx)}
			{@const { url, alt } = filesMap[key]}
			<div
				class="h-50 w-50 relative rounded-md border border-gray-200 bg-white flex bg-cover bg-center bg-no-repeat bg- items-center justify-center"
				style="background-image: url('{url}');"
			>
				<div
					class="absolute p-1 bottom-0 left-0 right-0 h-1/2 bg-white opacity-0 transition-opacity hover:opacity-90 ease-in"
				>
					<!-- alt editing -->
					<div class="text-gray-700 flex items-center text-xs">
						<span class="font-semibold w-1/5">alt:</span>
						<Input
							size="xs"
							placeholder="Enter alt"
							bind:value={filesMap[key].alt}
							variant={!alt?.trim() ? 'error' : 'info'}
							subText={!alt?.trim() ? $tranFunc('helpText.fieldRequired') : ''}
						/>
					</div>

					<div class="text-right absolute bottom-1 right-1">
						<IconButton
							icon={Trash}
							size="xs"
							color="red"
							variant="light"
							class="tooltip tooltip-top"
							data-tip="Remove"
							onclick={() => handleDeleteImage(key)}
						/>
					</div>
				</div>
			</div>
		{/each}
		{#if medias.length < MAX_MEDIAS}
			<div
				class="h-50 w-50 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center"
			>
				<FileInput
					icon={PhotoUp}
					class="tooltip tooltip-top"
					data-tip="Add Image"
					accept="image/*"
					multiple
					onChange={handleFileSelect}
				/>
			</div>
		{/if}
	</div>
</div>
