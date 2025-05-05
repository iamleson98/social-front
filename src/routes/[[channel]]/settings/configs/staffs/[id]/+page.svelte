<script lang="ts">
  import { page } from '$app/state';
  import { operationStore } from '$lib/api/operation';
  import { STAFF_UPDATE_MUTATION } from '$lib/api/admin/staff';
  import { Alert } from '$lib/components/ui/Alert';
  import {
    type Mutation,
    type MutationStaffUpdateArgs,
    type Query,
    type QueryUserArgs
  } from '$lib/gql/graphql';
  import StaffDetailSkeleton from '$lib/components/pages/settings/config/staff/staff-detail-skeleton.svelte';
  import { Button } from '$lib/components/ui';
  import { AppRoute } from '$lib/utils';
  import { GRAPHQL_CLIENT } from '$lib/api/client';
  import { toastStore } from '$lib/stores/ui/toast';
  import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
  import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
  import { Checkbox, Input } from '$lib/components/ui/Input';

  const staffDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
    kind: 'query',
    query: USER_DETAIL_QUERY,
    variables: { id: page.params.id },
    requestPolicy: 'cache-and-network'
  });

  let loading = $state(false);
  let initialIsActive = $state(false);
  let isActive = $state($staffDetailQuery.data?.user?.isActive);

  $effect(() => {
    if ($staffDetailQuery.data?.user) {
      initialIsActive = $staffDetailQuery.data.user.isActive;
      isActive = initialIsActive;
    }
  });

  function onNothingChange() {
    return isActive === initialIsActive;
  }

  const handleUpdateStaff = async () => {
    loading = true;
    const result = await GRAPHQL_CLIENT.mutation<
      Pick<Mutation, 'staffUpdate'>,
      MutationStaffUpdateArgs
    >(STAFF_UPDATE_MUTATION, {
      id: $staffDetailQuery.data?.user?.id as string,
      input: {
        isActive: isActive
      }
    });

    loading = false;

    if (preHandleErrorOnGraphqlResult(result, 'userUpdate')) {
      console.log(result);
      return;
    }
    toastStore.send({
      variant: 'success',
      message: 'Staff updated successfully'
    });

    staffDetailQuery.reexecute({
      variables: {
        id: page.params.id
      },
      context: {
        requestPolicy: 'network-only'
      }
    });
  };
</script>

{#if $staffDetailQuery.fetching}
  <StaffDetailSkeleton />
{:else if $staffDetailQuery.error}
  <Alert variant="error" bordered size="sm">{$staffDetailQuery.error.message}</Alert>
{:else if $staffDetailQuery.data?.user}
  {@const { user } = $staffDetailQuery.data}
  <div class="h-full w-full rounded-lg bg-white border border-gray-200 p-4">
    <div
      class="rounded-full overflow-hidden h-20 w-20 flex items-center justify-center bg-blue-600"
    >
      {#if user.avatar}
        <img src={user.avatar?.url} alt={user.avatar?.alt} />
      {:else}
        <span class="text-white text-2xl font-bold">
          {`${user.firstName[0] || user.email[0]}${user.lastName[0] || user.email[1]}`.toUpperCase()}
        </span>
      {/if}
    </div>

    <div class="flex gap-2 items-start mt-5">
      <Input label="First name" value={user.firstName} required disabled class="flex-1" />
      <Input label="Last name" value={user.lastName} required disabled class="flex-1" />
    </div>

    <Input label="Email" value={user.email} class="mt-3" required disabled />

    <div class="mt-3">
      <Checkbox label="Active" bind:checked={isActive} size="sm" />
    </div>
  </div>
  <div
    class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
  >
    <Button color="red" disabled={loading} onclick={() => (loading = true)}>Delete</Button>

    <div class="flex gap-2">
      <Button
        variant="light"
        color="gray"
        disabled={loading}
        href={AppRoute.SETTINGS_CONFIGS_STAFFS()}>Back</Button
      >
      <Button disabled={loading || onNothingChange()} onclick={handleUpdateStaff}>Update</Button>
    </div>
  </div>
{/if}

