<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import { PhotoUp, Trash } from '$lib/components/icons';
	import ErrorMsg from '$lib/components/pages/settings/products/new/error-msg.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import type { MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import { object, string, z } from 'zod';
	import { IconButton } from '$lib/components/ui/Button';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { OutputData } from '@editorjs/editorjs';

	type Props = {
		name: string;
		description?: OutputData;
		disabled?: boolean;
		media?: MediaObject;
		ok?: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		media = $bindable<MediaObject | undefined>(),
		ok = $bindable(),
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	let descriptionError = $derived.by(() => {
		if (!description?.blocks?.length) return REQUIRED_ERROR;
		return undefined;
	});
	let collectionFormErrors = $state.raw<Partial<Record<keyof CollectionSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(collectionFormErrors).length && !descriptionError;
	});

	const collectionSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		media: object({
			alt: string().nonempty(REQUIRED_ERROR),
		}).nullable(),
	});
	type CollectionSchema = z.infer<typeof collectionSchema>;

	const handleFileSelect = async (fileList: FileList) => {
		if (!fileList.length || media) return;

		const file = fileList[0];
		const url = URL.createObjectURL(file);
		const alt = file.name.replace(IMAGE_EXTENSION_REGEX, '');
		const img = new Image();
		img.src = url;
		img.onload = () => {
			media = {
				file,
				url,
				alt,
				width: img.width,
				height: img.height,
			};
		};
	};

	const handleDeleteImage = () => {
		if (media) {
			URL.revokeObjectURL(media.url);
			media = undefined;
		}
	};

	const validate = () => {
		const result = collectionSchema.safeParse({
			name,
			media,
		});

		if (!result.success) {
			collectionFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}

		collectionFormErrors = {};
		return true;
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-2">
	<SectionHeader>General Information</SectionHeader>
	<Input
		label="Name"
		bind:value={name}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={collectionFormErrors.name?.length ? 'error' : 'info'}
		subText={collectionFormErrors.name?.length ? collectionFormErrors.name[0] : undefined}
	/>
	<EditorJSComponent
		header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
		simpleImage
		list={{ defaultStyle: 'unordered', maxLevel: 3, inlineToolbar: true }}
		embed={{ services: { youtube: true } }}
		quote={{ inlineToolbar: true }}
		onchange={(data) => (description = data)}
		placeholder={$tranFunc('placeholders.valuePlaceholder')}
		bind:value={description}
		variant={descriptionError ? 'error' : 'info'}
		subText={descriptionError}
		required
		label="Collection description"
	/>

	<!-- Media Upload -->
	<div>
		<Label label="Collection Image" required requiredAtPos="end" />
		<div
			class="rounded-lg border flex gap-1 flex-wrap p-3 {collectionFormErrors.media?.length
				? 'border-red-200 bg-red-50'
				: 'border-gray-200 bg-gray-50'}"
		>
			{#if media}
				{@const outerClass = collectionFormErrors.media?.length
					? 'ring-2 ring-red-500'
					: 'ring-1 ring-gray-200'}
				<div
					class="h-50 w-50 relative rounded-md bg-white bg-cover bg-center bg-no-repeat {outerClass}"
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
								onblur={validate}
								inputDebounceOption={{ onInput: validate }}
								variant={collectionFormErrors.media?.length ? 'error' : 'info'}
								subText={collectionFormErrors.media?.length
									? collectionFormErrors.media[0]
									: undefined}
							/>
						</div>
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
		<ErrorMsg error={collectionFormErrors.media?.[0]} />
	</div>
</div>
