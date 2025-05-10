<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import { PhotoUp, Trash } from '$lib/components/icons';
	import ErrorMsg from '$lib/components/pages/settings/products/new/error-msg.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import type { MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import type { MetadataInput } from '$lib/gql/graphql';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import { object, string, z } from 'zod';
	import MetadataEditor from '../../common/metadata-editor.svelte';
	import { IconButton } from '$lib/components/ui/Button';

	type Props = {
		name: string;
		description?: string;
		disabled?: boolean;
		isCreatePage?: boolean;
		// media: MediaObject | null;
		metadata: MetadataInput[];
		privateMetadata: MetadataInput[];
		backgroundImageAlt: string;
		backgroundImage: File | null;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled = $bindable(false),
		// isCreatePage = false,
		metadata = $bindable<MetadataInput[]>([]),
		privateMetadata = $bindable<MetadataInput[]>([]),
		backgroundImageAlt = $bindable(''),
		backgroundImage = $bindable<File | null>(null)
	}: Props = $props();

	let descriptionError = $state<string>();
	let collectionFormErrors = $state.raw<Partial<Record<keyof CollectionSchema, string[]>>>({});

	/** for UI representation */
	let media = $state<MediaObject>();
	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const collectionSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		description: string().nonempty(REQUIRED_ERROR),
		backgroundImageAlt: string().nonempty(REQUIRED_ERROR)
	});

	type CollectionSchema = z.infer<typeof collectionSchema>;

	const handleChangeDescription = (data: any) => {
		description = data;
		descriptionError = !data?.blocks?.length ? REQUIRED_ERROR : undefined;
	};

	const handleFileSelect = (fileList: FileList) => {
		if (!fileList.length || media) return;

		const file = fileList[0];
		const url = URL.createObjectURL(file);
		const alt = file.name.replace(IMAGE_EXTENSION_REGEX, '');

		const img = new Image();
		img.src = url;
		img.onload = () => {
			media = { file, url, alt, width: img.width, height: img.height };
			backgroundImageAlt = alt;
			backgroundImage = file;
		};
	};

	const handleDeleteImage = () => {
		URL.revokeObjectURL(media!.url);
		media = undefined;
		backgroundImageAlt = '';
		backgroundImage = null;
	};

	const getDescriptionText = (data: any): string => {
		return data?.blocks?.length ? JSON.stringify(data) : '';
	};

	const validate = () => {
		const result = collectionSchema.safeParse({
			name,
			description: getDescriptionText(description),
			backgroundImageAlt
		});

		if (!result.success) {
			collectionFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}

		collectionFormErrors = {};
		return true;
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3">
	<h2 class="text-lg font-semibold mb-3">General Information</h2>
	<Input
		label="Name"
		bind:value={name}
		class="mb-3"
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={collectionFormErrors.name?.length ? 'error' : 'info'}
		subText={collectionFormErrors.name?.length ? collectionFormErrors.name[0] : undefined}
	/>

	<div class="mb-3">
		<Label required requiredAtPos="end" label="Collection description" />
		<div
			class="rounded-lg border px-3 {!collectionFormErrors.description?.length && !descriptionError
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
	<div class="mb-3">
		<Label label="Collection Image" required requiredAtPos="end" />
		<div class="rounded-lg border p-3 flex gap-1 flex-wrap border-gray-200 bg-gray-50">
			{#if media}
				<div
					class="h-50 w-50 relative rounded-md bg-white bg-cover bg-center bg-no-repeat {media.alt?.trim()
						? 'ring-1 ring-gray-200'
						: 'ring-2 ring-red-500'}"
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
								subText={!media.alt?.trim() ? $tranFunc('helpText.fieldRequired') : undefined}
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
	</div>

	<MetadataEditor title="Metadata" bind:data={metadata} {disabled} />
	<div class="h-2"></div>
	<MetadataEditor title="Private Metadata" bind:data={privateMetadata} {disabled} />
</div>
