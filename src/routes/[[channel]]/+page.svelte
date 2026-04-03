<script lang="ts">
	import { PUBLIC_GEOCODER_API_URL } from '$env/static/public';
	import { Icon } from '$lib/components/icons';
	import {
		TablerBus,
		TablerCurrentLocation,
		TablerMapPinFilled,
		TablerPlane,
		TablerSearch,
		TablerTrain,
	} from '$lib/components/icons/consts';
	import { Button } from '$lib/components/ui';
	import { Label } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { States, type GeoResponse } from '$lib/utils/places';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { Datepicker } from 'flowbite-svelte';
	import toast from 'svelte-french-toast';

	let departureDate = $state<Date | undefined>(undefined);
	let returnDate = $state<Date | undefined>(undefined);
	let pickupLocation = $state<string>('');
	let dropLocation = $state<string>('');

	let pickPlaceSearchKeyword = $state('');
	let dropPlaceSearchKeyword = $state('');

	let fetchingPickupPlaces = $state(false);
	let fetchingDropPlaces = $state(false);

	let pickPlaceOptions = $state<SelectOption[]>(States);
	let dropPlaceOptions = $state<SelectOption[]>(States);

	const searchPlaces = async (keyword: string, place: 'pickup' | 'drop') => {
		const trimmedKeyword = keyword.trim();

		if (place === 'pickup') {
			if (trimmedKeyword === pickPlaceSearchKeyword) return;
			fetchingPickupPlaces = true;
		} else {
			if (trimmedKeyword === dropPlaceSearchKeyword) return;
			fetchingDropPlaces = true;
		}

		const params = new URLSearchParams({ q: trimmedKeyword, limit: '60' });
		const fetchResult = await fetch(`${PUBLIC_GEOCODER_API_URL}?${params.toString()}`);

		let result: SelectOption[] = States;

		try {
			if (!fetchResult.ok) throw new Error('Failed to fetch places data');

			const data: GeoResponse = await fetchResult.json();
			result = data.features.map((feature) => ({
				label: feature.properties.name,
				value: feature.geometry.coordinates.join(', '),
			}));
		} catch {
			toast.error('Failed to parse places data');
		} finally {
			if (place === 'pickup') {
				fetchingPickupPlaces = false;
				pickPlaceOptions = result;
			} else {
				fetchingDropPlaces = false;
				dropPlaceOptions = result;
			}
		}
	};
</script>

<div
	class="w-full bg-cover bg-center bg-no-repeat rounded-lg"
	style="background-image: url('/hero-bg.jpg');"
>
	<div class="h-full bg-black/70 py-20 px-10">
		<div class="mb-20 text-white">
			<h1 class="text-3xl laptop:text-6xl font-bold mb-2">
				Mỗi một chuyến đi là một trải nghiệm thú vị
			</h1>
			<p class="mb-8 font-medium text-white/80 text-lg">
				Chúng tôi luôn không ngừng nỗ lực để đem tới cho quý khách hàng những sản phẩm chất lượng
				nhất
			</p>
		</div>

		<div class={SitenameCommonClassName}>
			<div>
				<div role="tablist" class="tabs tabs-lift">
					<span role="tab" class="tab tab-active">
						<div class="flex items-center gap-2">
							<Icon icon={TablerBus} size="md" />
							<span>Xe Khách</span>
						</div>
					</span>
					<span role="tab" class="tab">
						<div class="flex items-center gap-2">
							<Icon icon={TablerTrain} size="md" />
							<span>Tàu</span>
						</div>
					</span>
					<span role="tab" class="tab">
						<div class="flex items-center gap-2">
							<Icon icon={TablerPlane} size="md" />
							<span>Máy Bay</span>
						</div>
					</span>
				</div>
			</div>
			<div class="flex items-end gap-2">
				<div class="grid grid-cols-4 gap-3">
					<Select
						label="Điểm Đón"
						startIcon={TablerCurrentLocation}
						startIconClass="text-blue-500"
						placeholder="Nhập điểm đón"
						size="sm"
						required
						options={pickPlaceOptions}
						inputDebounceOption={{
							debounceTime: 888,
							onInput: (evt) => searchPlaces((evt.target as HTMLInputElement).value, 'pickup'),
						}}
						showLoadingMore={fetchingPickupPlaces}
						bind:value={pickupLocation}
					/>
					<Select
						label="Điểm Đến"
						startIcon={TablerMapPinFilled}
						startIconClass="text-red-500"
						placeholder="Nhập điểm đến"
						size="sm"
						required
						options={dropPlaceOptions}
						inputDebounceOption={{
							debounceTime: 888,
							onInput: (evt) => searchPlaces((evt.target as HTMLInputElement).value, 'drop'),
						}}
						showLoadingMore={fetchingDropPlaces}
						bind:value={dropLocation}
					/>
					<div>
						<Label label="Chọn Ngày Đi" size="sm" variant="info" required requiredAtPos="end" />
						<Datepicker
							bind:value={departureDate}
							inputClass="focus:ring-blue-500! ring-gray-200 ring-1 bg-white hover:ring-2 border-0 transition-all duration-200"
						/>
					</div>

					<div>
						<Label label="Chọn Ngày Về" size="sm" variant="info" />
						<Datepicker
							bind:value={returnDate}
							inputClass="focus:ring-blue-500! ring-gray-200 ring-1 bg-white hover:ring-2 border-0 transition-all duration-200"
						/>
					</div>
				</div>

				<Button startIcon={TablerSearch} size="sm">Tìm Kiếm</Button>
			</div>
		</div>
	</div>
</div>
