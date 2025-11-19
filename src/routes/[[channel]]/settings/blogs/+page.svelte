<script lang="ts">
	import { PAGE_LIST_QUERY } from '$lib/api/admin/page';
	import { Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/blogs/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Checkbox } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type { Page, QueryPagesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils/routes';
	import { SvelteSet } from 'svelte/reactivity';

	const PageColumns: TableColumnProps<Page>[] = [
		{
			title: selectAll,
			child: singleSelect,
		},
		{
			title: 'Title',
			child: title,
		},
		{
			title: 'Slug',
			child: slug,
		},
		{
			title: 'Visibility',
			child: visibility,
		},
	];

	let variables = $state<QueryPagesArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let selectedBlogIds = $state<SvelteSet<string>>(new SvelteSet());
	let tableRef = $state<GraphqlPaginableTableInterface>();
</script>

{#snippet title({ item }: { item: Page })}
	<a href={AppRoute.SETTINGS_BLOG_DETAILS(item.id)} class="link">{item.title}</a>
{/snippet}

{#snippet slug({ item }: { item: Page })}
	<span>{item.slug}</span>
{/snippet}

{#snippet selectAll({ items }: { items: Page[] })}
	<Checkbox
		checked={selectedBlogIds.size === items.length && !!items.length}
		onCheckChange={(checked) => {
			selectedBlogIds = checked ? new SvelteSet(items.map((item) => item.id)) : new SvelteSet();
		}}
		disabled={!items.length}
	/>
{/snippet}

{#snippet singleSelect({ item }: { item: Page })}
	<Checkbox
		size="sm"
		checked={selectedBlogIds.has(item.id)}
		onCheckChange={(checked) => {
			selectedBlogIds[checked ? 'add' : 'delete'](item.id);
		}}
	/>
{/snippet}

{#snippet visibility({ item }: { item: Page })}
	<Badge
		text={item.isPublished ? 'Published' : 'Pending'}
		color={item.isPublished ? 'green' : 'indigo'}
	/>
{/snippet}

<div class="mb-2 flex justify-between">
	<Filter bind:variables {tableRef} />

	<div class="flex gap-1.5">
		{#if selectedBlogIds.size}
			<Button size="sm" color="gray">Unpublish</Button>
			<Button size="sm" color="blue">Publish</Button>
			<IconButton icon={Trash} color="red" variant="light" size="sm" />
		{/if}
	</div>
</div>

<GraphqlPaginableTable
	query={PAGE_LIST_QUERY}
	resultKey="pages"
	columns={PageColumns}
	bind:variables
	bind:this={tableRef}
/>
