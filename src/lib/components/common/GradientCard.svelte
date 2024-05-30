<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let icon: string;
    export let name: string;
    export let bgFrom: string = 'from-pink-500';
    export let bgTo: string = 'to-red-500';
    export let selected: boolean = false;
    export let displayMode: string;

    const dispatch = createEventDispatcher();
</script>

<div
    class="{`flex items-center p-4 rounded-lg bg-gray-100 cursor-pointer h-30 ${displayMode === 'column' ? 'w-full' : 'w-full'}`}"
    on:click={() => dispatch('click')}
>
    <div
        class={`flex items-center justify-center h-20 w-20 rounded-lg bg-gradient-to-br ${bgFrom} ${bgTo}`}
    >
        <slot name="icon"></slot>
    </div>
    <div class="ml-4 flex-1">
        <span class="text-l font-lobster text-orange-400">{name}</span>
    </div>
    {#if selected}
        <span class="icon-[system-uicons--check-circle] w-7 h-7 bg-blue-500 text-white"
        ></span>
    {/if}
</div>
