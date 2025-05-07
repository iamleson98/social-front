<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import ErrorMsg from '$lib/components/pages/settings/products/new/error-msg.svelte';
	import type { MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { PhotoUp, Trash } from '$lib/components/icons';
	import Accordion from '$lib/components/ui/Accordion/accordion.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';

	type Props = {
		name: string;
		description?: any;
		disabled?: boolean;
		isCreatePage?: boolean;
		media: MediaObject | null;
		metadata: { key: string; value: string }[];
		privateMetadata: { key: string; value: string }[];
		backgroundImageAlt?: string;
	};

	let {
		name = $bindable(''),
		description = $bindable(),
		disabled = $bindable(false),
		isCreatePage = $bindable(false),
		media = $bindable<MediaObject | null>(null),
		metadata = $bindable<{ key: string; value: string }[]>([]),
		privateMetadata = $bindable<{ key: string; value: string }[]>([]),
		backgroundImageAlt = $bindable('')
	}: Props = $props();

	let descriptionError = $state<string>();

	let error = $derived.by(
		() =>
			media &&
			((isCreatePage && !media.alt?.trim()) || (!media.alt?.trim() && !backgroundImageAlt?.trim()))
	);

	const handleChangeDescription = (data: any) => {
		description = data;
		const isEmpty = !data?.blocks?.length;
		descriptionError = isEmpty ? $tranFunc('helpText.fieldRequired') : undefined;
	};

	const handleFileSelect = async (fileList: FileList) => {
		if (!fileList.length || media) return;

		const file = fileList[0];
		const url = URL.createObjectURL(file);
		const alt = file.name.replace(IMAGE_EXTENSION_REGEX, '');

		await new Promise<void>((resolve) => {
			const img = new Image();
			img.onload = () => {
				media = {
					file,
					url,
					alt,
					width: img.width,
					height: img.height
				};
				resolve();
			};
			img.src = url;
		});
	};

	const handleDeleteImage = () => {
		if (media) {
			URL.revokeObjectURL(media.url);
			media = null;
		}
	};

	const validate = () => {
		let valid = true;

		if (!name?.trim()) {
			valid = false;
		}

		const isEmptyDescription = !description?.blocks?.length;
		descriptionError = isEmptyDescription ? $tranFunc('helpText.fieldRequired') : undefined;
		if (isEmptyDescription) valid = false;

		if (error) {
			valid = false;
		}

		return valid;
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 pb-2">
	<Input
		label="Name"
		bind:value={name}
		required
		{disabled}
		class="flex-1 p-3"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>

	<div class="my-3 p-3">
		<Label required requiredAtPos="end" label="Collection description" />
		<div
			class="rounded-lg border px-3 {validate() || !descriptionError
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

	<!-- Media Upload -->
	<div class="p-3">
		<Label label="Collection Image" required requiredAtPos="end" />
		<div
			class="rounded-lg border p-3 flex gap-1 flex-wrap {error
				? 'border-red-200 bg-red-50'
				: 'border-gray-200 bg-gray-50'}"
		>
			{#if media}
				<div
					class="h-50 w-50 relative rounded-md bg-white bg-cover bg-center bg-no-repeat {media.alt?.trim() ? 'ring-1 ring-gray-200' : 'ring-2 ring-red-500'}"
					style="background-image: url('{media.url}')"
				>
					<div
						class="absolute p-1.5 rounded-md bottom-0 left-0 right-0 h-1/2 bg-white opacity-0 transition-opacity hover:opacity-90 ease-in"
					>
						<div class="text-gray-700 flex items-center text-xs mb-1">
							<span class="font-semibold w-1/4">alt:</span>
							<Input
								size="xs"
								placeholder="Enter alt"
								bind:value={media.alt}
								variant={!media.alt?.trim() ? 'error' : 'info'}
								subText={!media.alt?.trim() ? $tranFunc('helpText.fieldRequired') : ''}
							/>
						</div>
						{#if media.width && media.height}
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
								class="tooltip tooltip-top"
								data-tip="Remove"
								onclick={handleDeleteImage}
							/>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="h-50 w-50 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center"
				>
					<FileInput
						icon={PhotoUp}
						class="tooltip tooltip-top"
						data-tip="Add Image"
						accept="image/*"
						multiple={false}
						onChange={handleFileSelect}
					/>
				</div>
			{/if}
		</div>
		<ErrorMsg error={error ? $tranFunc('error.thereIsError') : undefined} />
		{#if !error && media}
			<div class="text-xs text-right">1/1</div>
		{/if}
	</div>

	<!-- MetaData -->
	<Accordion header="Metadata" open={false}>
		{#each metadata as field}
			<div class="flex gap-5 items-center my-2">
				<Input
					placeholder="Key"
					{disabled}
					class="flex-1"
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
				/>
				<Input
					placeholder="Value"
					{disabled}
					class="flex-1"
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
				/>
				<IconButton
					icon={Trash}
					size="xs"
					color="red"
					variant="light"
					class="tooltip tooltip-top"
					data-tip="Remove"
					onclick={() => metadata.splice(metadata.indexOf(field), 1)}
				/>
			</div>
		{/each}
		<Button
			size="xs"
			variant="light"
			color="blue"
			onclick={() => metadata.push({ key: '', value: '' })}
		>
			Add Field
		</Button>
	</Accordion>

	<!-- privateMetadata -->
	<Accordion header="Private Metadata" open={false}>
		{#each privateMetadata as field}
			<div class="flex gap-2 items-center my-2">
				<Input
					placeholder="Key"
					{disabled}
					class="flex-1"
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
				/>
				<Input
					placeholder="Value"
					{disabled}
					class="flex-1"
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
				/>
				<IconButton
					icon={Trash}
					size="xs"
					color="red"
					variant="light"
					class="tooltip tooltip-top"
					data-tip="Remove"
					onclick={() => privateMetadata.splice(privateMetadata.indexOf(field), 1)}
				/>
			</div>
		{/each}
		<Button
			size="xs"
			variant="light"
			color="blue"
			onclick={() => privateMetadata.push({ key: '', value: '' })}
		>
			Add Field
		</Button>
	</Accordion>
</div>
