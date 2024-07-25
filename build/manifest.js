export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","logo.svg","robots.txt"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		client: {"start":"_app/immutable/entry/start.R46yiO4m.js","app":"_app/immutable/entry/app.DXNR0Nnt.js","imports":["_app/immutable/entry/start.R46yiO4m.js","_app/immutable/chunks/entry.wgEMl8FU.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.TIp4ptjY.js","_app/immutable/entry/app.DXNR0Nnt.js","_app/immutable/chunks/preload-helper.DyDGoheb.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./server/nodes/0.js')),
			__memo(() => import('./server/nodes/1.js')),
			__memo(() => import('./server/nodes/3.js')),
			__memo(() => import('./server/nodes/4.js')),
			__memo(() => import('./server/nodes/5.js')),
			__memo(() => import('./server/nodes/6.js')),
			__memo(() => import('./server/nodes/7.js')),
			__memo(() => import('./server/nodes/8.js')),
			__memo(() => import('./server/nodes/9.js')),
			__memo(() => import('./server/nodes/10.js')),
			__memo(() => import('./server/nodes/11.js')),
			__memo(() => import('./server/nodes/12.js')),
			__memo(() => import('./server/nodes/13.js')),
			__memo(() => import('./server/nodes/14.js')),
			__memo(() => import('./server/nodes/15.js')),
			__memo(() => import('./server/nodes/16.js')),
			__memo(() => import('./server/nodes/17.js')),
			__memo(() => import('./server/nodes/18.js')),
			__memo(() => import('./server/nodes/19.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: __memo(() => import('./server/entries/endpoints/_server.ts.js'))
			},
			{
				id: "/auth/change-password",
				pattern: /^\/auth\/change-password\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/auth/reset-password",
				pattern: /^\/auth\/reset-password\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/auth/signin",
				pattern: /^\/auth\/signin\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/auth/signup",
				pattern: /^\/auth\/signup\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/(app)/categories",
				pattern: /^\/categories\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/(app)/categories/[slug]",
				pattern: /^\/categories\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/(app)/orders/history",
				pattern: /^\/orders\/history\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/(app)/orders/[id]",
				pattern: /^\/orders\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/(app)/products",
				pattern: /^\/products\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(app)/products/new",
				pattern: /^\/products\/new\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/(app)/products/[slug]",
				pattern: /^\/products\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(app)/shopping-cart",
				pattern: /^\/shopping-cart\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/(app)/trending",
				pattern: /^\/trending\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/(app)/user/[userId]",
				pattern: /^\/user\/([^/]+?)\/?$/,
				params: [{"name":"userId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);
