<script lang="ts">
	import { goto } from '$app/navigation';
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Search } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import type { Query, QueryProductsArgs } from '$lib/gql/graphql';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { CHANNEL_KEY, DEBOUNCE_INPUT_TIME, SearchParamKey } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';

	interface Suggestion {
		id: string;
		name: string;
		slug: string;
		thumbnailUrl?: string | null;
	}

	const MIN_SEARCH_LENGTH = 2;
	const SUGGESTION_COUNT = 6;

	let searchTerm = $state('');
	let suggestions = $state<Suggestion[]>([]);
	let searching = $state(false);
	let dropdownOpen = $state(false);
	let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
	let searchContainer: HTMLDivElement;

	const MIN_LOADING_MS = 250;

	/** live product suggestions while the user types */
	const fetchSuggestions = async (term: string): Promise<void> => {
		const startedAt = Date.now();
		searching = true;

		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'products'>, QueryProductsArgs>(
			PRODUCT_LIST_QUERY,
			{
				channel: getCookieByKey(CHANNEL_KEY),
				search: term,
				first: SUGGESTION_COUNT,
			},
			{ requestPolicy: 'network-only' },
		);

		const elapsed = Date.now() - startedAt;
		if (elapsed < MIN_LOADING_MS) {
			await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
		}

		searching = false;
		if (checkIfGraphqlResultHasError(result)) {
			return;
		}

		suggestions = (result.data?.products?.edges || [])
			.map(({ node }) => ({
				id: node.id,
				name: node.name,
				slug: node.slug,
				thumbnailUrl: node.thumbnail?.url,
			}))
			.filter((s) => s.slug);
	};

	const handleInput = (): void => {
		clearTimeout(debounceTimeout);

		const term = searchTerm.trim();
		if (term.length < MIN_SEARCH_LENGTH) {
			dropdownOpen = false;
			suggestions = [];
			return;
		}

		debounceTimeout = setTimeout(() => {
			void fetchSuggestions(term).then(() => {
				dropdownOpen = true;
			});
		}, DEBOUNCE_INPUT_TIME);
	};

	const submitSearch = (): void => {
		const term = searchTerm.trim();
		if (!term) {
			return;
		}

		dropdownOpen = false;
		void goto(`${AppRoute.HOME()}?${SearchParamKey.SEARCH_QUERY}=${encodeURIComponent(term)}`);
	};

	const closeDropdown = (evt: MouseEvent): void => {
		if (!searchContainer?.contains(evt.target as Node)) {
			dropdownOpen = false;
		}
	};

	const handleKeydown = (evt: KeyboardEvent): void => {
		if (evt.key === 'Escape') {
			dropdownOpen = false;
		}
	};
</script>

<svelte:document onpointerdown={closeDropdown} />
<svelte:window onkeydown={handleKeydown} />

<div bind:this={searchContainer} class="relative w-full">
	<div class="flex items-center gap-1">
		<input
			type="search"
			class="input input-sm input-bordered w-full bg-gray-50 border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
			placeholder={$T('common.search')}
			bind:value={searchTerm}
			oninput={handleInput}
			onkeydown={(evt) => evt.key === 'Enter' && submitSearch()}
			onfocus={() => suggestions.length && (dropdownOpen = true)}
			aria-label={$T('common.search')}
			autocomplete="off"
		/>
		<IconButton
			icon={Search}
			size="sm"
			variant="filled"
			color="blue"
			aria-label={$T('common.search')}
			onclick={submitSearch}
		/>
	</div>

	{#if dropdownOpen}
		<div
			class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden"
			transition:fly={{ y: 4, duration: 120 }}
		>
			{#if searching}
				<div class="p-2 space-y-2">
					{#each Array(3) as _, idx (idx)}
						<div class="flex items-center gap-2 px-1">
							<Skeleton class="h-9 w-9 rounded-md" />
							<Skeleton class="h-4 w-2/3" />
						</div>
					{/each}
				</div>
			{:else if suggestions.length}
				<ul class="max-h-96 overflow-auto">
					{#each suggestions as suggestion (suggestion.id)}
						<li>
							<a
								href={AppRoute.PRODUCT_DETAILS(suggestion.slug)}
								class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
								onclick={() => (dropdownOpen = false)}
							>
								{#if suggestion.thumbnailUrl}
									<img
										src={suggestion.thumbnailUrl}
										alt={suggestion.name}
										class="h-9 w-9 rounded-md object-cover border border-gray-100"
									/>
								{/if}
								<span class="text-sm text-gray-700 line-clamp-1">{suggestion.name}</span>
							</a>
						</li>
					{/each}
				</ul>
				<button
					class="w-full text-center text-xs text-blue-600 font-medium py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors"
					onclick={submitSearch}
				>
					{$T('common.search')}: "{searchTerm.trim()}"
				</button>
			{:else}
				<div class="p-4 text-center text-sm text-gray-400">{$T('error.noResult')}</div>
			{/if}
		</div>
	{/if}
</div>
