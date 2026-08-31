export interface SitemapEntry {
	/** relative path, e.g. `products/my-product` (leading slash optional) */
	path: string;
	lastModified?: string | Date | null;
	changeFrequency?: 'daily' | 'weekly' | 'monthly';
	priority?: number;
}

const escapeXml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

/**
 * Build a valid sitemap.xml document from a list of entries.
 * Pure function so it can be unit tested.
 */
export const buildSitemapXml = (baseUrl: string, entries: SitemapEntry[]): string => {
	const cleanBase = baseUrl.replace(/\/+$/, '');

	const urlElements = entries.map((entry) => {
		const path = entry.path.startsWith('/') ? entry.path : `/${entry.path}`;
		const lastModified = entry.lastModified
			? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
			: '';
		const changeFrequency = entry.changeFrequency
			? `<changefreq>${entry.changeFrequency}</changefreq>`
			: '';
		const priority =
			entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : '';

		return [
			'<url>',
			`<loc>${escapeXml(`${cleanBase}${path}`)}</loc>`,
			lastModified,
			changeFrequency,
			priority,
			'</url>',
		]
			.filter(Boolean)
			.join('');
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">',
		...urlElements,
		'</urlset>',
	].join('');
};
