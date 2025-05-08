<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FileInput, Input, Label } from '$lib/components/ui/Input';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { PhotoUp, Trash } from '$lib/components/icons';
	import Accordion from '$lib/components/ui/Accordion/accordion.svelte';
	import ErrorMsg from '$lib/components/pages/settings/products/new/error-msg.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';

	import type { MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import type { MetadataInput } from '$lib/gql/graphql';
	import { IMAGE_EXTENSION_REGEX } from '$lib/utils/consts';
	import { object, string, array, number, z } from 'zod';
	import { createEventDispatcher } from 'svelte';

	type Props = {
		name: string;
		description?: any;
		disabled?: boolean;
		isCreatePage?: boolean;
		media: MediaObject | null;
		metadata: MetadataInput[];
		privateMetadata: MetadataInput[];
		backgroundImageAlt?: string;
	};

	let {
		name = $bindable(''),
		description = $bindable(),
		disabled = $bindable(false),
		isCreatePage = $bindable(false),
		media = $bindable<MediaObject | null>(null),
		metadata = $bindable<MetadataInput[]>([]),
		privateMetadata = $bindable<MetadataInput[]>([]),
		backgroundImageAlt = $bindable('')
	}: Props = $props();

	const dispatch = createEventDispatcher();
	const handleNameInputChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		name = input.value;
		dispatch('nameChange', { name });
	};

	let descriptionError = $state<string>();
	let collectionFormErrors = $state.raw<Partial<Record<keyof CollectionSchema, string[]>>>({});
	let error = $derived.by(
		() =>
			media &&
			((!media.alt?.trim() && !backgroundImageAlt?.trim()) || (isCreatePage && !media.alt?.trim()))
	);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const collectionSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		description: string().nonempty(REQUIRED_ERROR),
		metadata: array(
			object({
				key: string().nonempty(REQUIRED_ERROR),
				value: string().nonempty(REQUIRED_ERROR)
			})
		),
		privateMetadata: array(
			object({
				key: string().nonempty(REQUIRED_ERROR),
				value: string().nonempty(REQUIRED_ERROR)
			})
		),
		media: object({
			alt: string().nonempty(REQUIRED_ERROR),
			width: number(),
			height: number(),
			file: object({
				name: string().nonempty(REQUIRED_ERROR),
				size: number(),
				type: string().nonempty(REQUIRED_ERROR)
			})
		})
	});

	type CollectionSchema = z.infer<typeof collectionSchema>;

	const handleChangeDescription = (data: any) => {
		description = data;
		descriptionError = !data?.blocks?.length ? $tranFunc('helpText.fieldRequired') : undefined;
	};

	const handleFileSelect = async (fileList: FileList) => {
		if (!fileList.length || media) return;

		const file = fileList[0];
		const url = URL.createObjectURL(file);
		const alt = file.name.replace(IMAGE_EXTENSION_REGEX, '');

		await new Promise<void>((resolve) => {
			const img = new Image();
			img.onload = () => {
				media = { file, url, alt, width: img.width, height: img.height };
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

	const getDescriptionText = (data: any): string => {
		return data?.blocks?.length ? JSON.stringify(data) : '';
	};

	const validate = () => {
		const result = collectionSchema.safeParse({
			name,
			description: getDescriptionText(description),
			metadata,
			privateMetadata,
			media,
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

<div class="bg-white rounded-lg border w-full border-gray-200 pb-2">
	<h2 class="text-lg font-semibold p-3">General Information</h2>
	<Input
		label="Name"
		bind:value={name}
		required
		{disabled}
		class="flex-1 p-3"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		oninput={handleNameInputChange}
		variant={collectionFormErrors.name?.length ? 'error' : 'info'}
		subText={collectionFormErrors.name?.length ? collectionFormErrors.name[0] : ''}
	/>

	<div class="mb-3 px-3">
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
	<div class="mb-3 px-3">
		<Label label="Collection Image" required requiredAtPos="end" />
		<div
			class="rounded-lg border p-3 flex gap-1 flex-wrap {error
				? 'border-red-200 bg-red-50'
				: 'border-gray-200 bg-gray-50'}"
		>
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
		{#each metadata as item, idx}
			<div class="flex gap-5 items-center mb-3">
				<Input
					placeholder="Key"
					{disabled}
					class="flex-1"
					required
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
					bind:value={item.key}
					variant={collectionFormErrors.metadata?.length ? 'error' : 'info'}
					subText={collectionFormErrors.metadata?.length ? collectionFormErrors.metadata[0] : ''}
				/>
				<Input
					placeholder="Value"
					{disabled}
					class="flex-1"
					required
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
					bind:value={item.value}
					variant={collectionFormErrors.metadata?.length ? 'error' : 'info'}
					subText={collectionFormErrors.metadata?.length ? collectionFormErrors.metadata[0] : ''}
				/>
				<IconButton
					icon={Trash}
					size="xs"
					color="red"
					variant="light"
					class="tooltip tooltip-top"
					data-tip="Remove"
					onclick={() => (metadata = metadata.filter((_, i) => i !== idx))}
				/>
			</div>
		{/each}
		<Button
			size="xs"
			variant="light"
			color="blue"
			onclick={() => (metadata = metadata.concat({ key: '', value: '' }))}
		>
			Add Field
		</Button>
	</Accordion>

	<!-- privateMetadata -->
	<Accordion header="Private Metadata" open={false}>
		{#each privateMetadata as item, idx}
			<div class="flex gap-5 items-center my-2">
				<Input
					placeholder="Key"
					{disabled}
					class="flex-1"
					required
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
					variant={collectionFormErrors.privateMetadata?.length ? 'error' : 'info'}
					subText={collectionFormErrors.privateMetadata?.length
						? collectionFormErrors.privateMetadata[0]
						: ''}
					bind:value={item.key}
				/>
				<Input
					placeholder="Value"
					{disabled}
					class="flex-1"
					required
					inputDebounceOption={{ onInput: validate }}
					onblur={validate}
					bind:value={item.value}
					variant={collectionFormErrors.privateMetadata?.length ? 'error' : 'info'}
					subText={collectionFormErrors.privateMetadata?.length
						? collectionFormErrors.privateMetadata[0]
						: ''}
				/>
				<IconButton
					icon={Trash}
					size="xs"
					color="red"
					variant="light"
					class="tooltip tooltip-top"
					data-tip="Remove"
					onclick={() => (privateMetadata = privateMetadata.filter((_, i) => i !== idx))}
				/>
			</div>
		{/each}
		<Button
			size="xs"
			variant="light"
			color="blue"
			onclick={() => (privateMetadata = privateMetadata.concat({ key: '', value: '' }))}
		>
			Add Field
		</Button>
	</Accordion>
</div>
