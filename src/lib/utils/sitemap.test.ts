import { buildSitemapXml, type SitemapEntry } from './sitemap';
import { describe, expect, it } from 'vitest';

describe('buildSitemapXml', () => {
	it('produces a valid urlset with loc entries', () => {
		const entries: SitemapEntry[] = [
			{ path: 'products/iphone-15', priority: 0.8 },
			{ path: '/categories/electronics', priority: 0.6 },
		];

		const xml = buildSitemapXml('https://shop.example.com', entries);

		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain('<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<loc>https://shop.example.com/products/iphone-15</loc>');
		// leading slash is normalized (no double slash)
		expect(xml).toContain('<loc>https://shop.example.com/categories/electronics</loc>');
		expect(xml).toContain('<priority>0.8</priority>');
		expect(xml.endsWith('</urlset>')).toBe(true);
	});

	it('adds lastmod in ISO format when provided', () => {
		const xml = buildSitemapXml('https://shop.example.com', [
			{ path: 'products/tv', lastModified: '2026-01-15T10:30:00Z' },
		]);

		expect(xml).toContain('<lastmod>2026-01-15T10:30:00.000Z</lastmod>');
	});

	it('escapes xml special characters in paths', () => {
		const xml = buildSitemapXml('https://shop.example.com', [{ path: 'products/a&b<c>"d"' }]);

		expect(xml).toContain(
			'<loc>https://shop.example.com/products/a&amp;b&lt;c&gt;&quot;d&quot;</loc>',
		);
		expect(xml).not.toContain('a&b<c>');
	});

	it('trims trailing slashes from base url', () => {
		const xml = buildSitemapXml('https://shop.example.com///', [{ path: 'products/x' }]);

		expect(xml).toContain('<loc>https://shop.example.com/products/x</loc>');
	});

	it('renders an empty urlset when there are no entries', () => {
		const xml = buildSitemapXml('https://shop.example.com', []);

		expect(xml).toContain('<urlset');
		expect(xml).not.toContain('<url>');
	});
});
