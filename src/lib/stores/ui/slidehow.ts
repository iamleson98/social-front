import { ProductMediaType, type ProductMedia } from "$lib/gql/graphql";
import { get, writable } from "svelte/store";

type SlidehowState = {
  medias: ProductMedia[];
  activeIndex: number;
  slicing: number[];
}

const defaultState = {
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
}

const productSlideShowStoreManager = () => {
  const store = writable<SlidehowState>(defaultState);

  const setMedias = async (medias: ProductMedia[]) => {
    const newState: SlidehowState = {
      medias,
      activeIndex: 0,
      slicing: [0, Math.min(5, medias.length)],
    };

    store.set(newState);
  };

  const handleNavigate = async (dir: 1 | -1) => {
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

  const handleFocus = async (index: number) => {
    const state = get(store);
    if (index !== state.activeIndex) store.set({ ...state, activeIndex: index });
  };

  const setActiveUrl = async (url: string) => {
    // const state = get(store);
    // const index = state.medias.findIndex(media => media.url === url);
    // if (index < 0) return;

    // if (index >= state.slicing[0] && index < state.slicing[1])
    //   store.set({ ...state, activeIndex: index });
    // else if (index < state.slicing[0]) {
    //   const delta = state.slicing[0] - index;
    //   store.set({ ...state, slicing: [index, state.slicing[1] - delta], activeIndex: index });
    // } else {
    //   const delta = index - state.slicing[1] + 1;
    //   const newSlicing = [state.slicing[0] + delta, index + 1];
    //   store.set({ ...state, activeIndex: newSlicing[1] - newSlicing[0] - 1, slicing: newSlicing });
    // }
  };

  return {
    setMedias,
    handleNavigate,
    handleFocus,
    setActiveUrl,
    subscribe: store.subscribe,
    reset: () => store.set(defaultState),
  };
};

export const slideShowManager = productSlideShowStoreManager();
