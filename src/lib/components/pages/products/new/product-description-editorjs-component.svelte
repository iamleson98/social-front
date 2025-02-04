<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { RequiredAt } from '$lib/components/ui';
	import { tranFunc } from '$i18n';
	import ErrorMsg from './error-msg.svelte';

	type Props = {
		description?: any;
		error?: string;
	};

	let { description = $bindable(), error }: Props = $props();
</script>

<div class="mb-3">
	<RequiredAt class="text-sm" label={$tranFunc('product.prdDescription')} required />

	<div
		class="rounded-lg border p-3 {error
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
			onchange={(data) => (description = data)}
			placeholder={$tranFunc('product.valuePlaceholder')}
		/>
	</div>
	<ErrorMsg {error} />
</div>
