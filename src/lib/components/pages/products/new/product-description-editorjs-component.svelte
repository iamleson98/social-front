<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { tranFunc } from '$i18n';
	import ErrorMsg from './error-msg.svelte';
	import { Label } from '$lib/components/ui/Input';

	type Props = {
		description?: any;
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

<div class="mb-3">
	<Label required requiredAtPos="end" label={$tranFunc('product.prdDescription')} />

	<div
		class="rounded-lg border p-3 {!ok && descriptionError
			? 'bg-red-50 border-red-200'
			: 'border-gray-200 bg-gray-50'}"
	>
		<EditorJSComponent
			header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
			simpleImage
			list={{
				defaultStyle: 'unordered',
				maxLevel: 3,
				inlineToolbar: true
			}}
			embed={{
				services: {
					youtube: true
				}
			}}
			quote={{ inlineToolbar: true }}
			onchange={handleChangeDescription}
			placeholder={$tranFunc('placeholders.valuePlaceholder')}
			defaultValue={description}
		/>
	</div>
	<ErrorMsg error={descriptionError} />
</div>
