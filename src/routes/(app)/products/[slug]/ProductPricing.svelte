<script lang="ts">
	import { Heart } from "$lib/components/icons";
	import type { Product } from "$lib/gql/graphql";
	import { formatMoney } from "$lib/utils/utils";


  export let productBasicInfo: Pick<Product, 'attributes' | 'name' | 'pricing'>;
</script>

<div>
  <div class="bg-white w-3/5 rounded tablet:w-full">
    <div>
      <h1 class="text-gray-600 text-2xl">{productBasicInfo.name}</h1>

      <p class="text-xl text-red-400 font-bold mb-5 laptop:text-sm laptop:mb-2 tablet:text-xs">
        <!-- product price -->
        <!-- 355.000 ₫ - 500.000 ₫ -->
        {formatMoney(productBasicInfo.pricing?.priceRange?.start?.gross.amount || 0, productBasicInfo.pricing?.priceRange?.start?.gross.currency || 'USD')}
      </p>

      <div class="flex flex-row items-center tablet:text-xs">
        <p class="text-gray-400 font-thin w-1/5">Deliver to</p>
        <p class="text-gray-400 mr-3">
          <!-- address -->
          Trieu khuc, Thanh Tri
        </p>
        <button class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center"
          ><img
            src="https://cdn-icons-png.flaticon.com/128/149/149060.png"
            alt=""
            class="w-3 h-3"
          /></button
        >
      </div>
    </div>

    <div>
      <div class="flex flex-row items-center mt-20 desktop:mt-3 tablet:text-xs">
        <p class="text-gray-400 font-thin w-1/5">Material</p>
        <div class="item-container flex w-3/5 gap-2">
          <!-- {#each items as item, index}
            <SelectableItem
              content={item}
              selected={index === selectedItemIndex}
              on:select={() => handleSelectMaterial(index)}
            />
          {/each} -->
        </div>
      </div>

      <div class="flex flex-row items-center mt-2 tablet:text-xs">
        <p class="text-gray-400 font-thin w-1/5">Size</p>
        <div class="item-container flex items-start gap-2 w-3/5 table:text-m">
          <!-- {#each sizes as sizes, index}
            <SelectableItem
              content={sizes}
              selected={index === selectedSizeIndex}
              on:select={() => handleSelectSize(index)}
            />
          {/each} -->
        </div>
      </div>

      <div class="flex flex-row items-center mt-5 mb-3 tablet:text-xs tablet:mt-2">
        <p class="text-gray-400 font-thin w-1/5">Quantity</p>
        <div class="item-container flex items-start gap-2 w-4/5">
          <button
            on:click={null}
            class="w-6 h-6 flex items-center justify-center rounded text-gray-400 bg-gray-200 hover:bg-red-400 hover:text-white"
            >-</button
          >
          <span class="ml-3 mr-3 text-gray-400">{1}</span>
          <button
            on:click={null}
            class="w-6 h-6 flex items-center justify-center rounded text-gray-400 bg-gray-200 hover:bg-red-400 hover:text-white"
            >+</button
          >
          <p class="text-gray-400">8 items available</p>
        </div>
      </div>

      <button
        class="flex items-center bg-red-400 text-white px-4 py-2 rounded desktop:mt-3 tablet:text-xs hover:bg-red-500 mt-10 disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:hover:text-gray-500"
      >
        <span
          class="icon-[system-uicons--cart] w-6 h-6 mr-1 tablet:w-3 tablet:h-3"
          style="color: white;"
        ></span>
        <p class="tablet:text-xs">Add to Cart</p>
      </button>
    </div>

    <div class="flex flex-row flex-wrap gap-2 items-center">
      <button class="btn btn-sm">
        365
        <Heart />
      </button>
      <button class="btn btn-sm">
        365
        <Heart />
      </button>
      <button class="btn btn-sm">
        365
        <Heart />
      </button>
      <button class="btn btn-sm">
        365
        <Heart />
      </button>
    </div>
  </div>
</div>
