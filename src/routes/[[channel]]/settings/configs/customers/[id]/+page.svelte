<script lang="ts">
	import { page } from '$app/state';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryUserArgs } from '$lib/gql/graphql';

	const userDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id
		}
	});
</script>

{#if $userDetailQuery.fetching}
	<SkeletonContainer>
		<Skeleton class="w-full h-4" />
	</SkeletonContainer>
{:else if $userDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$userDetailQuery.error.message}</Alert>
{:else if $userDetailQuery.data}
	<div class="h-full">
		<div class="flex items-center gap-2">
			<img
				src={$userDetailQuery.data?.user?.avatar?.url}
				alt={$userDetailQuery.data?.user?.avatar?.alt}
				class="w-12 h-12 rounded-full"
			/>
			<div>
				<div>{$userDetailQuery.data?.user?.firstName} {$userDetailQuery.data?.user?.lastName}</div>
				<div>{$userDetailQuery.data?.user?.email}</div>
			</div>
		</div>
	</div>
{/if}
