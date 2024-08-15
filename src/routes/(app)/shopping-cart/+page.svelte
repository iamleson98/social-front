<script lang="ts">
	import { ArrowNarrowRight, Icon, Minus, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
</script>

<div>
	<h3 class="text-lg font-semibold text-gray-800">Shopping Cart</h3>

	<div class="flex flex-row tablet:flex-wrap">
		<!-- preview area -->
		<div class="p-2 w-3/4 tablet:w-full">
			<!-- cart content -->

			<div class="rounded bg-white p-4">
				<div class="flex items-center flex-row tablet:flex-wrap">
					<!-- preview picture -->
					<div class="w-3/4 flex items-center">
						<img
							class="h-20 w-20 block"
							src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/apple-watch-light.svg"
							alt="imac image"
							aria-hidden="true"
						/>
						<div>
							<a href="/" class="font-medium text-gray-800 hover:underline block mb-3">
								Restored Apple Watch Series 8 (GPS) 41mm Midnight Aluminum Case with Midnight Sport
								Band
							</a>

							<div class="flex items-center">
								<button type="button" class="btn btn-xs !bg-red-100 text-red-600">
									<Icon icon={Trash} />
									Remove
								</button>
							</div>
						</div>
					</div>

					<!-- information -->
					<div class="flex items-center flex-row w-1/4">
						<div class="flex items-center mr-4">
							<button type="button" id="decrement-button-2" class="btn btn-xs btn-square">
								<Icon icon={Minus} />
							</button>
							<input type="text" class="input input-xs w-10 text-center" />
							<button type="button" id="increment-button-2" class="btn btn-xs btn-square">
								<Icon icon={Plus} />
							</button>
						</div>
						<div class="text-end md:order-4 md:w-32">
							<p class="text-base font-bold text-blue-700">$598</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- purchase area -->
		<div class="p-2 w-1/4 tablet:w-full">
			<!-- checkout button -->
			<div class="space-y-4 rounded bg-white p-4 mb-4">
				<p class="text-lg font-semibold tet-gray-800">Order summary</p>

				<div class="space-y-4">
					<div class="space-y-2">
						<dl class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-gray-500">Original price</dt>
							<dd class="text-base font-medium tet-gray-800">$7,592.00</dd>
						</dl>

						<dl class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-gray-500">Savings</dt>
							<dd class="text-base font-medium text-green-600">-$299.00</dd>
						</dl>

						<dl class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-gray-500">Store Pickup</dt>
							<dd class="text-base font-medium tet-gray-800">$99</dd>
						</dl>

						<dl class="flex items-center justify-between gap-4">
							<dt class="text-sm font-normal text-gray-500">Tax</dt>
							<dd class="text-base font-medium tet-gray-800">$799</dd>
						</dl>
					</div>

					<dl class="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
						<dt class="text-base font-bold tet-gray-800">Total</dt>
						<dd class="text-base font-bold tet-gray-800">$8,191.00</dd>
					</dl>
				</div>

				<a href={AppRoute.CHECKOUT}>
					<Button variant="filled" fullWidth>Proceed to checkout</Button>
				</a>

				<div class="flex items-center justify-center gap-2">
					<span class="text-sm font-normal text-gray-500"> or </span>
					<a
						href="/"
						class="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline"
					>
						Continue Shopping
						<Icon icon={ArrowNarrowRight} />
					</a>
				</div>
			</div>

			<!-- coupon -->
			<div class="space-y-4 rounded bg-white p-4">
				<form class="space-y-4">
					<div>
						<label for="voucher" class="mb-2 block text-sm font-medium tet-gray-800">
							Do you have a voucher or gift card?
						</label>
						<input
							type="text"
							class="w-full input input-sm border-gray-200"
							placeholder="Enter your code"
						/>
					</div>
					<Button variant="filled" fullWidth>Apply code</Button>
				</form>
			</div>
		</div>
	</div>

	<!-- recommend section -->
	<div class="mt-6">
		<h3 class="text-lg font-semibold tet-gray-800">People also bought</h3>
		<div class="mt-6 grid grid-cols-3 gap-4 sm:mt-8">
			<div class="space-y-6 overflow-hidden rounded-lg bg-white p-6">
				<a href="/" class="overflow-hidden rounded">
					<img
						class="h-44 w-44 dark:hidden"
						src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg"
						alt="imac image"
						aria-hidden="true"
					/>
				</a>
				<div>
					<a href="#" class="text-lg font-semibold leading-tight tet-gray-800 hover:underline"
						>iMac 27”</a
					>
					<p class="mt-2 text-base font-normal text-gray-500">
						This generation has some improvements, including a longer continuous battery life.
					</p>
				</div>
				<div>
					<p class="text-lg font-bold tet-gray-800">
						<span class="line-through"> $399,99 </span>
					</p>
					<p class="text-lg font-bold leading-tight text-red-600">$299</p>
				</div>
				<div class="mt-6 flex items-center gap-2.5">
					<button
						data-tooltip-target="favourites-tooltip-1"
						type="button"
						class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-medium tet-gray-800 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100"
					>
						<svg
							class="h-5 w-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
							></path>
						</svg>
					</button>
					<div
						id="favourites-tooltip-1"
						role="tooltip"
						class="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300"
					>
						Add to favourites
						<div class="tooltip-arrow" data-popper-arrow></div>
					</div>
					<button
						type="button"
						class="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
					>
						<svg
							class="-ms-2 me-2 h-5 w-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7h-1M8 7h-.688M13 5v4m-2-2h4"
							/>
						</svg>
						Add to cart
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
