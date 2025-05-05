<script lang="ts">
	import { IconButton } from '$lib/components/ui/Button';
	import type { SocialSize } from '$lib/components/ui/common';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
	import type { SocialVariant } from '$lib/utils';
	// import { Input } from '$lib/components/ui/Input';
	// import { Label } from '$lib/components/ui/Label';

	const socialSizes: SocialSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

	const variants: SocialVariant[] = ['info', 'success', 'warning', 'error'];

	let subText = $state<string>('This is subtext');
	let variant = $state<SocialVariant>('info');
</script>

<div>
	<div class="mb-3 flex items-center gap-3">
		{#each variants as myVariant, idx (idx)}
			<RadioButton bind:group={variant} value={myVariant} label={myVariant} />
		{/each}
	</div>
</div>

<div>
	<!-- <Label>Checkbox</Label> -->
	{#each socialSizes as size, idx (idx)}
		<div class="mb-3 flex items-center gap-3">
			<Checkbox {size} label={size} {subText} {variant} />
			<!-- <IconButton icon={Clipboard} /> -->
		</div>
	{/each}
</div>
