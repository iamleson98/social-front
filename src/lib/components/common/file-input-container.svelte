<script lang="ts">
	import type { SocialVariant } from '$lib/utils';
	import type { MediaObject } from '$lib/utils/types';
	import { array, object, string } from 'zod';
	import { FileUpload, Trash } from '../icons';
	import { IconButton } from '../ui/Button';
	import type { SocialSize } from '../ui/common';
	import { FileInput, Input, INPUT_CLASSES, Label } from '../ui/Input';
	import { classNames, formatBytes } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';

	type Props = {
		accept: string;
		/** at most number of files can select, default to 1 */
		max?: number;
		label?: string;
		variant?: SocialVariant;
		required?: boolean;
		labelSize?: SocialSize;
		medias: MediaObject[];
		class?: string;
	};

	let {
		accept,
		max = 1,
		label,
		variant = 'info',
		required,
		labelSize,
		medias = $bindable([]),
		class: className = '',
	}: Props = $props();

	const documentIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2m-8-4h6m-6-4h6"/></g></svg>')}`;

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	let mediaErrors = $state<Partial<Record<number, string[]>>>();

	const Schema = array(
		object({
			alt: string().nonempty(REQUIRED_ERROR),
		}),
	);

	const validate = () => {
		const result = Schema.safeParse(medias);
		mediaErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const FILE_MAP = $derived(
		medias.reduce(
			(acc, file) => {
				acc[`${file.file?.name}-${file.file?.size}`] = true;
				return acc;
			},
			{} as Record<string, boolean>,
		),
	);

	const handleFileSelect = async (fileList: FileList) => {
		const promises = [];

		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i];

			// prevent adding duplicate files
			const key = `${file.name}-${file.size}`;
			if (FILE_MAP[key]) continue;

			const alt = file.name.slice(0, file.name.lastIndexOf('.'));

			if (file.type.toLowerCase().startsWith('image/')) {
				const prm = new Promise<MediaObject>((resolve) => {
					const url = URL.createObjectURL(file);
					const img = new Image();
					img.src = url;

					img.onload = () => {
						resolve({
							file,
							url,
							alt,
							width: img.width,
							height: img.height,
							type: 'image',
						});
					};
				});

				promises.push(prm);
				continue;
			}

			const prm = Promise.resolve<MediaObject>({
				file,
				alt,
				type: 'document',
				url: URL.createObjectURL(file),
			});

			promises.push(prm);
		}

		const results = await Promise.all(promises);
		medias = medias.concat(results);
		validate();
	};

	const deleteFileItem = (idx: number) => {
		medias = medias.filter((_, i) => i !== idx);
		validate();
	};
</script>

<div class={className}>
	{#if label}
		<Label {label} requiredAtPos="end" {variant} size={labelSize} {required} />
	{/if}
	<div class="flex flex-wrap gap-1.5 p-2 rounded-lg {INPUT_CLASSES[variant].bg}">
		{#each medias as media, idx (idx)}
			{@const props = {
				style: `background-image: url('${media.type === 'image' ? media.url : documentIcon}')`,
			}}
			<div
				class={classNames(
					'h-50 w-50 relative border border-gray-200 flex rounded-lg bg-white bg-cover bg-center bg-no-repeat',
					{
						[INPUT_CLASSES['error'].bg]: !!mediaErrors?.[idx]?.length,
					},
				)}
				{...props}
			>
				<div
					class="absolute p-1.5 rounded-md bottom-0 left-0 right-0 h-3/4 bg-white opacity-0 transition-opacity hover:opacity-90 ease-in"
				>
					<div class="text-gray-700 flex items-center text-xs mb-1">
						<span class="font-semibold w-1/4">alt:</span>
						<Input
							size="xs"
							placeholder="Enter alt"
							bind:value={media.alt}
							onblur={validate}
							inputDebounceOption={{ onInput: validate }}
							variant={mediaErrors?.[idx]?.length ? 'error' : 'info'}
							subText={mediaErrors?.[idx]?.[0]}
						/>
					</div>
					{#if media.file}
						<div class="text-gray-700 flex items-center text-xs">
							<span class="font-semibold w-1/4">Size:</span>
							<span>{formatBytes(media.file.size)}</span>
						</div>
					{/if}
					{#if typeof media.width === 'number' && typeof media.height === 'number'}
						<div class="text-gray-700 flex items-center text-xs">
							<span class="font-semibold w-1/4">W x H:</span>
							<span>{media.width} x {media.height}</span>
						</div>
					{/if}
					<div class="text-right absolute bottom-1 right-1">
						<IconButton
							icon={Trash}
							size="xs"
							color="red"
							variant="light"
							class="tooltip tooltip-left"
							data-tip="Remove"
							onclick={() => deleteFileItem(idx)}
						/>
					</div>
				</div>
			</div>
		{/each}
		{#if medias.length < max}
			<div
				class="h-50 w-50 relative flex rounded-lg items-center justify-center bg-gray-50 border border-gray-200"
			>
				<FileInput
					{accept}
					class="tooltip tooltip-top"
					data-tip="Add File"
					multiple
					onChange={handleFileSelect}
					icon={FileUpload}
				/>
			</div>
		{/if}
	</div>
	<div class={`text-[10px] mt-0.5 text-right!`}>
		{medias.length} / {max}
	</div>
</div>
