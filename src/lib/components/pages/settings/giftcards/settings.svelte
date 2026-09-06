<script lang="ts">
        import { T } from '$i18n';
        import type { TranslationKey } from '$i18n/types';
        import {
                GIFT_CARD_TAGS_QUERY,
                GIFTCARD_SETTINGS_QUERY,
                GIFTCARD_SETTINGS_UPDATE_MUTATION,
                GIFT_CARD_BULK_CREATE_MUTATION,
        } from '$lib/api/admin/giftcards';
        import { GRAPHQL_CLIENT } from '$lib/api/client';
        import { operationStore } from '$lib/api/operation';
        import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
        import { SettingCog } from '$lib/components/icons';
        import { Alert } from '$lib/components/ui/Alert';
        import { IconButton } from '$lib/components/ui/Button';
        import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
        import { Checkbox, Input } from '$lib/components/ui/Input';
        import { Modal } from '$lib/components/ui/Modal';
        import {
                GraphqlPaginableSelect,
                Select,
                SelectSkeleton,
                type SelectOption,
        } from '$lib/components/ui/select';
        import {
                GiftCardSettingsExpiryTypeEnum,
                TimePeriodTypeEnum,
                type GiftCardBulkCreateInput,
                type GiftCardSettingsUpdateInput,
                type Mutation,
                type MutationGiftCardBulkCreateArgs,
                type MutationGiftCardSettingsUpdateArgs,
                type Query,
                type QueryGiftCardTagsArgs,
        } from '$lib/gql/graphql';
        import { CommonState } from '$lib/utils/common.svelte';
        import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
        import { createSchemaHandler } from '$lib/utils/zod.svelte';
        import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
        import { camelCase } from 'es-toolkit';
        import { onMount } from 'svelte';
        import { array, boolean, number, object, string } from 'zod';

        const { }: {} = $props();

        const GiftcardSettingsQuery = operationStore<Pick<Query, 'giftCardSettings'>>({
                query: GIFTCARD_SETTINGS_QUERY,
                requestPolicy: 'cache-and-network',
                pause: true, // only execute when user choose to open setting modal
        });

        let loading = $state(false);
        let openSettingModal = $state(false);
        let openBulkIssueModal = $state(false);

        const createDefaultBulkIssueInput = () => ({
                count: 1,
                tags: [],
                balance: {
                        amount: 0,
                        currency: '',
                },
                isActive: false,
                expiryDate: '',
        });

        let bulkIssueInput = $state<GiftCardBulkCreateInput>(createDefaultBulkIssueInput());

        const giftcardSchema = object({
                count: number().min(1, $CommonState.NonNegativeError),
                tags: array(string()),
                amount: number().min(1, $CommonState.NonNegativeError),
                currency: string().nonempty($CommonState.FieldRequiredError),
                isActive: boolean(),
                expiryDate: string().optional(),
        });
        const SchemaHandler = createSchemaHandler(giftcardSchema, () => ({
                ...bulkIssueInput,
                amount: bulkIssueInput.balance.amount,
                currency: bulkIssueInput.balance.currency,
        }));

        let giftcardSettingInput = $state<GiftCardSettingsUpdateInput>({
                expiryType: GiftCardSettingsExpiryTypeEnum.ExpiryPeriod,
                expiryPeriod: {
                        amount: 0,
                        type: TimePeriodTypeEnum.Day,
                },
        });

        const ExpiryTypes = Object.values(GiftCardSettingsExpiryTypeEnum).map<SelectOption>((value) => ({
                value,
                label: $T(`giftcard.expiryType.${camelCase(value)}` as TranslationKey),
        }));
        const ExpiryPeriodTypes = Object.values(TimePeriodTypeEnum).map<SelectOption>((value) => ({
                value,
                label: $T(`giftcard.periodType.${camelCase(value)}` as TranslationKey),
        }));

        onMount(() =>
                GiftcardSettingsQuery.subscribe((result) => {
                        if (result.data?.giftCardSettings) {
                                const { expiryType, expiryPeriod } = result.data.giftCardSettings;
                                giftcardSettingInput = {
                                        expiryType,
                                        expiryPeriod: {
                                                amount: expiryPeriod?.amount || 0,
                                                type: expiryPeriod?.type || TimePeriodTypeEnum.Day,
                                        },
                                };
                        }
                }),
        );

        const handleClickOpenSetting = () => {
                openSettingModal = true;
                GiftcardSettingsQuery.reexecute({ variables: {} });
        };

        const handleUpdateSettings = async () => {
                loading = true;
                const result = await GRAPHQL_CLIENT.mutation<
                        Pick<Mutation, 'giftCardSettingsUpdate'>,
                        MutationGiftCardSettingsUpdateArgs
                >(GIFTCARD_SETTINGS_UPDATE_MUTATION, { input: giftcardSettingInput });
                loading = false;

                if (checkIfGraphqlResultHasError(result, 'giftCardSettingsUpdate', $CommonState.EditSuccess))
                        return;

                openSettingModal = false;
        };

        const handleBulkIssue = async () => {
                loading = true;
                const result = await GRAPHQL_CLIENT.mutation<
                        Pick<Mutation, 'giftCardBulkCreate'>,
                        MutationGiftCardBulkCreateArgs
                >(GIFT_CARD_BULK_CREATE_MUTATION, {
                        input: bulkIssueInput,
                });
                loading = false;

                if (checkIfGraphqlResultHasError(result, 'giftCardBulkCreate', $CommonState.CreateSuccess))
                        return;

                bulkIssueInput = createDefaultBulkIssueInput(); // reset form
                openBulkIssueModal = false;
        };

        const SettingOptions: MenuItemProps[] = [
                { children: $T('common.settings'), onclick: handleClickOpenSetting },
                { children: $T('giftcard.bulkIssue'), onclick: () => (openBulkIssueModal = true) },
        ];
</script>

<DropDown placement="bottom-end" options={SettingOptions}>
        {#snippet trigger({ onclick })}
                <IconButton
                        icon={SettingCog}
                        {onclick}
                        color="gray"
                        size="sm"
                        aria-label={$T('common.settings')}
                        data-tip={$T('common.settings')}
                        class="tooltip tooltip-left"
                        disabled={loading}
                />
        {/snippet}
</DropDown>

<!-- MARK: Setting modal -->
<Modal
        open={openSettingModal}
        header={$T('common.settings')}
        onCancel={() => (openSettingModal = false)}
        onClose={() => (openSettingModal = false)}
        onOk={handleUpdateSettings}
        disableElements={loading}
        size="sm"
        closeOnEscape
        closeOnOutsideClick
>
        {#if $GiftcardSettingsQuery.fetching}
                <SelectSkeleton label />
        {:else if $GiftcardSettingsQuery.error}
                <Alert variant="error">{$GiftcardSettingsQuery.error.message}</Alert>
        {:else if $GiftcardSettingsQuery.data?.giftCardSettings}
                <div class="space-y-2">
                        <Select
                                required
                                disabled={loading}
                                options={ExpiryTypes}
                                label={$T('giftcard.form.expiryType')}
                                bind:value={giftcardSettingInput.expiryType!}
                                placeholder="Select type"
                        />

                        {#if giftcardSettingInput.expiryType === GiftCardSettingsExpiryTypeEnum.ExpiryPeriod}
                                <div class="grid grid-cols-2 gap-2">
                                        <Input
                                                type="number"
                                                disabled={loading}
                                                bind:value={giftcardSettingInput.expiryPeriod!.amount}
                                                placeholder={$T('giftcard.duration')}
                                                label={$T('giftcard.duration')}
                                                required
                                        />
                                        <Select
                                                disabled={loading}
                                                options={ExpiryPeriodTypes}
                                                label={$T('giftcard.form.unit')}
                                                placeholder={$T('giftcard.form.unit')}
                                                required
                                                bind:value={giftcardSettingInput.expiryPeriod!.type}
                                        />
                                </div>
                        {/if}
                </div>
        {/if}
</Modal>

<!-- MARK: Bulk issue modal -->
<Modal
        open={openBulkIssueModal}
        header={$T('giftcard.bulkIssue')}
        onCancel={() => (openBulkIssueModal = false)}
        onClose={() => (openBulkIssueModal = false)}
        onOk={handleBulkIssue}
        size="sm"
        disableElements={loading}
        closeOnEscape
        closeOnOutsideClick
>
        <div class="space-y-2">
                <Alert>
                        {$T('giftcard.bulkIssueAlert')}
                </Alert>
                <Input
                        type="number"
                        placeholder={$T('product.quantity')}
                        label={$T('product.quantity')}
                        class="flex-1"
                        bind:value={bulkIssueInput.count}
                        disabled={loading}
                        required
                        onblur={SchemaHandler.validate}
                        inputDebounceOption={{ onInput: SchemaHandler.validate }}
                        variant={$SchemaHandler.count?.length ? 'error' : 'info'}
                        subText={$SchemaHandler.count?.[0]}
                />
                <div class="flex items-start gap-2">
                        <Input
                                type="number"
                                min={1}
                                placeholder={$T('giftcard.form.amount')}
                                label={$T('giftcard.form.amount')}
                                class="flex-1"
                                bind:value={bulkIssueInput.balance.amount}
                                disabled={loading}
                                required
                                onblur={SchemaHandler.validate}
                                inputDebounceOption={{ onInput: SchemaHandler.validate }}
                                variant={$SchemaHandler.amount?.length ? 'error' : 'info'}
                                subText={$SchemaHandler.amount?.[0]}
                        />
                        <ShopCurrenciesSelect
                                label={$T('common.currency')}
                                class="flex-1"
                                required
                                placeholder={$T('common.currency')}
                                bind:value={bulkIssueInput.balance.currency}
                                disabled={loading}
                                onblur={SchemaHandler.validate}
                                onchange={SchemaHandler.validate}
                                variant={$SchemaHandler.currency?.length ? 'error' : 'info'}
                                subText={$SchemaHandler.currency?.[0]}
                        />
                </div>
                <GraphqlPaginableSelect
                        query={GIFT_CARD_TAGS_QUERY}
                        variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
                        resultKey="giftCardTags"
                        variableSearchQueryPath="filter.search"
                        optionValueKey="name"
                        optionLabelKey="name"
                        requestPolicy="cache-and-network"
                        multiple
                        label={$T('giftcard.form.tags')}
                        placeholder={$T('giftcard.form.tags')}
                        bind:value={bulkIssueInput.tags}
                        disabled={loading}
                />
                <GiftcardExpirationForm bind:expiryDate={bulkIssueInput.expiryDate} disabled={loading} />
                <Checkbox
                        label={$T('staff.active')}
                        bind:checked={bulkIssueInput.isActive}
                        disabled={loading}
                />
        </div>
</Modal>
