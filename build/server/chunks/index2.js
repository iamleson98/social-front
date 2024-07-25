import { w as writable, d as derived } from "./index3.js";
import { g as get_store_value } from "./utils.js";
import C$1 from "@sveltekit-i18n/parser-default";
var H = Object.defineProperty, q = Object.defineProperties;
var B = Object.getOwnPropertyDescriptors;
var x = Object.getOwnPropertySymbols;
var K = Object.prototype.hasOwnProperty, A = Object.prototype.propertyIsEnumerable;
var N = (s2, t3, e) => t3 in s2 ? H(s2, t3, { enumerable: true, configurable: true, writable: true, value: e }) : s2[t3] = e, l$1 = (s2, t3) => {
  for (var e in t3 || (t3 = {})) K.call(t3, e) && N(s2, e, t3[e]);
  if (x) for (var e of x(t3)) A.call(t3, e) && N(s2, e, t3[e]);
  return s2;
}, f$1 = (s2, t3) => q(s2, B(t3));
var L = (s2, t3) => {
  var e = {};
  for (var a in s2) K.call(s2, a) && t3.indexOf(a) < 0 && (e[a] = s2[a]);
  if (s2 != null && x) for (var a of x(s2)) t3.indexOf(a) < 0 && A.call(s2, a) && (e[a] = s2[a]);
  return e;
};
var C = ["error", "warn", "debug"], $ = ({ logger: s2 = console, level: t3 = C[1], prefix: e = "[i18n]: " }) => C.reduce((a, r, i2) => f$1(l$1({}, a), { [r]: (o) => C.indexOf(t3) >= i2 && s2[r](`${e}${o}`) }), {}), c = $({}), V = (s2) => {
  c = s2;
};
var z = (n2) => {
  var d2 = n2, { parser: s2, key: t3, params: e, translations: a, locale: r, fallbackLocale: i2 } = d2, o = L(d2, ["parser", "key", "params", "translations", "locale", "fallbackLocale"]);
  if (!t3) return c.warn(`No translation key provided ('${r}' locale). Skipping translation...`), "";
  if (!r) return c.warn(`No locale provided for '${t3}' key. Skipping translation...`), "";
  let u2 = (a[r] || {})[t3];
  if (i2 && u2 === void 0 && (c.debug(`No translation provided for '${t3}' key in locale '${r}'. Trying fallback '${i2}'`), u2 = (a[i2] || {})[t3]), u2 === void 0) {
    if (c.debug(`No translation provided for '${t3}' key in fallback '${i2}'.`), o.hasOwnProperty("fallbackValue")) return o.fallbackValue;
    c.warn(`No translation nor fallback found for '${t3}' .`);
  }
  return s2.parse(u2, e, r, t3);
}, h = (...s2) => s2.length ? s2.filter((t3) => !!t3).map((t3) => {
  let e = `${t3}`.toLowerCase();
  try {
    let [a] = Intl.Collator.supportedLocalesOf(t3);
    if (!a) throw new Error();
    e = a;
  } catch (a) {
    c.warn(`'${t3}' locale is non-standard.`);
  }
  return e;
}) : [], w = (s2, t3, e) => {
  if (t3 && Array.isArray(s2)) return s2.map((a) => w(a, t3));
  if (s2 && typeof s2 == "object") {
    let a = Object.keys(s2).reduce((r, i2) => {
      let o = s2[i2], n2 = e ? `${e}.${i2}` : `${i2}`;
      return o && typeof o == "object" && !(t3 && Array.isArray(o)) ? l$1(l$1({}, r), w(o, t3, n2)) : f$1(l$1({}, r), { [n2]: w(o, t3) });
    }, {});
    return Object.keys(a).length ? a : null;
  }
  return s2;
}, G = (s2) => s2.reduce((t3, { key: e, data: a, locale: r }) => {
  if (!a) return t3;
  let [i2] = h(r), o = f$1(l$1({}, t3[i2] || {}), { [e]: a });
  return f$1(l$1({}, t3), { [i2]: o });
}, {}), E = async (s2) => {
  try {
    let t3 = await Promise.all(s2.map((r) => {
      var i2 = r, { loader: e } = i2, a = L(i2, ["loader"]);
      return new Promise(async (o) => {
        let n2;
        try {
          n2 = await e();
        } catch (d2) {
          c.error(`Failed to load translation. Verify your '${a.locale}' > '${a.key}' Loader.`), c.error(d2);
        }
        o(f$1(l$1({ loader: e }, a), { data: n2 }));
      });
    }));
    return G(t3);
  } catch (t3) {
    c.error(t3);
  }
  return {};
}, W = (s2) => (t3) => {
  try {
    if (typeof t3 == "string") return t3 === s2;
    if (typeof t3 == "object") return t3.test(s2);
  } catch (e) {
    c.error("Invalid route config!");
  }
  return false;
}, F = (s2, t3) => {
  let e = true;
  try {
    e = Object.keys(s2).filter((a) => s2[a] !== void 0).every((a) => s2[a] === t3[a]);
  } catch (a) {
  }
  return e;
};
var D$1 = 1e3 * 60 * 60 * 24, O = class {
  constructor(t3) {
    this.cachedAt = 0;
    this.loadedKeys = {};
    this.currentRoute = writable();
    this.config = writable();
    this.isLoading = writable(false);
    this.promises = /* @__PURE__ */ new Set();
    this.loading = { subscribe: this.isLoading.subscribe, toPromise: (t4, e) => {
      let { fallbackLocale: a } = get_store_value(this.config), r = Array.from(this.promises).filter((i2) => {
        let o = F({ locale: h(t4)[0], route: e }, i2);
        return a && (o = o || F({ locale: h(a)[0], route: e }, i2)), o;
      }).map(({ promise: i2 }) => i2);
      return Promise.all(r);
    }, get: () => get_store_value(this.isLoading) };
    this.privateRawTranslations = writable({});
    this.rawTranslations = { subscribe: this.privateRawTranslations.subscribe, get: () => get_store_value(this.rawTranslations) };
    this.privateTranslations = writable({});
    this.translations = { subscribe: this.privateTranslations.subscribe, get: () => get_store_value(this.translations) };
    this.locales = f$1(l$1({}, derived([this.config, this.privateTranslations], ([t4, e]) => {
      if (!t4) return [];
      let { loaders: a = [] } = t4, r = a.map(({ locale: o }) => o), i2 = Object.keys(e).map((o) => o);
      return Array.from(/* @__PURE__ */ new Set([...h(...r), ...h(...i2)]));
    }, [])), { get: () => get_store_value(this.locales) });
    this.internalLocale = writable();
    this.loaderTrigger = derived([this.internalLocale, this.currentRoute], ([t4, e], a) => {
      var r, i2;
      t4 !== void 0 && e !== void 0 && !(t4 === ((r = get_store_value(this.loaderTrigger)) == null ? void 0 : r[0]) && e === ((i2 = get_store_value(this.loaderTrigger)) == null ? void 0 : i2[1])) && (c.debug("Triggering translation load..."), a([t4, e]));
    }, []);
    this.localeHelper = writable();
    this.locale = { subscribe: this.localeHelper.subscribe, forceSet: this.localeHelper.set, set: this.internalLocale.set, update: this.internalLocale.update, get: () => get_store_value(this.locale) };
    this.initialized = derived([this.locale, this.currentRoute, this.privateTranslations], ([t4, e, a], r) => {
      get_store_value(this.initialized) || r(t4 !== void 0 && e !== void 0 && !!Object.keys(a).length);
    });
    this.translation = derived([this.privateTranslations, this.locale, this.isLoading], ([t4, e, a], r) => {
      let i2 = t4[e];
      i2 && Object.keys(i2).length && !a && r(i2);
    }, {});
    this.t = f$1(l$1({}, derived([this.config, this.translation], (r) => {
      var [i2] = r, o = i2, { parser: t4, fallbackLocale: e } = o, a = L(o, ["parser", "fallbackLocale"]);
      return (n2, ...d2) => z(l$1({ parser: t4, key: n2, params: d2, translations: this.translations.get(), locale: this.locale.get(), fallbackLocale: e }, a.hasOwnProperty("fallbackValue") ? { fallbackValue: a.fallbackValue } : {}));
    })), { get: (t4, ...e) => get_store_value(this.t)(t4, ...e) });
    this.l = f$1(l$1({}, derived([this.config, this.translations], (i2) => {
      var [o, ...n2] = i2, d2 = o, { parser: t4, fallbackLocale: e } = d2, a = L(d2, ["parser", "fallbackLocale"]), [r] = n2;
      return (u2, b, ...k) => z(l$1({ parser: t4, key: b, params: k, translations: r, locale: u2, fallbackLocale: e }, a.hasOwnProperty("fallbackValue") ? { fallbackValue: a.fallbackValue } : {}));
    })), { get: (t4, e, ...a) => get_store_value(this.l)(t4, e, ...a) });
    this.getLocale = (t4) => {
      let { fallbackLocale: e } = get_store_value(this.config) || {}, a = t4 || e;
      if (!a) return;
      let r = this.locales.get();
      return r.find((o) => h(a).includes(o)) || r.find((o) => h(e).includes(o));
    };
    this.setLocale = (t4) => {
      if (t4 && t4 !== get_store_value(this.internalLocale)) return c.debug(`Setting '${t4}' locale.`), this.internalLocale.set(t4), this.loading.toPromise(t4, get_store_value(this.currentRoute));
    };
    this.setRoute = (t4) => {
      if (t4 !== get_store_value(this.currentRoute)) {
        c.debug(`Setting '${t4}' route.`), this.currentRoute.set(t4);
        let e = get_store_value(this.internalLocale);
        return this.loading.toPromise(e, t4);
      }
    };
    this.loadConfig = async (t4) => {
      await this.configLoader(t4);
    };
    this.getTranslationProps = async (t4 = this.locale.get(), e = get_store_value(this.currentRoute)) => {
      let a = get_store_value(this.config);
      if (!a || !t4) return [];
      let r = this.translations.get(), { loaders: i2, fallbackLocale: o = "", cache: n2 = D$1 } = a || {}, d2 = Number.isNaN(+n2) ? D$1 : +n2;
      this.cachedAt ? Date.now() > d2 + this.cachedAt && (c.debug("Refreshing cache."), this.loadedKeys = {}, this.cachedAt = 0) : (c.debug("Setting cache timestamp."), this.cachedAt = Date.now());
      let [u2, b] = h(t4, o), k = r[u2], I = r[b], R = (i2 || []).map((j) => {
        var T = j, { locale: p2 } = T, y = L(T, ["locale"]);
        return f$1(l$1({}, y), { locale: h(p2)[0] });
      }).filter(({ routes: p2 }) => !p2 || (p2 || []).some(W(e))).filter(({ key: p2, locale: y }) => y === u2 && (!k || !(this.loadedKeys[u2] || []).includes(p2)) || o && y === b && (!I || !(this.loadedKeys[b] || []).includes(p2)));
      if (R.length) {
        this.isLoading.set(true), c.debug("Fetching translations...");
        let p2 = await E(R);
        this.isLoading.set(false);
        let y = Object.keys(p2).reduce((T, P2) => f$1(l$1({}, T), { [P2]: Object.keys(p2[P2]) }), {}), j = R.filter(({ key: T, locale: P2 }) => (y[P2] || []).some((S) => `${S}`.startsWith(T))).reduce((T, { key: P2, locale: S }) => f$1(l$1({}, T), { [S]: [...T[S] || [], P2] }), {});
        return [p2, j];
      }
      return [];
    };
    this.addTranslations = (t4, e) => {
      if (!t4) return;
      let a = get_store_value(this.config), { preprocess: r } = a || {};
      c.debug("Adding translations...");
      let i2 = Object.keys(t4 || {});
      this.privateRawTranslations.update((o) => i2.reduce((n2, d2) => f$1(l$1({}, n2), { [d2]: l$1(l$1({}, n2[d2] || {}), t4[d2]) }), o)), this.privateTranslations.update((o) => i2.reduce((n2, d2) => {
        let u2 = true, b = t4[d2];
        return typeof r == "function" && (b = r(b)), (typeof r == "function" || r === "none") && (u2 = false), f$1(l$1({}, n2), { [d2]: l$1(l$1({}, n2[d2] || {}), u2 ? w(b, r === "preserveArrays") : b) });
      }, o)), i2.forEach((o) => {
        let n2 = Object.keys(t4[o]).map((d2) => `${d2}`.split(".")[0]);
        e && (n2 = e[o]), this.loadedKeys[o] = Array.from(/* @__PURE__ */ new Set([...this.loadedKeys[o] || [], ...n2 || []]));
      });
    };
    this.loader = async ([t4, e]) => {
      let a = this.getLocale(t4) || void 0;
      c.debug(`Adding loader promise for '${a}' locale and '${e}' route.`);
      let r = (async () => {
        let i2 = await this.getTranslationProps(a, e);
        i2.length && this.addTranslations(...i2);
      })();
      this.promises.add({ locale: a, route: e, promise: r }), r.then(() => {
        a && this.locale.get() !== a && this.locale.forceSet(a);
      });
    };
    this.loadTranslations = (t4, e = get_store_value(this.currentRoute) || "") => {
      let a = this.getLocale(t4);
      if (a) return this.setRoute(e), this.setLocale(a), this.loading.toPromise(a, e);
    };
    this.loaderTrigger.subscribe(this.loader), this.isLoading.subscribe(async (e) => {
      e && this.promises.size && (await this.loading.toPromise(), this.promises.clear(), c.debug("Loader promises have been purged."));
    }), t3 && this.loadConfig(t3);
  }
  async configLoader(t3) {
    if (!t3) return c.error("No config provided!");
    let n2 = t3, { initLocale: e, fallbackLocale: a, translations: r, log: i2 } = n2, o = L(n2, ["initLocale", "fallbackLocale", "translations", "log"]);
    i2 && V($(i2)), [e] = h(e), [a] = h(a), c.debug("Setting config."), this.config.set(l$1({ initLocale: e, fallbackLocale: a, translations: r }, o)), r && this.addTranslations(r), e && await this.loadTranslations(e);
  }
};
var n = Object.defineProperty, M = Object.defineProperties;
var u = Object.getOwnPropertyDescriptors;
var s = Object.getOwnPropertySymbols;
var f = Object.prototype.hasOwnProperty, P = Object.prototype.propertyIsEnumerable;
var i = (r, o, e) => o in r ? n(r, o, { enumerable: true, configurable: true, writable: true, value: e }) : r[o] = e, p = (r, o) => {
  for (var e in o || (o = {})) f.call(o, e) && i(r, e, o[e]);
  if (s) for (var e of s(o)) P.call(o, e) && i(r, e, o[e]);
  return r;
}, d = (r, o) => M(r, u(o));
var l = (r, o) => {
  var e = {};
  for (var a in r) f.call(r, a) && o.indexOf(a) < 0 && (e[a] = r[a]);
  if (r != null && s) for (var a of s(r)) o.indexOf(a) < 0 && P.call(r, a) && (e[a] = r[a]);
  return e;
};
var m = (e) => {
  var a = e, { parserOptions: r = {} } = a, o = l(a, ["parserOptions"]);
  return d(p({}, o), { parser: C$1(r) });
}, t$1 = class t extends O {
  constructor(e) {
    super(e && m(e));
    this.loadConfig = (e2) => super.configLoader(m(e2));
  }
}, D = t$1;
const config = {
  loaders: [
    {
      locale: "en",
      key: "lang",
      loader: async () => (await import("./lang.js")).default
    },
    {
      locale: "vi",
      key: "auth",
      loader: async () => (await import("./auth2.js")).default
    },
    {
      locale: "en",
      key: "auth",
      loader: async () => (await import("./auth3.js")).default
    }
  ]
};
const { t: t2, loading, locales, locale, loadTranslations, addTranslations, translations, setLocale, setRoute } = new D(config);
loading.subscribe(($loading) => $loading && console.log("Loading translations for the main instance..."));
export {
  addTranslations as a,
  setLocale as b,
  loadTranslations as c,
  t2 as d,
  locales as l,
  setRoute as s,
  translations as t
};
