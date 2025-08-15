<script lang="ts">
	import { ACCOUNT_UPDATE_MUTATION } from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { RadioButton } from '$lib/components/ui/Input';
	import type { MetadataInput, Mutation, MutationAccountUpdateArgs } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils/routes';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { omit } from 'es-toolkit';
	import { onMount } from 'svelte';

	type Theme = 'light' | 'dark' | 'system';

	const ThemeName = 'theme';

	const Themes: Theme[] = ['dark', 'light', 'system'];

	let userPreferences = $state<MetadataInput[]>([]);

	onMount(() => {
		if ($READ_ONLY_USER_STORE) {
			const currentPreferences = $READ_ONLY_USER_STORE.metadata.map<MetadataInput>((item) =>
				omit(item, ['__typename']),
			);

			if (!currentPreferences.some((item) => item.key === ThemeName)) {
				currentPreferences.push({
					key: ThemeName,
					value: 'light' satisfies Theme,
				});
			}

			userPreferences = currentPreferences;
		}
	});

	// const MeMetadata = $READ_ONLY_USER_STORE?.metadata || [];

	const handleUpdatePreferences = () => {
		GRAPHQL_CLIENT.mutation<Pick<Mutation, 'accountUpdate'>, MutationAccountUpdateArgs>(
			ACCOUNT_UPDATE_MUTATION,
			{
				input: {
					// metadata,
				},
			},
		);
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>User preferences</div>
	</SectionHeader>

	{#each userPreferences as meta, idx (idx)}
		<div class={SitenameCommonClassName}>
			<SectionHeader>{meta.key}</SectionHeader>

			{#if meta.key === ThemeName}
				<div class="space-y-1">
					{#each Themes as theme, idx (idx)}
						<RadioButton value={theme} bind:group={meta.value} label={theme} size="sm" />
					{/each}
				</div>
			{:else}
				<div>{meta.value}</div>
			{/if}
		</div>
	{/each}
</div>

<ActionBar onUpdateClick={handleUpdatePreferences} backButtonUrl={AppRoute.ME()} />
