import { basename, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, mergeConfig } from "vite";
import https from "node:https";
//#region src/assetsProxyPlugin.ts
const ASSET_RE = /^\/__l5e\/assets-v1\//;
const PREVIEW_HOST_ENV = "LOVABLE_PREVIEW_HOST";
const HOP_BY_HOP = /* @__PURE__ */ new Set([
	"host",
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"content-length",
	"cookie"
]);
function pickRequestHeaders(src) {
	const out = {};
	for (const [k, v] of Object.entries(src)) {
		if (v === void 0) continue;
		if (HOP_BY_HOP.has(k.toLowerCase())) continue;
		out[k] = v;
	}
	return out;
}
/**
* Forwards `/__l5e/assets-v1/*` requests from the Vite dev server to the
* Lovable preview proxy so assets resolve when the page is loaded directly
* from the sandbox dev server (e.g. `localhost:8080`) instead of via
* `*.lovable.app` / `*.lovableproject.com`.
*
* No-op unless `LOVABLE_PREVIEW_HOST` is set (host only, no scheme), e.g.
* `id-preview--<project-id>.lovable.app`.
*/
function lovableAssetsProxyPlugin() {
	const previewHost = process.env[PREVIEW_HOST_ENV]?.trim();
	return {
		name: "lovable:assets-proxy",
		apply: "serve",
		configureServer(server) {
			if (!previewHost) return;
			const middleware = (req, res, next) => {
				const url = req.url ?? "";
				if (!ASSET_RE.test(url)) return next();
				const upstream = https.request({
					host: previewHost,
					port: 443,
					method: req.method,
					path: url,
					headers: {
						...pickRequestHeaders(req.headers),
						host: previewHost
					}
				}, (upRes) => {
					res.statusCode = upRes.statusCode ?? 502;
					for (const [k, v] of Object.entries(upRes.headers)) {
						if (v === void 0) continue;
						if (HOP_BY_HOP.has(k.toLowerCase())) continue;
						res.setHeader(k, v);
					}
					upRes.pipe(res);
				});
				upstream.on("error", (err) => {
					server.config.logger.warn(`[@lovable.dev/vite-tanstack-config] asset proxy ${url} → ${previewHost} failed: ${err.message}`);
					if (!res.headersSent) {
						res.statusCode = 502;
						res.end();
					} else res.destroy(err);
				});
				req.pipe(upstream);
			};
			server.middlewares.use(middleware);
		}
	};
}
//#endregion
//#region src/bundledDev.ts
const BUNDLED_DEV_ENV_VAR = "LOVABLE_FEATURE_BUNDLED_DEV";
function bundledDevRequested() {
	return process.env[BUNDLED_DEV_ENV_VAR] === "true";
}
function viteVersionSupportsBundledDev(version) {
	if (!version || version.includes("-")) return false;
	const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
	if (!match) return false;
	const [major, minor] = [Number(match[1]), Number(match[2])];
	return major === 8 && minor === 1;
}
async function resolveInstalledViteVersion() {
	try {
		const { createRequire } = await import("node:module");
		const { version } = createRequire(`${process.cwd()}/package.json`)("vite/package.json");
		return typeof version === "string" ? version : void 0;
	} catch {
		return;
	}
}
//#endregion
//#region src/bundledDevCssUrlShim.ts
const VIRTUAL_PREFIX = "\0lovable-bundled-dev-css-url:";
const VIRTUAL_SUFFIX = ".shim.js";
function bundledDevCssUrlShim() {
	return {
		name: "lovable-bundled-dev-css-url-shim",
		apply: "serve",
		enforce: "pre",
		async resolveId(id, importer) {
			if (!id.endsWith(".css?url")) return null;
			const resolved = await this.resolve(id.slice(0, -4), importer, { skipSelf: true });
			if (!resolved) return null;
			return VIRTUAL_PREFIX + resolved.id + VIRTUAL_SUFFIX;
		},
		load(id) {
			if (!id.startsWith(VIRTUAL_PREFIX) || !id.endsWith(VIRTUAL_SUFFIX)) return null;
			const file = id.slice(29, -8);
			const inlineSpecifier = file.includes("?") ? `${file}&inline` : `${file}?inline`;
			return [
				`import css from ${JSON.stringify(inlineSpecifier)};`,
				`const b64 = typeof Buffer !== "undefined" ? Buffer.from(css, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(css)));`,
				`export default "data:text/css;base64," + b64;`
			].join("\n");
		}
	};
}
//#endregion
//#region package.json
var name = "@lovable.dev/vite-tanstack-config";
var version = "2.21.0";
//#endregion
//#region src/logging.ts
const PACKAGE_NAME = "@lovable.dev/vite-tanstack-config";
function logWarning(message) {
	console.warn(`[${PACKAGE_NAME}] ${message}`);
}
//#endregion
//#region src/outputPaths.ts
const PUBLISH_OUTPUT_DIR = "dist";
const SERVER_OUTPUT_DIR = `${PUBLISH_OUTPUT_DIR}/server`;
const CLIENT_OUTPUT_DIR = `${PUBLISH_OUTPUT_DIR}/client`;
//#endregion
//#region src/documents.ts
const DOCUMENT_SET_VERSION = 1;
const GENERATOR = `${name}@${version}`;
const DOCUMENT_SET_DIR = ".lovable";
const DOCUMENT_SET_FILE = "output.json";
const DOCUMENT_SET_PLUGIN_NAME = "lovable:document-set";
const TANSTACK_POST_BUILD_PLUGIN = "tanstack-start-core:post-build";
const DOT_SEGMENT = /(^|\/)\.(\/|$)/;
function hasControlChars(value) {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code < 32 || code === 127) return true;
	}
	return false;
}
function normalizeRoute(raw) {
	if (typeof raw !== "string") return void 0;
	const pathname = raw.split(/[?#]/)[0] ?? "";
	if (!pathname.startsWith("/")) return void 0;
	const route = pathname.replace(/\/+$/, "") || "/";
	if (route.includes("//") || route.includes("..") || route.includes("\\") || DOT_SEGMENT.test(route) || hasControlChars(route)) return;
	return route;
}
/** Upstream's `joinURL("/", router.basepath)`: leading slash, no trailing slash, "" when unset. */
function normalizeBasePath(raw) {
	if (typeof raw !== "string") return "";
	const trimmed = raw.trim().replace(/\/+$/, "");
	if (trimmed === "") return "";
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function withoutBasePath(route, basePath) {
	if (basePath === "") return route;
	if (route === basePath) return "/";
	if (route.startsWith(`${basePath}/`)) return route.slice(basePath.length);
	return route.startsWith(basePath) ? void 0 : route;
}
function documentEntryForPage(page, basePath = "") {
	if (typeof page.prerender?.outputPath === "string") return void 0;
	const pagePath = normalizeRoute(page.path);
	if (pagePath === void 0) return void 0;
	const inner = withoutBasePath(pagePath, basePath);
	if (inner === void 0) return void 0;
	const route = normalizeRoute(`${basePath}${inner}`);
	if (route === void 0) return void 0;
	const file = inner === "/" ? "index.html" : `${inner.slice(1)}/index.html`;
	if (file !== file.trim()) return void 0;
	return {
		route,
		file
	};
}
function compareRoutes(a, b) {
	if (a.route < b.route) return -1;
	if (a.route > b.route) return 1;
	return 0;
}
/** The artifact bytes, or undefined when there is nothing to publish. */
function serializeDocumentSet(entries, generator) {
	const sorted = [...entries].sort(compareRoutes);
	const selected = [];
	let cappedBy;
	let length = JSON.stringify({
		version: DOCUMENT_SET_VERSION,
		generator,
		documents: []
	}).length;
	for (const entry of sorted) {
		if (selected.length === 1e4) {
			cappedBy = "entry limit";
			break;
		}
		const added = JSON.stringify(entry).length + 1;
		if (length + added > 4e6) {
			cappedBy = "byte limit";
			break;
		}
		length += added;
		selected.push(entry);
	}
	if (cappedBy !== void 0) logWarning(`Publishing only ${selected.length} of ${sorted.length} publishable routes; the document set hit its ${cappedBy}.`);
	if (selected.length === 0) return void 0;
	return JSON.stringify({
		version: DOCUMENT_SET_VERSION,
		generator,
		documents: selected
	});
}
const EXISTENCE_BATCH_SIZE = 64;
async function inBatches(items, run) {
	const results = [];
	for (let i = 0; i < items.length; i += EXISTENCE_BATCH_SIZE) results.push(...await Promise.all(items.slice(i, i + EXISTENCE_BATCH_SIZE).map(run)));
	return results;
}
async function whichExist(paths, access) {
	return inBatches(paths, (path) => access(path).then(() => true, () => false));
}
async function whichMatch(pairs, readFile) {
	const read = (path) => readFile(path).catch((error) => {
		if (error.code !== "ENOENT") logWarning(`Could not read ${path} while checking prerender collisions: ${String(error)}`);
	});
	return inBatches(pairs, ([left, right]) => Promise.all([read(left), read(right)]).then(([a, b]) => a !== void 0 && b !== void 0 && a.equals(b)));
}
/** How the error names the public dir, which vite lets a project point anywhere. */
function publicDirLabel(root, publicDir, nodePath) {
	const relative = nodePath.relative(root, publicDir);
	return relative !== "" && !relative.startsWith("..") ? relative.split(nodePath.sep).join("/") : publicDir;
}
function createDocumentSet(routerBasePath) {
	const basePath = normalizeBasePath(routerBasePath);
	const basePathServable = basePath === "" || normalizeRoute(basePath) === basePath;
	if (!basePathServable) logWarning(`Not publishing any prerendered documents: router.basepath "${basePath}" is not a servable route.`);
	const documents = /* @__PURE__ */ new Map();
	let root = process.cwd();
	let clientOutputDir = CLIENT_OUTPUT_DIR;
	let publicDir = "";
	const plugin = {
		name: DOCUMENT_SET_PLUGIN_NAME,
		apply: "build",
		enforce: "post",
		configResolved(config) {
			root = config.root;
			const names = config.plugins?.map((candidate) => candidate.name) ?? [];
			const theirs = names.indexOf(TANSTACK_POST_BUILD_PLUGIN);
			const ours = names.indexOf(DOCUMENT_SET_PLUGIN_NAME);
			if (theirs !== -1 && ours !== -1 && ours < theirs) logWarning(`Prerendered routes will fall back to SSR: ${DOCUMENT_SET_PLUGIN_NAME} is registered before ${TANSTACK_POST_BUILD_PLUGIN}, so the document set is written before the prerender pass runs.`);
			clientOutputDir = config.environments?.client?.build?.outDir ?? CLIENT_OUTPUT_DIR;
			publicDir = (config.environments?.client?.build?.copyPublicDir ?? config.build?.copyPublicDir) !== false && typeof config.publicDir === "string" ? config.publicDir : "";
		},
		buildApp: {
			order: "post",
			async handler() {
				const { access, mkdir, readFile, rm, writeFile } = await import("node:fs/promises");
				const nodePath = await import("node:path");
				const artifact = nodePath.join(root, PUBLISH_OUTPUT_DIR, DOCUMENT_SET_DIR, DOCUMENT_SET_FILE);
				await rm(artifact, { force: true }).catch((error) => {
					logWarning(`Could not remove a previous build's document set: ${String(error)}`);
				});
				if (documents.size === 0) return;
				const clientDir = nodePath.resolve(root, clientOutputDir);
				const label = publicDirLabel(root, publicDir, nodePath);
				const collisions = [];
				if (publicDir !== "") {
					const candidates = [...documents].map(([route, file]) => ({
						route,
						file
					}));
					const committed = await whichExist(candidates.map(({ file }) => nodePath.join(publicDir, file)), access);
					const suspects = candidates.filter((_candidate, index) => committed[index]);
					const survived = await whichMatch(suspects.map(({ file }) => [nodePath.join(publicDir, file), nodePath.resolve(clientDir, file)]), readFile);
					for (const [index, suspect] of suspects.entries()) {
						if (!survived[index]) {
							collisions.push(suspect);
							continue;
						}
						documents.delete(suspect.route);
						logWarning(`Not publishing prerendered route ${suspect.route}: it would serve the committed ${label}/${suspect.file}, which the prerender pass left untouched.`);
					}
				}
				if (collisions.length > 0) {
					const pairs = collisions.sort(compareRoutes).map(({ route, file }) => `  ${route} overwrites ${label}/${file}`);
					throw new Error(`[${PACKAGE_NAME}] Prerendering would overwrite ${collisions.length} committed file(s) under ${label}/:\n${pairs.join("\n")}\nEach route's prerendered HTML is written into the client build after vite copies ${label}/, so every committed file above is replaced by its rendered route and never ships.\nFix each line above in one of two ways: delete or rename the ${label}/ file, or stop prerendering the route (drop it from \`pages\` in vite.config, or return false for it from \`prerender.filter\`).`);
				}
				const entries = [...documents].map(([route, file]) => ({
					route,
					file
				}));
				const exists = await whichExist(entries.map(({ file }) => nodePath.resolve(clientDir, file)), access);
				const present = [];
				for (const [index, entry] of entries.entries()) {
					if (exists[index]) {
						present.push(entry);
						continue;
					}
					logWarning(`Not publishing prerendered route ${entry.route}: it produced no ${entry.file}.`);
				}
				const payload = serializeDocumentSet(present, GENERATOR);
				if (payload === void 0) return;
				try {
					await mkdir(nodePath.dirname(artifact), { recursive: true });
					await writeFile(artifact, payload);
				} catch (error) {
					logWarning(`Could not write the document set; prerendered routes fall back to SSR: ${String(error)}`);
				}
			}
		}
	};
	const record = (page) => {
		if (!basePathServable) return;
		const entry = documentEntryForPage(page, basePath);
		if (entry === void 0) {
			if (typeof page.prerender?.outputPath !== "string") logWarning(`Not publishing prerendered route ${String(page.path)}: its path cannot be a document key (dot segments, "//", "..", backslashes, control characters, and leading/trailing whitespace are rejected).`);
			return;
		}
		documents.set(entry.route, entry.file);
	};
	return {
		record,
		plugin
	};
}
//#endregion
//#region src/index.ts
const SANDBOX_ENV_VAR = "DEV_SERVER__PROJECT_PATH";
const LOVABLE_SANDBOX_ENV_VAR = "LOVABLE_SANDBOX";
function isSandboxEnvironment() {
	return process.env[LOVABLE_SANDBOX_ENV_VAR] === "1" || !!process.env[SANDBOX_ENV_VAR];
}
const TOOL_MANAGED_WATCH_IGNORES = [
	"**/.workspace/**",
	"**/.agents/**",
	"**/.claude/**",
	"**/.lovable/**",
	"**/.tanstack/tmp/**"
];
const NITRO_DEFAULT_PRESET_MIN = [
	3,
	0,
	260603
];
async function nitroSupportsDefaultPreset() {
	try {
		const { createRequire } = await import("node:module");
		const { version } = createRequire(`${process.cwd()}/package.json`)("nitro/package.json");
		const match = typeof version === "string" ? /^(\d+)\.(\d+)\.(\d+)/.exec(version) : null;
		if (!match) return true;
		const parts = [
			Number(match[1]),
			Number(match[2]),
			Number(match[3])
		];
		for (let i = 0; i < 3; i++) if (parts[i] !== NITRO_DEFAULT_PRESET_MIN[i]) return parts[i] > NITRO_DEFAULT_PRESET_MIN[i];
		return true;
	} catch {
		return true;
	}
}
const LOVABLE_NITRO_PRESETS = ["cloudflare-module", "lovable-fetch-bundle"];
const ROOT_PRERENDER_PINS = {
	crawlLinks: false,
	failOnError: false,
	maxRedirects: 0,
	autoSubfolderIndex: true
};
const PAGE_PRERENDER_PINS = {
	crawlLinks: ROOT_PRERENDER_PINS.crawlLinks,
	autoSubfolderIndex: ROOT_PRERENDER_PINS.autoSubfolderIndex
};
function pinPrerenderOptions(source, pins, label) {
	const result = { ...source };
	for (const [key, value] of Object.entries(pins)) {
		if (key in result && result[key] !== value) logWarning(`Ignoring ${label}.${key} inside the Lovable build environment; forcing ${JSON.stringify(value)}.`);
		result[key] = value;
	}
	if ("outputPath" in result) {
		logWarning(`Ignoring ${label}.outputPath inside the Lovable build environment; prerendered routes are always written to <route>/index.html.`);
		delete result.outputPath;
	}
	return result;
}
const PRERENDER_REPORT_MARKER_OPEN = "[lovable-prerender-report]";
const PRERENDER_REPORT_MARKER_CLOSE = "[/lovable-prerender-report]";
const MAX_REPORTED_ROUTES = 50;
const MAX_REPORTED_ROUTE_LENGTH = 200;
function boundRoutes(routes) {
	return routes.slice(0, MAX_REPORTED_ROUTES).map((route) => route.slice(0, MAX_REPORTED_ROUTE_LENGTH));
}
function emitPrerenderReport(attempted, rendered, skipped) {
	const payload = JSON.stringify({
		attempted,
		rendered,
		skipped: boundRoutes(skipped)
	});
	try {
		process.stderr.write(`\n${PRERENDER_REPORT_MARKER_OPEN}\n${payload}\n${PRERENDER_REPORT_MARKER_CLOSE}\n`);
	} catch {}
}
function pinPrerenderForLovableBuild(userOptions) {
	const attempted = /* @__PURE__ */ new Set();
	const rendered = /* @__PURE__ */ new Set();
	const collector = createDocumentSet(userOptions.router?.basepath);
	const userPrerender = userOptions.prerender;
	const prerender = pinPrerenderOptions(userPrerender, ROOT_PRERENDER_PINS, "prerender");
	const userFilter = userPrerender?.filter;
	prerender.filter = (page) => {
		const keep = typeof userFilter === "function" ? userFilter(page) : true;
		if (keep) attempted.add(page.path);
		return keep;
	};
	const withRenderTracking = (userOnSuccess) => (ctx) => {
		rendered.add(ctx.page.path);
		collector.record(ctx.page);
		return typeof userOnSuccess === "function" ? userOnSuccess(ctx) : void 0;
	};
	prerender.onSuccess = withRenderTracking(userPrerender?.onSuccess);
	const startOptions = {
		...userOptions,
		prerender
	};
	if (Array.isArray(userOptions.pages)) startOptions.pages = userOptions.pages.map((page) => {
		if (!page || typeof page !== "object") return page;
		const entry = page;
		if (!entry.prerender) return entry;
		const pinned = pinPrerenderOptions(entry.prerender, PAGE_PRERENDER_PINS, `pages["${entry.path}"].prerender`);
		if ("onSuccess" in pinned) pinned.onSuccess = withRenderTracking(pinned.onSuccess);
		return {
			...entry,
			prerender: pinned
		};
	});
	const spa = userOptions.spa;
	if (typeof spa?.prerender?.onSuccess === "function") startOptions.spa = {
		...spa,
		prerender: {
			...spa.prerender,
			onSuccess: withRenderTracking(spa.prerender.onSuccess)
		}
	};
	return {
		startOptions,
		skipReporter: {
			name: "lovable:prerender-skip-report",
			apply: "build",
			enforce: "post",
			buildApp: {
				order: "post",
				async handler() {
					if (attempted.size === 0) return;
					const skipped = [...attempted].filter((route) => !rendered.has(route));
					emitPrerenderReport(attempted.size, rendered.size, skipped);
					if (skipped.length === 0) return;
					logWarning(`Prerender skipped ${skipped.length} route(s) that failed to render; they fall back to SSR: ${skipped.join(", ")}`);
				}
			}
		},
		documentSet: collector.plugin
	};
}
function lovableFetchBundlePreset() {
	return {
		entry: fileURLToPath(new URL("../runtime/fetch-entry.mjs", import.meta.url)),
		serveStatic: false,
		noExternals: true,
		inlineDynamicImports: true,
		output: {
			dir: PUBLISH_OUTPUT_DIR,
			serverDir: "{{ output.dir }}/server",
			publicDir: "{{ output.dir }}/client"
		}
	};
}
function validateHeaders(config) {
	const headers = config.server?.headers;
	if (!headers) return;
	const headerKeys = Object.keys(headers);
	if (headerKeys.length > 0) logWarning(`Your config includes server headers that will be removed in sandbox mode: ${headerKeys.join(", ")}`);
}
function isExternalUrl(url) {
	try {
		const parsed = new URL(url);
		return ![
			"localhost",
			"127.0.0.1",
			"::1",
			"0.0.0.0",
			"::"
		].includes(parsed.hostname);
	} catch {
		return false;
	}
}
function validateProxy(config) {
	const proxy = config.server?.proxy;
	if (!proxy) return;
	for (const [path, proxyConfig] of Object.entries(proxy)) if (typeof proxyConfig === "string") {
		if (isExternalUrl(proxyConfig)) logWarning(`Proxy '${path}' targets external URL: ${proxyConfig}. This may cause issues in the sandbox environment.`);
	} else if (proxyConfig) {
		const target = typeof proxyConfig.target === "string" ? proxyConfig.target : void 0;
		if (target && isExternalUrl(target)) logWarning(`Proxy '${path}' targets external URL: ${target}. This may cause issues in the sandbox environment.`);
		if (proxyConfig.ws) logWarning(`Proxy '${path}' enables WebSocket proxying, which may interfere with HMR.`);
		if (proxyConfig.changeOrigin) logWarning(`Proxy '${path}' changes origin, which may cause CORS issues.`);
	}
}
function validateCors(config) {
	if (config.server?.cors && typeof config.server.cors !== "boolean" && config.server.cors !== null) logWarning("Custom CORS config detected. Sandbox requires specific CORS settings for proxy compatibility.");
}
function validatePort(config) {
	if (config.server?.port && config.server.port !== 8080) logWarning(`Port ${config.server.port} configured, but sandbox requires port 8080. Using 8080.`);
}
function validateConfig(config) {
	validateHeaders(config);
	validateProxy(config);
	validateCors(config);
	validatePort(config);
}
function cleanServerConfig(config) {
	if (config.server?.headers || config.server?.cors || config.server?.proxy) {
		const { headers: _headers, cors: _cors, proxy: _proxy, ...serverRest } = config.server;
		return {
			...config,
			server: serverRest
		};
	}
	return config;
}
function applyWatchDebounceDefaults(config) {
	const existingWatch = config.server?.watch ?? {};
	const existingAwaitWriteFinish = existingWatch.awaitWriteFinish;
	const hasAwaitWriteFinishObject = !!existingAwaitWriteFinish && typeof existingAwaitWriteFinish === "object" && !Array.isArray(existingAwaitWriteFinish);
	return mergeConfig(config, { server: { watch: {
		...existingWatch,
		awaitWriteFinish: {
			...hasAwaitWriteFinishObject ? existingAwaitWriteFinish : {},
			stabilityThreshold: 1e3,
			pollInterval: 100
		}
	} } });
}
const SSR_CAPTURE_KEY = "__LOVABLE_TANSTACK_CAPTURE_SSR_ERROR__";
const HANDLER_RAN_KEY = "__LOVABLE_TANSTACK_HANDLER_RAN__";
const BUILD_ERROR_MESSAGE = /transform failed with \d+ error|failed to parse source/i;
function isBuildError(error) {
	if (typeof error === "string") return BUILD_ERROR_MESSAGE.test(error);
	if (!error || typeof error !== "object") return false;
	const e = error;
	if (typeof e.plugin === "string" && (e.plugin.startsWith("vite:") || e.plugin.startsWith("esbuild:"))) return true;
	if (e.frame != null && e.loc != null) return true;
	if (Array.isArray(e.errors) && e.errors.length > 0 && e.errors.every((x) => x != null && typeof x === "object" && "text" in x && "location" in x)) return true;
	const message = typeof e.message === "string" ? e.message : "";
	return BUILD_ERROR_MESSAGE.test(message);
}
const BUILD_DIAGNOSTICS_PLUGIN_NAME = "lovable-build-error-diagnostics";
const MAX_DIAGNOSTIC_JSON_LENGTH = 6e3;
const MAX_DIAGNOSTIC_STRING_LENGTH = 2e3;
const MAX_DIAGNOSTIC_NESTED_ERRORS = 20;
const MAX_DIAGNOSTIC_DEPTH = 4;
const COMPACT_DIAGNOSTIC_STRING_LENGTH = 300;
const COMPACT_DIAGNOSTIC_NESTED_ERRORS = 3;
const COMPACT_DIAGNOSTIC_DEPTH = 3;
const DIAGNOSTIC_ERROR_FIELDS = [
	"name",
	"message",
	"plugin",
	"pluginCode",
	"id",
	"moduleId",
	"hook",
	"code",
	"loc",
	"frame",
	"stack",
	"cause"
];
function truncateDiagnosticString(value) {
	return truncateDiagnosticStringTo(value, MAX_DIAGNOSTIC_STRING_LENGTH);
}
function truncateDiagnosticStringTo(value, maxLength) {
	return value.length > maxLength ? `${value.slice(0, maxLength)}...[truncated]` : value;
}
function readDiagnosticProperty(value, key) {
	try {
		return value[key];
	} catch (error) {
		return `[unreadable: ${error instanceof Error ? error.message : String(error)}]`;
	}
}
function serializeOwnDiagnosticProperties(value, depth, seen) {
	const keys = Object.keys(value);
	const output = {};
	for (const key of keys.slice(0, MAX_DIAGNOSTIC_NESTED_ERRORS)) {
		const nested = readDiagnosticProperty(value, key);
		if (nested == null || nested === "") continue;
		output[key] = serializeDiagnosticValue(nested, depth + 1, seen);
	}
	if (keys.length > MAX_DIAGNOSTIC_NESTED_ERRORS) output.properties_truncated = keys.length - MAX_DIAGNOSTIC_NESTED_ERRORS;
	return output;
}
function describeDiagnosticPrimitive(value) {
	if (typeof value === "symbol") return value.description ? `Symbol(${value.description})` : "Symbol()";
	if (typeof value === "bigint") return value.toString();
	if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
	return String(value);
}
function describeDiagnosticObject(value) {
	const constructorName = value.constructor?.name;
	if (typeof constructorName === "string" && constructorName !== "" && constructorName !== "Object") return `[${constructorName}]`;
	return Object.prototype.toString.call(value);
}
function serializeDiagnosticValue(value, depth, seen) {
	if (value == null) return value;
	if (typeof value === "string") return truncateDiagnosticString(value);
	if (typeof value === "number" || typeof value === "boolean") return value;
	if (typeof value !== "object") return describeDiagnosticPrimitive(value);
	if (seen.has(value)) return "[circular]";
	if (depth >= MAX_DIAGNOSTIC_DEPTH) return "[max depth]";
	seen.add(value);
	try {
		if (Array.isArray(value)) return value.slice(0, MAX_DIAGNOSTIC_NESTED_ERRORS).map((item) => serializeDiagnosticValue(item, depth + 1, seen));
		const record = value;
		const output = {};
		for (const field of DIAGNOSTIC_ERROR_FIELDS) {
			if (!(field in record)) continue;
			const nested = readDiagnosticProperty(record, field);
			if (nested == null || nested === "") continue;
			output[field] = serializeDiagnosticValue(nested, depth + 1, seen);
		}
		const nestedErrors = readDiagnosticProperty(record, "errors");
		if (Array.isArray(nestedErrors)) {
			output.errors = nestedErrors.slice(0, MAX_DIAGNOSTIC_NESTED_ERRORS).map((item) => serializeDiagnosticValue(item, depth + 1, seen));
			if (nestedErrors.length > MAX_DIAGNOSTIC_NESTED_ERRORS) output.errors_truncated = nestedErrors.length - MAX_DIAGNOSTIC_NESTED_ERRORS;
		} else if (nestedErrors != null && nestedErrors !== "") output.errors = serializeDiagnosticValue(nestedErrors, depth + 1, seen);
		if (Object.keys(output).length > 0) return output;
		const ownProperties = serializeOwnDiagnosticProperties(record, depth, seen);
		return Object.keys(ownProperties).length > 0 ? ownProperties : describeDiagnosticObject(value);
	} catch (error) {
		return `[unreadable object: ${error instanceof Error ? error.message : String(error)}]`;
	} finally {
		seen.delete(value);
	}
}
function compactDiagnosticValue(value, depth) {
	if (value == null) return value;
	if (typeof value === "string") return truncateDiagnosticStringTo(value, COMPACT_DIAGNOSTIC_STRING_LENGTH);
	if (typeof value === "number" || typeof value === "boolean") return value;
	if (typeof value !== "object") return describeDiagnosticPrimitive(value);
	if (depth >= COMPACT_DIAGNOSTIC_DEPTH) return "[max depth]";
	try {
		if (Array.isArray(value)) {
			const items = value.slice(0, COMPACT_DIAGNOSTIC_NESTED_ERRORS).map((item) => compactDiagnosticValue(item, depth + 1));
			if (value.length > COMPACT_DIAGNOSTIC_NESTED_ERRORS) items.push(`[${value.length - COMPACT_DIAGNOSTIC_NESTED_ERRORS} items truncated]`);
			return items;
		}
		const record = value;
		const output = {};
		const keys = Object.keys(record);
		for (const key of keys.slice(0, MAX_DIAGNOSTIC_NESTED_ERRORS)) {
			const nested = readDiagnosticProperty(record, key);
			if (nested == null || nested === "") continue;
			output[key] = compactDiagnosticValue(nested, depth + 1);
		}
		if (keys.length > MAX_DIAGNOSTIC_NESTED_ERRORS) output.properties_truncated = keys.length - MAX_DIAGNOSTIC_NESTED_ERRORS;
		return output;
	} catch (error) {
		return `[unreadable object: ${error instanceof Error ? error.message : String(error)}]`;
	}
}
function stringifyDiagnosticPayload(diagnostics) {
	const full = JSON.stringify(diagnostics);
	if (full && full.length <= MAX_DIAGNOSTIC_JSON_LENGTH) return full;
	const compact = compactDiagnosticValue(diagnostics, 0);
	const compactPayload = compact != null && typeof compact === "object" && !Array.isArray(compact) ? {
		...compact,
		diagnostics_truncated: true
	} : {
		diagnostics_truncated: true,
		value: compact
	};
	const compactJson = JSON.stringify(compactPayload);
	if (compactJson.length <= MAX_DIAGNOSTIC_JSON_LENGTH) return compactJson;
	return JSON.stringify({
		diagnostics_truncated: true,
		message: "Diagnostic payload exceeded output budget."
	});
}
function lovableBuildErrorDiagnostics() {
	let emitted = false;
	const emitDiagnostics = (error) => {
		if (!error || emitted) return;
		emitted = true;
		try {
			const output = `\n[lovable-build-error-diagnostics]\n${stringifyDiagnosticPayload(serializeDiagnosticValue(error, 0, /* @__PURE__ */ new WeakSet()))}\n[/lovable-build-error-diagnostics]\n`;
			let written = false;
			const write = () => {
				if (written) return;
				written = true;
				try {
					process.stderr.write(output);
				} catch {}
			};
			setImmediate(write);
			process.once("exit", write);
		} catch {}
	};
	return {
		name: BUILD_DIAGNOSTICS_PLUGIN_NAME,
		apply: "build",
		buildEnd(error) {
			emitDiagnostics(error);
		},
		renderError(error) {
			emitDiagnostics(error);
		}
	};
}
function nitroEmitDirs(dirs) {
	if (!dirs) return [SERVER_OUTPUT_DIR];
	const found = [dirs.nitroOutput.serverDir, ...dirs.entryDirs].filter((dir) => !!dir);
	return [...new Set(found)];
}
const NODEJS_COMPAT_DEFAULT_ON_DATE = "2026-08-04";
const NITRO_WRANGLER_CONFIG = "wrangler.json";
function stripRedundantNodejsCompatFlag(dirs) {
	let root = process.cwd();
	return {
		name: "lovable-strip-redundant-nodejs-compat",
		apply: "build",
		configResolved(config) {
			root = config.root;
		},
		buildApp: {
			order: "post",
			handler: async () => {
				const { readFile, writeFile } = await import("node:fs/promises");
				let configPath;
				let parsed;
				for (const dir of nitroEmitDirs(dirs)) {
					configPath = join(resolve(root, dir), NITRO_WRANGLER_CONFIG);
					try {
						parsed = JSON.parse(await readFile(configPath, "utf8"));
						break;
					} catch {
						configPath = void 0;
					}
				}
				if (configPath === void 0) return;
				if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return;
				const config = parsed;
				if (typeof config.compatibility_date !== "string") return;
				if (config.compatibility_date < NODEJS_COMPAT_DEFAULT_ON_DATE) return;
				if (!Array.isArray(config.compatibility_flags)) return;
				const flags = config.compatibility_flags.filter((flag) => flag !== "nodejs_compat");
				if (flags.length === config.compatibility_flags.length) return;
				await writeFile(configPath, JSON.stringify({
					...config,
					compatibility_flags: flags
				}, null, 2));
			}
		}
	};
}
const NITRO_SERVER_ENTRY = "index.mjs";
const NITRO_DEFAULT_OUTPUT_DIR = ".output";
const VITE_DEFAULT_OUTPUT_DIR = "dist";
const DEFAULT_SERVER_ENTRY_NAME = "server";
const PRERENDER_PREVIEW_HOST = "127.0.0.1";
const TSS_PRERENDERING_ENV = "TSS_PRERENDERING";
const SHIM_MARKER = "// Generated by @lovable.dev/vite-tanstack-config for the prerender preview server.";
function prerenderShimSource(vars, entrySpecifier) {
	return `${SHIM_MARKER}
import server from "${entrySpecifier}";

const env = ${JSON.stringify(vars)};
const ctx = { waitUntil() {}, passThroughOnException() {}, props: {} };

export default {
  fetch(request) {
    // srvx's NodeRequest exposes \`ip\` as a getter-only accessor and nitro's
    // cloudflare module handler assigns to it; shadow it with a writable one.
    Object.defineProperty(request, "ip", { value: undefined, writable: true, configurable: true });
    return server.fetch(request, env, ctx);
  },
};
`;
}
function captureNitroServerDir(nitroOpts) {
	const output = {};
	const hooks = nitroOpts.hooks ?? {};
	const userCompiled = hooks.compiled;
	nitroOpts.hooks = {
		...hooks,
		compiled: async (nitro) => {
			const serverDir = nitro?.options?.output?.serverDir;
			if (typeof serverDir === "string") output.serverDir = serverDir;
			if (typeof userCompiled === "function") await userCompiled(nitro);
		}
	};
	return output;
}
function previewServerOutputDir(viteConfig) {
	const ssrOutDir = viteConfig?.environments?.ssr?.build?.outDir;
	if (typeof ssrOutDir === "string") return ssrOutDir;
	const rootOutDir = viteConfig?.build?.outDir;
	return join(typeof rootOutDir === "string" ? rootOutDir : VITE_DEFAULT_OUTPUT_DIR, "server");
}
function pinnedNitroServerDir(nitroOpts) {
	const output = nitroOpts.output;
	const dir = typeof output?.dir === "string" ? output.dir : void 0;
	const serverDir = typeof output?.serverDir === "string" ? output.serverDir : void 0;
	const resolved = serverDir ? serverDir.replace(/\{\{\s*output\.dir\s*\}\}/g, dir ?? NITRO_DEFAULT_OUTPUT_DIR) : dir && join(dir, "server");
	return resolved && !resolved.includes("{{") ? resolved : void 0;
}
function prerenderShimDirs(viteConfig, nitroOpts) {
	const shimDir = previewServerOutputDir(viteConfig);
	const candidates = [
		pinnedNitroServerDir(nitroOpts),
		join(NITRO_DEFAULT_OUTPUT_DIR, "server"),
		shimDir
	];
	return {
		shimDir,
		entryDirs: [...new Set(candidates.filter((dir) => !!dir))],
		nitroOutput: captureNitroServerDir(nitroOpts)
	};
}
function prerenderPreviewShim(state, dirs) {
	let root = process.cwd();
	let serverEntryName = DEFAULT_SERVER_ENTRY_NAME;
	return {
		name: "lovable-prerender-preview-shim",
		apply: "build",
		config(userConfig) {
			const ssrBuild = userConfig.environments?.ssr?.build;
			const input = ssrBuild?.rolldownOptions?.input ?? ssrBuild?.rollupOptions?.input;
			if (typeof input === "string") serverEntryName = input;
		},
		configResolved(config) {
			root = config.root;
		},
		buildApp: {
			order: "post",
			handler: async () => {
				const { access, mkdir, readFile, writeFile } = await import("node:fs/promises");
				const exists = async (candidate) => {
					try {
						await access(candidate);
						return true;
					} catch {
						return false;
					}
				};
				const candidates = nitroEmitDirs(dirs);
				let entryDir;
				for (const candidate of candidates) {
					const resolved = resolve(root, candidate);
					if (await exists(join(resolved, NITRO_SERVER_ENTRY))) {
						entryDir = resolved;
						break;
					}
				}
				if (!entryDir) {
					logWarning(`Cannot prerender: nitro's ${NITRO_SERVER_ENTRY} is in none of ${candidates.join(", ")}, so the preview shim was not written and every prerendered route will fall back to SSR.`);
					return;
				}
				const entryName = basename(serverEntryName, extname(serverEntryName));
				const wouldOutrankNitroEntry = entryName === "index" && dirs.shimDir === SERVER_OUTPUT_DIR;
				if (!entryName || wouldOutrankNitroEntry) {
					logWarning(`Cannot prerender: the server entry "${serverEntryName}" would need a shim at ${dirs.shimDir}/index.js, which outranks nitro's own entry when publishing. Rename the entry to anything but \`index\`.`);
					return;
				}
				const shimDir = resolve(root, dirs.shimDir);
				const target = join(shimDir, `${entryName}.js`);
				const occupant = await readFile(target, "utf8").catch(() => void 0);
				if (occupant !== void 0 && !occupant.startsWith(SHIM_MARKER)) {
					logWarning(`Cannot prerender: ${entryName}.js already exists in ${dirs.shimDir} and was not written by this plugin.`);
					return;
				}
				let vars = {};
				try {
					const candidate = JSON.parse(await readFile(join(entryDir, NITRO_WRANGLER_CONFIG), "utf8"))?.vars;
					if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) vars = candidate;
				} catch {}
				const specifier = relative(shimDir, join(entryDir, NITRO_SERVER_ENTRY)).split(sep).join("/");
				await mkdir(shimDir, { recursive: true });
				await writeFile(target, prerenderShimSource(vars, specifier.startsWith(".") ? specifier : `./${specifier}`));
				state.file = target;
			}
		}
	};
}
function prerenderPreviewShimCleanup(state) {
	return {
		name: "lovable-prerender-preview-shim-cleanup",
		apply: "build",
		enforce: "post",
		buildApp: {
			order: "post",
			handler: async () => {
				if (!state.file) return;
				const { rm } = await import("node:fs/promises");
				await rm(state.file, { force: true });
				state.file = void 0;
			}
		}
	};
}
function prerenderIsEnabled(startOptions) {
	const spa = startOptions.spa;
	if (spa && (spa.enabled ?? true)) return true;
	const prerender = startOptions.prerender;
	if (prerender?.enabled === false) return false;
	const pages = Array.isArray(startOptions.pages) ? startOptions.pages : [];
	return !!(prerender?.enabled ?? pages.some((page) => !!page?.prerender?.enabled));
}
function devSsrErrorLogger() {
	let lastCapture;
	const CAPTURE_TTL_MS = 5e3;
	const handlerRanFlag = Symbol("lovableHandlerRan");
	const capture = (error) => {
		lastCapture = {
			error,
			at: Date.now()
		};
	};
	const consumeCapture = () => {
		if (!lastCapture) return void 0;
		if (Date.now() - lastCapture.at > CAPTURE_TTL_MS) {
			lastCapture = void 0;
			return;
		}
		const { error } = lastCapture;
		lastCapture = void 0;
		return error;
	};
	return {
		name: "dev-ssr-error-logger",
		apply: "serve",
		configureServer(server) {
			globalThis[SSR_CAPTURE_KEY] = capture;
			globalThis[HANDLER_RAN_KEY] = (event) => {
				const res = event?.node?.res;
				if (res) res[handlerRanFlag] = true;
			};
			const g = globalThis;
			if (typeof g.addEventListener === "function") {
				const addListener = g.addEventListener;
				addListener("error", (e) => capture(e.error ?? e));
				addListener("unhandledrejection", (e) => capture(e.reason));
			}
			const onUnhandledRejection = (reason) => capture(reason);
			process.on("unhandledRejection", onUnhandledRejection);
			server.httpServer?.once("close", () => {
				process.off("unhandledRejection", onUnhandledRejection);
			});
			server.middlewares.use((req, res, next) => {
				let handled = false;
				const handleErrorResponse = () => {
					if (handled || res.statusCode < 500) return;
					handled = true;
					const captured = consumeCapture();
					const ranHandler = Boolean(res[handlerRanFlag]);
					let source;
					if (!ranHandler) source = "vite";
					else if (isBuildError(captured)) source = "build";
					else source = "app";
					if (!res.headersSent) try {
						res.setHeader("x-lovable-error-source", source);
					} catch {}
					const where = [req.method, req.url].filter(Boolean).join(" ") || "the request";
					let data;
					if (captured instanceof Error) data = {
						name: captured.name,
						message: captured.message,
						stack: captured.stack
					};
					else if (typeof captured === "string" && captured.length > 0) data = {
						name: "Error",
						message: captured
					};
					else if (ranHandler) data = { message: `The app returned ${res.statusCode} while handling ${where}. The error was handled by a route or error boundary, so no stack was captured — check the failing loader/route code and the dev server output.` };
					else data = { message: `Dev server returned ${res.statusCode} for ${where} before the app handler ran. This is usually a Vite build/transform error — check the dev server output for the underlying error.` };
					try {
						server.ws.send({
							type: "custom",
							event: "server-ssr-error",
							data
						});
					} catch {}
				};
				const origWriteHead = res.writeHead.bind(res);
				res.writeHead = (...args) => {
					if (typeof args[0] === "number") res.statusCode = args[0];
					handleErrorResponse();
					return origWriteHead(...args);
				};
				const origEnd = res.end.bind(res);
				res.end = (...args) => {
					handleErrorResponse();
					return origEnd(...args);
				};
				next();
			});
		},
		transform(code, id) {
			const normalizedId = id.replace(/\\/g, "/");
			if (!(normalizedId.includes("/@tanstack/start-server-core/src/request-response.ts") || normalizedId.includes("/@tanstack/start-server-core/dist/esm/request-response.js"))) return null;
			const needle = "handler(request, requestOpts)";
			if (!code.includes(needle)) return null;
			return code.replace(needle, `(globalThis.${HANDLER_RAN_KEY}?.(typeof h3Event === "undefined" ? undefined : h3Event), Promise.resolve(${needle}).catch((err) => { globalThis.${SSR_CAPTURE_KEY}?.(err); throw err; }))`);
		}
	};
}
function devServerFnErrorLogger() {
	const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";
	return {
		name: "dev-server-fn-error-logger",
		apply: "serve",
		enforce: "pre",
		configureServer(server) {
			globalThis[HMR_SEND_KEY] = (data) => {
				server.ws.send({
					type: "custom",
					event: "server-fn-error",
					data
				});
			};
		},
		transform(code, id) {
			const normalizedId = id.replace(/\\/g, "/");
			if (!(normalizedId.includes("/@tanstack/start-server-core/src/server-functions-handler.ts") || normalizedId.includes("/@tanstack/start-server-core/dist/esm/server-functions-handler.js"))) return null;
			const needle = "const unwrapped = res.result || res.error";
			if (!code.includes(needle)) return null;
			return code.replace(needle, `${needle}

      if (res?.error) {
        const err = res.error
        const payload = {
          source: 'tanstack',
          type: 'server-fn-error',
          method: request.method,
          url: request.url,
          name: err?.name ?? 'Error',
          message: err?.message ?? String(err),
          stack: typeof err?.stack === 'string' ? err.stack : undefined,
        }
        globalThis.${HMR_SEND_KEY}?.(payload)
      }`);
		}
	};
}
function defineConfig(configOrOptions = {}) {
	return async (env) => {
		const { command, mode } = env;
		const isSandbox = isSandboxEnvironment();
		const isDevBuild = command === "build" && mode === "development";
		let options;
		if (typeof configOrOptions === "function") options = { vite: await Promise.resolve(configOrOptions(env)) };
		else if (configOrOptions instanceof Promise) options = { vite: await configOrOptions };
		else {
			const optionObject = configOrOptions && typeof configOrOptions === "object" ? configOrOptions : {};
			if ("cloudflare" in optionObject) if (optionObject.cloudflare === false && !("nitro" in optionObject)) {
				optionObject.nitro = false;
				logWarning("`cloudflare: false` is deprecated in v2 — migrated to `nitro: false`. Update your config to drop the warning.");
			} else logWarning("The `cloudflare` option was removed in v2. Use `nitro: false` to disable the deploy plugin, or `nitro: { preset: '...' }` to configure it. The `cloudflare` setting is being ignored.");
			options = "vite" in optionObject || "serverFnErrorLogger" in optionObject || "ssrErrorLogger" in optionObject || "nitro" in optionObject || "tanstackStart" in optionObject || "react" in optionObject || "envDefine" in optionObject || "hmrGate" in optionObject ? optionObject : { vite: optionObject };
		}
		const internalPlugins = [];
		if (mode === "development") {
			const { devtools } = await import("@tanstack/devtools-vite");
			internalPlugins.push(devtools({
				logging: false,
				eventBusConfig: { enabled: false },
				enhancedLogs: { enabled: false },
				consolePiping: { enabled: false },
				removeDevtoolsOnBuild: false,
				injectSource: { enabled: true }
			}));
		}
		const tailwindcss = (await import("@tailwindcss/vite")).default;
		internalPlugins.push(tailwindcss());
		const tsConfigPaths = (await import("vite-tsconfig-paths")).default;
		internalPlugins.push(tsConfigPaths({ projects: ["./tsconfig.json"] }));
		if (options.serverFnErrorLogger !== false) internalPlugins.push(devServerFnErrorLogger());
		if (options.ssrErrorLogger !== false) internalPlugins.push(devSsrErrorLogger());
		if (command === "build" && isSandbox) internalPlugins.push(lovableBuildErrorDiagnostics());
		const { tanstackStart } = await import("@tanstack/react-start/plugin/vite");
		const tanstackStartOptions = mergeConfig({ importProtection: {
			behavior: "error",
			client: {
				files: ["**/server/**"],
				specifiers: ["server-only"]
			}
		} }, options.tanstackStart ?? {});
		const prerenderEnabled = prerenderIsEnabled(tanstackStartOptions);
		if (command === "build" && isSandbox) {
			const { startOptions, skipReporter, documentSet } = pinPrerenderForLovableBuild(tanstackStartOptions);
			internalPlugins.push(tanstackStart(startOptions), skipReporter, documentSet);
		} else internalPlugins.push(tanstackStart(tanstackStartOptions));
		const explicitNitro = options.nitro === true || typeof options.nitro === "object" && options.nitro !== null;
		if (options.nitro !== false && command === "build") {
			let nitroMod;
			try {
				nitroMod = await import("nitro/vite");
			} catch (err) {
				if (explicitNitro || isSandbox) {
					const reason = explicitNitro ? `an explicit \`nitro\` option (${options.nitro === true ? "true" : "{ ... }"}) was set in vite.config.ts` : "running inside a Lovable sandbox";
					throw new Error(`[@lovable.dev/vite-tanstack-config] ${reason}, but the \`nitro\` package isn't installed. Add \`nitro\` to your devDependencies (matches peerDependency >=3.0.260429-beta). Original import error: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
			if (nitroMod) {
				const { nitro } = nitroMod;
				const userNitroOpts = typeof options.nitro === "object" && options.nitro ? options.nitro : {};
				const nitroOpts = {
					defaultPreset: "cloudflare-module",
					...userNitroOpts
				};
				if (isSandbox) {
					for (const envVar of ["NITRO_PRESET", "SERVER_PRESET"]) if (process.env[envVar]) {
						logWarning(`Ignoring ${envVar} inside the Lovable build environment.`);
						delete process.env[envVar];
					}
					const requestedPreset = process.env.LOVABLE_NITRO_PRESET;
					if (requestedPreset && !LOVABLE_NITRO_PRESETS.includes(requestedPreset)) logWarning(`Ignoring unknown LOVABLE_NITRO_PRESET "${requestedPreset}"; building for cloudflare-module.`);
					if (requestedPreset === "lovable-fetch-bundle") {
						if (!await nitroSupportsDefaultPreset()) throw new Error("[@lovable.dev/vite-tanstack-config] LOVABLE_NITRO_PRESET=lovable-fetch-bundle requires nitro >=3.0.260603-beta.");
						nitroOpts.preset = "";
						delete nitroOpts.cloudflare;
						const fetchBundle = lovableFetchBundlePreset();
						nitroOpts.defaultPreset = fetchBundle;
						Object.assign(nitroOpts, fetchBundle);
					} else {
						delete nitroOpts.defaultPreset;
						nitroOpts.preset = "cloudflare-module";
						nitroOpts.output = {
							dir: PUBLISH_OUTPUT_DIR,
							serverDir: SERVER_OUTPUT_DIR,
							publicDir: CLIENT_OUTPUT_DIR
						};
						nitroOpts.cloudflare = {
							nodeCompat: true,
							deployConfig: true,
							...userNitroOpts.cloudflare
						};
					}
				} else if (!nitroOpts.preset && !await nitroSupportsDefaultPreset()) logWarning("The installed `nitro` predates the `defaultPreset` option (3.0.260603-beta), so the Cloudflare fallback is ignored and a zero-config build may target Node instead. Upgrade nitro to >=3.0.260603-beta, or set an explicit `nitro: { preset: \"cloudflare-module\" }`.");
				const nitroDirs = prerenderEnabled || isSandbox ? prerenderShimDirs(options.vite, nitroOpts) : void 0;
				internalPlugins.push(nitro(nitroOpts));
				if (prerenderEnabled && nitroDirs) {
					const shimState = {};
					internalPlugins.push(prerenderPreviewShim(shimState, nitroDirs), prerenderPreviewShimCleanup(shimState));
				}
				if (isSandbox) internalPlugins.push(stripRedundantNodejsCompatFlag(nitroDirs));
			}
		}
		const viteReact = (await import("@vitejs/plugin-react")).default;
		internalPlugins.push(viteReact(options.react));
		if (command === "serve") {
			const hmrGateOpt = options.hmrGate;
			if (isSandbox ? hmrGateOpt !== false : !!hmrGateOpt) {
				const { hmrGatePlugin } = await import("./hmr-gate.js");
				const hmrGateOptions = typeof hmrGateOpt === "object" ? hmrGateOpt : {};
				internalPlugins.push(hmrGatePlugin(hmrGateOptions));
			}
		}
		if (command === "serve" && isSandbox) {
			const { devServerBridgePlugin } = await import("./dev-server-bridge.js");
			internalPlugins.push(devServerBridgePlugin());
		}
		if (command === "serve") internalPlugins.push(lovableAssetsProxyPlugin());
		let envDefine = {};
		if (options.envDefine !== false) {
			const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
			for (const [key, value] of Object.entries(loadedEnv)) envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
		}
		let config = {
			define: envDefine,
			...isDevBuild ? {
				environments: { client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } } },
				esbuild: { keepNames: true }
			} : {},
			css: { transformer: "lightningcss" },
			resolve: {
				alias: { "@": `${process.cwd()}/src` },
				dedupe: [
					"react",
					"react-dom",
					"react/jsx-runtime",
					"react/jsx-dev-runtime",
					"@tanstack/react-query",
					"@tanstack/query-core"
				]
			},
			optimizeDeps: {
				include: [
					"react",
					"react-dom",
					"react-dom/client",
					"react/jsx-runtime",
					"react/jsx-dev-runtime"
				],
				ignoreOutdatedRequests: true
			},
			plugins: [...internalPlugins, ...options.plugins ?? []]
		};
		if (options.vite) config = mergeConfig(config, options.vite);
		if (command === "serve" && isSandbox && bundledDevRequested()) {
			const viteVersion = await resolveInstalledViteVersion();
			if (viteVersionSupportsBundledDev(viteVersion)) config = mergeConfig(config, {
				experimental: { bundledDev: true },
				plugins: [bundledDevCssUrlShim()]
			});
			else logWarning(`Bundled dev requested (${BUNDLED_DEV_ENV_VAR}) but the installed vite (${viteVersion ?? "unresolved"}) is outside the supported 8.1.x range — starting classic dev.`);
		}
		if (isSandbox) {
			validateConfig(config);
			config = cleanServerConfig(mergeConfig(config, { server: {
				host: "::",
				port: 8080,
				strictPort: true,
				watch: { ignored: [...TOOL_MANAGED_WATCH_IGNORES] },
				hmr: { overlay: false }
			} }));
		} else config = mergeConfig({ server: {
			host: "::",
			port: 8080
		} }, config);
		if (env.isPreview && prerenderEnabled && process.env[TSS_PRERENDERING_ENV] === "true") config = mergeConfig({ preview: {
			host: PRERENDER_PREVIEW_HOST,
			port: 0
		} }, config);
		if (isSandbox) return config;
		return applyWatchDebounceDefaults(config);
	};
}
//#endregion
export { defineConfig, lovableAssetsProxyPlugin, stripRedundantNodejsCompatFlag };
