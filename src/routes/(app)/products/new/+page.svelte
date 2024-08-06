<script lang="ts">
	import ProductDescriptionEditor from '$lib/components/pages/products/product-description-editor.svelte';

	let now = new Date();
</script>

<div class="m-auto rounded bg-white max-w-[800px] p-5">
	<!-- product name -->
	<label class="form-control w-full">
		<div class="label">
			<span class="label-text text-lg font-semibold">Product name</span>
			<!-- <span class="label-text-alt">Top Right label</span> -->
		</div>
		<input type="text" placeholder="Enter the product name" class="input input-bordered w-full" />
		<div class="label">
			<span class="label-text-alt"></span>
			<span class="label-text-alt">{now.toDateString()}</span>
		</div>
	</label>

	<!-- description -->
	<div class="label">
		<span class="label-text text-lg font-semibold">Product description</span>
	</div>
	<ProductDescriptionEditor />

	<!-- category -->
	<ul class="menu menu-horizontal bg-base-200 rounded !flex-nowrap overflow-x-auto">
		<li>
			<a>Solutions lllllllllllllllllllllllllllllllll llllllllllllllllllllllllllllllll</a>
			<ul>
				<li><a>Design</a></li>
				<li><a>Development</a></li>
				<li><a>Hosting</a></li>
				<li><a>Domain register</a></li>
			</ul>
		</li>
		<li>
			<a>Enterprise</a>
			<ul>
				<li><a>CRM software</a></li>
				<li><a>Marketing management</a></li>
				<li><a>Security</a></li>
				<li><a>Consulting</a></li>
			</ul>
		</li>
		<li>
			<a>Products</a>
			<ul>
				<li><a>UI Kit</a></li>
				<li><a>Wordpress themes</a></li>
				<li><a>Wordpress plugins</a></li>
				<li>
					<a>Open source</a>
					<ul>
						<li><a>Auth management system</a></li>
						<li><a>VScode theme</a></li>
						<li><a>Color picker app</a></li>
					</ul>
				</li>
			</ul>
		</li>
		<li>
			<a>Company</a>
			<ul>
				<li><a>About us</a></li>
				<li><a>Contact us</a></li>
				<li><a>Privacy policy</a></li>
				<li><a>Press kit</a></li>
			</ul>
		</li>
	</ul>

	<!-- variants -->
	<div class="flex items-center"></div>
</div>
