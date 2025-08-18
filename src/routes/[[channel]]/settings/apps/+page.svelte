<script lang="ts">
	import { APPS_QUERY } from '$lib/api/admin/app';
	import { operationStore } from '$lib/api/operation';
	import type { Query, QueryAppsArgs } from '$lib/gql/graphql';
	import { onMount } from 'svelte';

	const AppsQuery = operationStore<Pick<Query, 'apps'>, QueryAppsArgs>({
		query: APPS_QUERY,
		variables: {
			first: 10,
		},
	});

	onMount(() =>
		AppsQuery.subscribe((result) => {
			if (result.data?.apps) {
				console.log(result.data.apps);
			}
		}),
	);
</script>

<div>Apps</div>
