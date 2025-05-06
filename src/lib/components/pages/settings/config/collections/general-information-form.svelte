<script lang="ts">
	import { tranFunc } from '$i18n';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import ErrorMsg from '$lib/components/pages/settings/products/new/error-msg.svelte';
	import type { MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import { IconButton } from '$lib/components/ui/Button';
	import { PhotoUp, Trash } from '$lib/components/icons';

	const MAX_MEDIAS = 1;

	type Props = {
		name?: string;
		slug?: string;
		description?: any;
		disabled?: boolean;
		isCreatePage?: boolean;
		ok?: boolean;
		medias?: MediaObject[];
	};

	let {
		name = $bindable(''),
		slug = $bindable(''),
		description = $bindable(),
		disabled = $bindable(false),
		isCreatePage = $bindable(false),
		ok = $bindable(false),
		medias = $bindable([])
	}: Props = $props();

	let descriptionError = $state<string>();
	let filesMap = $state<Record<string, MediaObject>>({});

	let errors = $derived.by(() => {
		if (Object.keys(filesMap).length > MAX_MEDIAS) return { length: true };
		for (const key in filesMap) {
			if (!filesMap[key].alt?.trim()) return { alt: true };
		}
		return null;
	});

	$effect(() => {
		medias = Object.values(filesMap);
	});

	const handleChangeDescription = (data: any) => {
		description = data;
		const isEmpty = !data?.blocks?.length;
		descriptionError = isEmpty ? $tranFunc('helpText.fieldRequired') : undefined;
		ok = !isEmpty;
	};

	const handleFileSelect = async (fileList: FileList) => {
		if (!fileList.length) return;

		const newEntries: Record<string, MediaObject> = {};

		await Promise.all(
			Array.from(fileList).map((file) => {
				const key = `${file.name}-${file.size}`;
				if (filesMap[key]) return;

				const url = URL.createObjectURL(file);
				const alt = file.name.replace(IMAGE_EXTENSION_REGEX, '');

				return new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = () => {
						newEntries[key] = { file, url, alt, width: img.width, height: img.height };
						resolve();
					};
					img.src = url;
				});
			})
		);

		filesMap = { ...filesMap, ...newEntries };
	};

	const handleDeleteImage = (key: string) => {
		URL.revokeObjectURL(filesMap[key].url);
		const { [key]: _, ...rest } = filesMap;
		filesMap = rest;
	};

	const validate = () => {};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3">
	<Input
		label="Name"
		bind:value={name}
		required
		{disabled}
		class="flex-1"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>

	<!-- Description -->
	<div class="my-3">
		<Label required requiredAtPos="end" label="Collection description" />
		<div
			class="rounded-lg border px-3 {ok || !descriptionError
				? 'border-gray-200'
				: 'bg-red-50 border-red-200'}"
		>
			<EditorJSComponent
				header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
				simpleImage
				list={{ defaultStyle: 'unordered', maxLevel: 3, inlineToolbar: true }}
				embed={{ services: { youtube: true } }}
				quote={{ inlineToolbar: true }}
				onchange={handleChangeDescription}
				placeholder={$tranFunc('placeholders.valuePlaceholder')}
				defaultValue={description}
			/>
		</div>
		<ErrorMsg error={descriptionError} />
	</div>

	<!-- Media upload -->
	<div class="mb-3">
		<Label label="Collection Image" required requiredAtPos="end" />
		<div
			class="rounded-lg border p-3 flex gap-1 flex-wrap {errors
				? 'border-red-200 bg-red-50'
				: 'border-gray-200 bg-gray-50'}"
		>
			{#each Object.entries(filesMap) as [key, file], idx (key)}
				{@const { url, alt, width, height } = file}
				<div
					class="h-50 w-50 relative rounded-md bg-white bg-cover bg-center bg-no-repeat {alt?.trim()
						? 'ring-1 ring-gray-200'
						: 'ring-2 ring-red-500'}"
					style="background-image: url('{url}')"
				>
					<div
						class="absolute p-1.5 rounded-md bottom-0 left-0 right-0 h-1/2 bg-white opacity-0 transition-opacity hover:opacity-90 ease-in"
					>
						<div class="text-gray-700 flex items-center text-xs mb-1">
							<span class="font-semibold w-1/4">alt:</span>
							<Input
								size="xs"
								placeholder="Enter alt"
								bind:value={filesMap[key].alt}
								variant={!alt?.trim() ? 'error' : 'info'}
								subText={!alt?.trim() ? $tranFunc('helpText.fieldRequired') : ''}
							/>
						</div>
						{#if width && height}
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

		<ErrorMsg error={errors ? $tranFunc('error.thereIsError') : undefined} />
		{#if !errors}
			<div class="text-xs text-right">{medias.length}/{MAX_MEDIAS}</div>
		{/if}
	</div>
</div>
