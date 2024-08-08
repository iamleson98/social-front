<script lang="ts">
	import { tClient } from '$i18n';
	import type { CategoryCountableConnection, CategoryCountableEdge } from '$lib/gql/graphql';

	const categoryLevelsMap: Record<number, string> = {
		0: tClient('common.level1'),
		1: tClient('common.level2'),
		2: tClient('common.level3'),
		3: tClient('common.level4'),
		4: tClient('common.level5')
	};

	type Props = {
		children: CategoryCountableConnection;
		onActivateIndex: (level: number, edge: CategoryCountableEdge) => void;
		level: number;
	};

	let { children, onActivateIndex, level }: Props = $props();

	let activeIndex = $state<number>();

	const handleCategoryClick = (idx: number, edge: CategoryCountableEdge) => {
		activeIndex = idx;
		onActivateIndex(level, edge);
	};
</script>

<li class="w-1/4 !flex-nowrap">
	<!-- svelte-ignore a11y_missing_attribute -->
	<a class="!pointer-events-none">{categoryLevelsMap[level]}</a>
	<ul class="sitename-scrollbar overflow-y-auto overflow-x-hidden">
		{#each children.edges as edge, idx (idx)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<li
				role="button"
				tabindex="0"
				onclick={() => handleCategoryClick(idx, edge)}
				class="rounded-md"
				class:!bg-blue-100={idx === activeIndex}
				class:!text-blue-600={idx === activeIndex}
			>
				<span>{edge.node.name}</span>
			</li>
		{/each}
	</ul>
</li>
