import { ProductMediaType, type ProductMedia } from '$lib/gql/graphql';

type SlidehowState = {
	medias: ProductMedia[];
	activeIndex: number;
	slicing: number[];
};

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
		},
	],
	activeIndex: 0,
	slicing: [0, 5],
});
