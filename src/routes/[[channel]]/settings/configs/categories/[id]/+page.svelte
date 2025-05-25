<script lang="ts">
	import { CATEGORY_DETAIL_QUERY } from "$lib/api";
	import { operationStore } from "$lib/api/operation";


  const categoryQuery = operationStore({
    kind: 'query',
    query: CATEGORY_DETAIL_QUERY
  })
</script>

