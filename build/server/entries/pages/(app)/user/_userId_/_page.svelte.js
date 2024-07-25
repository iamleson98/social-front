import { c as create_ssr_component, h as createEventDispatcher, b as add_attribute, e as escape, a as each, v as validate_component } from "../../../../../chunks/ssr.js";
import { b as null_to_empty } from "../../../../../chunks/utils.js";
const Gradient_card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { icon } = $$props;
  let { name } = $$props;
  let { bgFrom = "from-pink-500" } = $$props;
  let { bgTo = "to-red-500" } = $$props;
  let { selected = false } = $$props;
  createEventDispatcher();
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.bgFrom === void 0 && $$bindings.bgFrom && bgFrom !== void 0) $$bindings.bgFrom(bgFrom);
  if ($$props.bgTo === void 0 && $$bindings.bgTo && bgTo !== void 0) $$bindings.bgTo(bgTo);
  if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0) $$bindings.selected(selected);
  return `<div class="relative flex items-center p-4 rounded-lg bg-gray-100 cursor-pointer h-30"><div${add_attribute("class", `flex items-center justify-center h-20 w-20 tablet:h-14 tablet:w-14 rounded-lg bg-gradient-to-br ${bgFrom} ${bgTo}`, 0)}>${slots.icon ? slots.icon({}) : ``}</div> <div class="ml-4 flex-1"><span class="text-l font-lobster text-orange-400 w-full">${escape(name)}</span></div> ${selected ? `<span class="absolute top-2 right-2 icon-[system-uicons--check-circle] w-7 h-7 bg-blue-500 text-white"></span>` : ``}</div>`;
});
const css = {
  code: ".common-button.svelte-11wj5i3{border-radius:0.25rem;padding-left:1rem;padding-right:1rem;padding-top:0.25rem;padding-bottom:0.25rem;font-weight:700\n}@media(max-width: 800px){.responsive-grid.svelte-11wj5i3{display:grid;grid-template-columns:repeat(1, minmax(0, 1fr));gap:0.75rem\n		}}@media(min-width: 801px){.responsive-grid.svelte-11wj5i3{display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:0.75rem\n		}}",
  map: '{"version":3,"file":"interest.svelte","sources":["interest.svelte"],"sourcesContent":["<script lang=\\"ts\\">import GradientCard from \\"./gradient-card.svelte\\";\\nlet interests = [\\n  {\\n    id: 1,\\n    name: \\"Sport & Travel\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-red-200\\",\\n    bgTo: \\"to-red-700\\"\\n  },\\n  {\\n    id: 2,\\n    name: \\"Books\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-pink-200\\",\\n    bgTo: \\"to-pink-800\\"\\n  },\\n  {\\n    id: 3,\\n    name: \\"Men fashion\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-yellow-200\\",\\n    bgTo: \\"to-pink-900\\"\\n  },\\n  {\\n    id: 4,\\n    name: \\"Women handbag\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-yellow-200\\",\\n    bgTo: \\"to-green-700\\"\\n  },\\n  {\\n    id: 5,\\n    name: \\"Women fashion\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-yellow-200\\",\\n    bgTo: \\"to-pink-900\\"\\n  },\\n  {\\n    id: 6,\\n    name: \\"Men handbag\\",\\n    icon: \\"icon-[system-uicons--button-minus]\\",\\n    selected: false,\\n    bgFrom: \\"from-yellow-200\\",\\n    bgTo: \\"to-green-700\\"\\n  }\\n];\\nfunction toggleSelection(id) {\\n  interests = interests.map(\\n    (item) => item.id === id ? { ...item, selected: !item.selected } : item\\n  );\\n}\\n<\/script>\\n\\n<div>\\n\\t<div class=\\"responsive-grid w-full pl-3 pr-3 mr-10 h-97 overflow-y-auto\\">\\n\\t\\t{#each interests as { id, name, icon, selected, bgFrom, bgTo }}\\n\\t\\t\\t<GradientCard {icon} {name} {bgFrom} {bgTo} {selected} on:click={() => toggleSelection(id)}>\\n\\t\\t\\t\\t<span slot=\\"icon\\" class={icon} style=\\"color: #fff; width: 51px; height:51px\\"></span>\\n\\t\\t\\t</GradientCard>\\n\\t\\t{/each}\\n\\t</div>\\n\\n\\t<div class=\\"flex justify-end mt-10 mr-5\\">\\n\\t\\t<button class=\\"common-button bg-red-100 text-red-400 mr-2\\">Cancel</button>\\n\\t\\t<button class=\\"common-button bg-blue-100 text-blue-400\\">Save</button>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.common-button {\\n\\n\\t\\tborder-radius: 0.25rem;\\n\\n\\t\\tpadding-left: 1rem;\\n\\n\\t\\tpadding-right: 1rem;\\n\\n\\t\\tpadding-top: 0.25rem;\\n\\n\\t\\tpadding-bottom: 0.25rem;\\n\\n\\t\\tfont-weight: 700\\n}\\n\\n\\t@media (max-width: 800px) {\\n\\t\\t.responsive-grid {\\n\\n\\t\\t\\t\\tdisplay: grid;\\n\\n\\t\\t\\t\\tgrid-template-columns: repeat(1, minmax(0, 1fr));\\n\\n\\t\\t\\t\\tgap: 0.75rem\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 801px) {\\n\\t\\t.responsive-grid {\\n\\n\\t\\t\\t\\tdisplay: grid;\\n\\n\\t\\t\\t\\tgrid-template-columns: repeat(2, minmax(0, 1fr));\\n\\n\\t\\t\\t\\tgap: 0.75rem\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0EC,6BAAe,CAEd,aAAa,CAAE,OAAO,CAEtB,YAAY,CAAE,IAAI,CAElB,aAAa,CAAE,IAAI,CAEnB,WAAW,CAAE,OAAO,CAEpB,cAAc,CAAE,OAAO,CAEvB,WAAW,CAAE,GAAG;AAClB,CAEC,MAAO,YAAY,KAAK,CAAE,CACzB,+BAAiB,CAEf,OAAO,CAAE,IAAI,CAEb,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAEhD,GAAG,CAAE,OAAO;AAChB,EAAE,CACD,CAEA,MAAO,YAAY,KAAK,CAAE,CACzB,+BAAiB,CAEf,OAAO,CAAE,IAAI,CAEb,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAEhD,GAAG,CAAE,OAAO;AAChB,EAAE,CACD"}'
};
const Interest = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let interests = [
    {
      id: 1,
      name: "Sport & Travel",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-red-200",
      bgTo: "to-red-700"
    },
    {
      id: 2,
      name: "Books",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-pink-200",
      bgTo: "to-pink-800"
    },
    {
      id: 3,
      name: "Men fashion",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-yellow-200",
      bgTo: "to-pink-900"
    },
    {
      id: 4,
      name: "Women handbag",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-yellow-200",
      bgTo: "to-green-700"
    },
    {
      id: 5,
      name: "Women fashion",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-yellow-200",
      bgTo: "to-pink-900"
    },
    {
      id: 6,
      name: "Men handbag",
      icon: "icon-[system-uicons--button-minus]",
      selected: false,
      bgFrom: "from-yellow-200",
      bgTo: "to-green-700"
    }
  ];
  $$result.css.add(css);
  return `<div><div class="responsive-grid w-full pl-3 pr-3 mr-10 h-97 overflow-y-auto svelte-11wj5i3">${each(interests, ({ id, name, icon, selected, bgFrom, bgTo }) => {
    return `${validate_component(Gradient_card, "GradientCard").$$render($$result, { icon, name, bgFrom, bgTo, selected }, {}, {
      icon: () => {
        return `<span slot="icon" class="${escape(null_to_empty(icon), true) + " svelte-11wj5i3"}" style="color: #fff; width: 51px; height:51px"></span>`;
      }
    })}`;
  })}</div> <div class="flex justify-end mt-10 mr-5" data-svelte-h="svelte-nh9ckg"><button class="common-button bg-red-100 text-red-400 mr-2 svelte-11wj5i3">Cancel</button> <button class="common-button bg-blue-100 text-blue-400 svelte-11wj5i3">Save</button></div> </div>`;
});
let urlBg = "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg";
let urlAvatar = "https://buffer.com/library/content/images/2023/10/free-images.jpg";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-lidtwg_START -->${$$result.title = `<title>User Id</title>`, ""}<!-- HEAD_svelte-lidtwg_END -->`, ""} <div class="w-full pt-10 bg-gray-100 pb-5"><div class="w-full max-w-6xl mx-auto"><div class="relative w-full h-64 rounded bg-cover" style="${"background-image: url(" + escape(urlBg, true) + ");"}"><div class="flex flex-row items-center translate-y-1/2 pl-20"><div class="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white"><img${add_attribute("src", urlAvatar, 0)} alt="Avatar" class="w-full h-full object-cover"> <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white" data-svelte-h="svelte-hzm71w"><span class="icon-[system-uicons--camera] text-white text-xl"></span> <button>Update</button></div></div> <p class="text-white text-xl font-bold ml-5 mt-10" data-svelte-h="svelte-1vi6khc">nguyen van phuc shop</p></div></div>  <div class="flex mobile-l:flex-col mobile-l:gap-3 mt-5 w-full justify-between"><div class="bg-white rounded w-1/3 mobile-l:w-full mr-5 tablet:mr-2 p-5" data-svelte-h="svelte-1by96a4"><p class="text-custom-text-color text-lg">About us</p> <p class="text-sm tablet:text-s p-1 mt-3 text-center w-full h-30 py-5 mx-auto border-2 border-blue-300 rounded flex justify-center items-center">We sell product to people <br>
					And gain back the truth from them</p> <div class="px-5 w-full"><button class="w-full tablet:text-sm h-10 bg-gray-200 rounded block mx-auto mt-5 mb-2 font-bold">Edit Slogan</button> <button class="w-full tablet:text-sm h-10 bg-blue-500 text-white rounded block mx-auto mb-5 font-bold">Follow</button></div> <div class="flex flex-row w-full ml-3 mb-3 items-center tablet:text-sm"><span class="icon-[system-uicons--check-circle-outside] mr-2 w-4 h-4" style="color: #718096;"></span> <p class="text-custom-text-color">verified seller</p></div> <div class="flex flex-row w-full ml-3 mb-3 items-center tablet:text-sm"><span class="icon-[system-uicons--clock] mr-2 w-4 h-4" style="color: #718096;"></span> <p class="text-custom-text-color">Joined July 2013</p></div> <div class="flex flex-row w-full ml-3 mb-3 items-center tablet:text-sm"><span class="icon-[system-uicons--tag] mr-2 w-4 h-4" style="color: #718096;"></span> <p class="text-custom-text-color">Joined July 2013</p></div></div> <div class="bg-white rounded w-2/3 mobile-l:w-full h-97 pl-10 pr-10 pt-5 pb-5 tablet:py-3 tablet:px-5"><div class="h-5 flex items-center w-full gap-10 pl-3" data-svelte-h="svelte-hpf2h8"><button>Interests</button> <button>Following</button> <button>Followers</button></div> <div class="w-full h-7 flex pr-5 mt-1 mb-1" data-svelte-h="svelte-yu67fh"><span class="icon-[system-uicons--document-list] ml-auto w-5 h-5" style="color: #718096; cursor: pointer;"></span> <span class="icon-[system-uicons--calendar-split] w-5 h-5" style="color: #718096; cursor: pointer;"></span></div> ${validate_component(Interest, "Interest").$$render($$result, {}, {}, {})}</div></div> </div></div>`;
});
export {
  Page as default
};
