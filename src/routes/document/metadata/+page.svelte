<script lang="ts">
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { toast } from 'svelte-sonner';

	let metadata = $state([]);
	let privateMetadata = $state([]);
	let loading = $state(false);
	let performUpdateMetadata = $state(false);
	const handleCopy = () => {
		let text = `<GeneralMetadataEditor
        {metadata}
        {privateMetadata}
        objectId={''}
        disabled={loading}
        bind:performUpdateMetadata
      />`;

		navigator.clipboard.writeText(text).then(() => {
			toast.success(`Copied code: ${text}`);
		});
	};
</script>

<GeneralMetadataEditor
	{metadata}
	{privateMetadata}
	objectId={''}
	disabled={loading}
	bind:performUpdateMetadata
/>

<Button onclick={handleCopy} class="mt-3">Copy</Button>
