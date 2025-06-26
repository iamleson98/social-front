<script lang="ts">
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import { Button } from '$lib/components/ui';
	import Checkbox from '$lib/components/ui/Input/checkbox.svelte';
	import Input from '$lib/components/ui/Input/input.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { toast } from 'svelte-sonner';

	let media = $state<MediaObject[]>([]);
	let maxImage = $state(1);
	let isLoading = $state(false);
	let required = $state(false);

	let disabled = $derived(maxImage < 1);

	const handleCopy = () => {
		let text = `<FileInputContainer 
    accept="image/*" 
    max={${maxImage}} 
    label="Select image" 
    ${required ? 'required' : ''}
    bind:medias={media} 
    disabled={${isLoading}} 
    />`;

		navigator.clipboard.writeText(text).then(() => {
			toast.success(`Copied code: ${text}`);
		});
	};
</script>

<div class="space-y-2">
	<Input placeholder="Max image" label="Max image" type="number" bind:value={maxImage} />
	<Checkbox label="Loading" bind:checked={isLoading} />
	<Checkbox label="Required" bind:checked={required} />
	<FileInputContainer
		accept="image/*"
		max={maxImage}
		label="Select image"
		{required}
		bind:medias={media}
		disabled={isLoading}
	/>
	<Button {disabled} onclick={handleCopy}>Copy</Button>
</div>
