<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PhotoUp, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import type { MediaObject } from '$lib/utils/types';
	import ErrorMsg from './error-msg.svelte';

	const MAX_MEDIAS = 9;

	type Props = {
		medias: MediaObject[];
		loading?: boolean;
	};

	let { medias = $bindable([]), loading = false }: Props = $props();
	let filesMap = $state<Record<string, MediaObject>>({});
	let errors = $derived.by(() => {
		const keys = Object.keys(filesMap);
		if (keys.length > MAX_MEDIAS)
			return {
				length: true
			};

		for (const key of keys) {
			const obj = filesMap[key];
			if (!obj.alt?.trim())
				return {
					alt: true
				};
		}

		return null;
	});

	$effect(() => {
		medias = Object.values(filesMap);
	});

	const handleFileSelect = async (fileList: FileList) => {
		if (!fileList.length) return;

		const promises = Array.from(fileList).reduce(
			(acc, file) => {
				const key = `${file.name}-${file.size}`;
				if (filesMap[key]) return acc;

				const url = URL.createObjectURL(file);
				const alt = file.name.replace(IMAGE_EXTENSION_REGEX, ''); // remove file extension
				const image = new Image();
				image.src = url;

				const prm = new Promise<MediaObject & { key: string }>((resolve) => {
					image.onload = () => {
						resolve({
							file,
							alt,
							url,
							key,
							width: image.width,
							height: image.height
						});
					};
				});

				acc.push(prm);
				return acc;
			},
			[] as Promise<MediaObject & { key: string }>[]
		);

		const results = await Promise.all(promises);
		const addFilesMap: Record<string, MediaObject> = {};

		for (const result of results) {
			addFilesMap[result.key] = result;
		}

		filesMap = { ...filesMap, ...addFilesMap };
	};

	const handleDeleteImage = (key: string) => {
		URL.revokeObjectURL(filesMap[key].url);
		const newFilesMap = { ...filesMap };
		delete newFilesMap[key];
		filesMap = newFilesMap;
	};
</script>

<div class="mb-3">
	<Label label="Product Images" required requiredAtPos="end" />
	<div
		class="rounded-lg border {errors
			? 'border-red-200 bg-red-50'
			: 'border-gray-200 bg-gray-50'} flex gap-1 p-3 flex-wrap"
	>
		{#each Object.keys(filesMap) as key, idx (idx)}
			{@const { url, alt, width, height } = filesMap[key]}
			{@const classes = alt?.trim() ? 'ring-1 ring-gray-200' : 'ring-2 ring-red-500'}
			<div
				class="h-50 w-50 relative rounded-md {classes} bg-white bg-cover bg-center bg-no-repeat"
				style="background-image: url('{url}');"
			>
				<div
					class="absolute p-1.5 rounded-md bottom-0 left-0 right-0 h-1/2 bg-white opacity-0 transition-opacity hover:opacity-90 ease-in"
				>
					<!-- alt editing -->
					<div class="text-gray-700 flex items-center text-xs">
						<span class="font-semibold w-1/4">alt:</span>
						<Input
							size="xs"
							placeholder="Enter alt"
							bind:value={filesMap[key].alt}
							variant={!alt?.trim() ? 'error' : 'info'}
							subText={!alt?.trim() ? $tranFunc('helpText.fieldRequired') : ''}
							disabled={loading}
						/>
					</div>
					{#if typeof width === 'number' && typeof height === 'number'}
						<div class="text-gray-700 flex items-center text-xs">
							<span class="font-semibold w-1/4">W x H:</span>
							<span>{width} x {height}</span>
						</div>
					{/if}

					<div class="text-right absolute bottom-1 right-1">
						<IconButton
							icon={Trash}
							size="xs"
							color="red"
							variant="light"
							class="tooltip tooltip-top"
							data-tip="Remove"
							onclick={() => handleDeleteImage(key)}
							disabled={loading}
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
					disabled={loading}
				/>
			</div>
		{/if}
	</div>

	<!-- MARK: Error message -->
	<ErrorMsg error={errors ? $tranFunc('error.thereIsError') : undefined} />
	{#if !errors}
		<div class="text-xs text-right">{medias.length}/{MAX_MEDIAS}</div>
	{/if}
</div>
