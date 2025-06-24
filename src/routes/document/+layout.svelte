<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const ELEMENTS = [
		{
			name: 'Break point',
			path: '/document/break-point',
		},
		{
			name: 'Button',
			path: '/document/button',
		},
		{
			name: 'Checkbox',
			path: '/document/checkbox',
		},
		{
			name: 'Radio',
			path: '/document/radio',
		},
		{
			name: 'Input',
			path: '/document/input',
		},
		{
			name: 'Table',
			path: '/document/table',
		},
		{
			name: 'Select',
			path: '/document/select',
		},
		{
			name: 'GraphiQL',
			path: '/document/graphql',
		},
		{
			name: 'Image select',
			path: '/document/image-select',
		},
		{
			name: 'Metadata',
			path: '/document/metadata',
		},
	];
</script>

<div class="flex gap-2">
	<div class="w-1/5">
		<ul class="menu bg-base-200 rounded-box w-56">
			{#each ELEMENTS as element, idx (idx)}
				<li>
					<a
						href={element.path}
						class:text-blue-600={page.url.pathname === element.path}
						class:bg-blue-200={page.url.pathname === element.path}>{element.name}</a
					>
				</li>
			{/each}
		</ul>
	</div>

	<div class="w-4/5">
		{@render children()}
	</div>
</div>
