import { ProductMediaType, type ProductMedia } from "$lib/gql/graphql";
import { get, writable } from "svelte/store";

type SlidehowState = {
  medias: ProductMedia[];
  activeIndex: number;
  slicing: number[];
}

export const defaultSlideShowState: SlidehowState = Object.freeze({
  medias: [
    {
      url: '/sitename-500.jpg',
      alt: 'Product Image',
      id: 'image',
      metadata: [],
      oembedData: undefined,
      privateMetadata: [],
      type: ProductMediaType.Image,
    }
  ],
  activeIndex: 0,
  slicing: [0, 5],
});

const productSlideShowStoreManager = () => {
  const store = writable<SlidehowState>(defaultSlideShowState);

  const setMedias = (medias: ProductMedia[]) => {
    if (!medias.length) return;

    const newState: SlidehowState = {
      medias,
      activeIndex: 0,
      slicing: [0, Math.min(5, medias.length)],
    };

    store.set(newState);
  };

  const handleNavigate = (dir: 1 | -1) => {
    const newState = get(store);

    const nextIndex = newState.activeIndex + dir;

    if (nextIndex < 0) {
      if (newState.slicing[0] === 0) return;
      newState.slicing = newState.slicing.map(i => i - 1);
      store.set(newState);
      return;
    }
    if (nextIndex === newState.slicing[1] - newState.slicing[0]) {
      if (newState.slicing[1] === newState.medias.length) return;
      newState.slicing = newState.slicing.map(i => i + 1);
      store.set(newState);
      return;
    }

    newState.activeIndex = nextIndex;
    store.set(newState);
  };

  const handleFocus = (index: number) => {
    const state = get(store);
    if (index !== state.activeIndex) store.set({ ...state, activeIndex: index });
  };

  return {
    setMedias,
    handleNavigate,
    handleFocus,
    subscribe: store.subscribe,
    reset: async () => store.set(defaultSlideShowState),
  };
};

export const slideShowManager = productSlideShowStoreManager();
