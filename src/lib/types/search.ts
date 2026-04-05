// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type Search = {
	terms: string;
	isOrSearch: boolean;
};

export type SearchState = {
	current: any;
	results: string[];
	fileResults: string[];
	flagged: string[];
	pinned: Record<string, string[]>;
	isSearchingTerm: boolean;
	isSearchGettingMore: boolean;
	isLimitedResults: number;
	matches: {
		[x: string]: string[];
	};
	truncationInfo?: {
		posts: number;
		files: number;
	};
};

export type SearchParameter = {
	terms: string;
	is_or_search: boolean;
	time_zone_offset?: number;
	page: number;
	per_page: number;
	include_deleted_channels: boolean;
};

export enum Operator {
	Eq = '=',
	Neq = '!=',
	Gt = '>',
	Gte = '>=',
	Lt = '<',
	Lte = '<=',
	In = 'IN',
	NotIn = 'NOT IN',
	Like = 'LIKE',
	ILike = 'ILIKE',
	NotLike = 'NOT LIKE',
	NotILike = 'NOT ILIKE',
}

export type WhereCond = {
	column: string;
	operator: Operator;
	value: any;
};

export type OrderBy = {
	column: string;
	dir: OrderDirection;
};

export enum OrderDirection {
	Asc = 'ASC',
	Desc = 'DESC',
}

export type SearchOpts = {
	where_ands?: WhereCond[];
	where_ors?: WhereCond[];
	orderings?: OrderBy[];
	limit?: number;
	offset?: number;
};
