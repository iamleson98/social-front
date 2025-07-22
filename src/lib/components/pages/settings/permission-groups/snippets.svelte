<script lang="ts" module>
	import { AppRoute } from '$lib/utils';
	import type { User } from '$lib/gql/graphql';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';

	export { avatar, userName, email };
</script>

{#snippet avatar({ item }: { item: User })}
	<Thumbnail
		src={item.avatar?.url}
		alt={item.avatar?.alt || `${item.firstName} ${item.lastName}`}
		size="sm"
	/>
{/snippet}

{#snippet userName({ item }: { item: User })}
	<a href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(item.id)} class="link">
		{item.firstName}
		{item.lastName}
	</a>
{/snippet}

{#snippet email({ item }: { item: User })}
	<span>{item.email}</span>
{/snippet}
