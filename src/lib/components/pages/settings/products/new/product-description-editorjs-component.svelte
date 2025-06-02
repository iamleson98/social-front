<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { tranFunc } from '$i18n';
	import type { OutputData } from '@editorjs/editorjs';

	type Props = {
		description?: OutputData;
		ok: boolean;
	};

	let { description = $bindable(), ok = $bindable() }: Props = $props();
	let descriptionError = $state<string>();

	const handleChangeDescription = (data: any) => {
		description = data;
		descriptionError =
			!data || !data?.blocks.length ? $tranFunc('helpText.fieldRequired') : undefined;

		ok = !descriptionError;
	};
</script>

<EditorJSComponent
	header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
	simpleImage
	list={{
		defaultStyle: 'unordered',
		maxLevel: 3,
		inlineToolbar: true,
	}}
	embed={{
		services: {
			youtube: true,
		},
	}}
	quote={{ inlineToolbar: true }}
	onchange={handleChangeDescription}
	placeholder={$tranFunc('placeholders.valuePlaceholder')}
	bind:value={description}
	variant={descriptionError ? 'error' : 'info'}
	subText={descriptionError}
	required
	label="Product description"
	class="mb-3"
/>
