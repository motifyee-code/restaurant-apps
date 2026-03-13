import { createStore } from './core/store.js';
import { createRouter } from './core/router.js';
import { getQuery, formatMoney, clamp } from './core/format.js';
import { on, mount } from './core/dom.js';
import { applyLanguage, createT } from './core/i18n.js';

import { renderShell } from './ui/shell/shell.js';
import { createToasts } from './ui/components/toast.js';
import { openDialog } from './ui/components/modal.js';

import { RESTAURANT, APP_SETTINGS } from './domain/config.js';
import { MENU_CATEGORIES, MENU_ITEMS, MODIFIER_GROUPS, CATALOG } from './domain/catalog.js';
import { ORDER_STATUS } from './domain/order.js';
import { addToCart, setQty, removeLine, countItems, calcTotals } from './domain/cart.js';
import { submitOrderMock, simulateKitchen, simulateQueue } from './services/mock.js';

const PERSIST_KEY = 'qr-demo.v2';

const initialState = {
	prefs: { lang: 'ar', theme: 'dark' }, // lang: ar|en, theme: dark|light
	session: { mode: null, table: null },
	cart: { lines: [] },
	order: { active: null },
	queue: { number: null, position: null, etaMinutes: null, ready: false },
	waitlist: { info: null },
	service: { requests: [] },
	ui: { busy: false },
};

export function boot() {
	const root = document.getElementById('app');
	if (!root) throw new Error('#app not found');
	document.title = `${RESTAURANT.name} | QR Demo`;

	const shell = renderShell(root);
	const toasts = createToasts(document.body);

	const store = createStore({
		initialState,
		persistKey: PERSIST_KEY,
		persistPick: (s) => ({
			prefs: s.prefs,
			session: s.session,
			cart: s.cart,
			order: s.order,
			queue: s.queue,
			waitlist: s.waitlist,
			service: s.service,
		}),
	});

	let cancelSim = null;
	let currentCtx = null;
	let currentMod = null;
	let routeCleanup = null;
	let isRouting = false;
	let rerenderScheduled = false;

	const t = createT(() => store.getState().prefs.lang);

	applyPrefs(store.getState().prefs, t);

	const actions = {
		setLang(lang) {
			const safe = lang === 'en' ? 'en' : 'ar';
			store.set({ prefs: { ...store.getState().prefs, lang: safe } });
			applyPrefs(store.getState().prefs, t);
		},
		toggleLang() {
			const next = store.getState().prefs.lang === 'en' ? 'ar' : 'en';
			actions.setLang(next);
		},
		setTheme(theme) {
			const safe = theme === 'light' ? 'light' : 'dark';
			store.set({ prefs: { ...store.getState().prefs, theme: safe } });
			applyPrefs(store.getState().prefs, t);
		},
		toggleTheme() {
			const next = store.getState().prefs.theme === 'light' ? 'dark' : 'light';
			actions.setTheme(next);
		},
		setMode(mode, table = null) {
			store.set({
				session: { mode, table },
				queue: { number: null, position: null, etaMinutes: null, ready: false },
				waitlist: { info: null },
			});
		},
		addToCart(item, qty, modifiers) {
			const lang = store.getState().prefs.lang;
			const display = lang === 'en' ? (item.nameEn || item.name) : item.name;
			const itemForCart = { ...item, name: display };
			store.update(s => ({
				cart: { ...s.cart, lines: addToCart(s.cart.lines, { item: itemForCart, qty, modifiers }) },
			}));
			toasts.show(t('t.toast.added'), { type: 'success', ms: 1600 });
		},
		setLineQty(lineId, qty) {
			store.update(s => ({ cart: { ...s.cart, lines: setQty(s.cart.lines, lineId, qty) } }));
		},
		removeLine(lineId) {
			store.update(s => ({ cart: { ...s.cart, lines: removeLine(s.cart.lines, lineId) } }));
		},
		clearCart() {
			store.set({ cart: { lines: [] } });
		},
		async submitOrder({ paymentMethod, tip, notes, split }) {
			const s = store.getState();
			const lines = s.cart.lines;
			if (lines.length === 0) {
				toasts.show(t('t.toast.emptyCart'), { type: 'warn' });
				return null;
			}
			const { subtotal } = calcTotals(lines);
			const tax = Math.round(subtotal * RESTAURANT.taxRate);
			const total = subtotal + tax + (tip || 0);

			if (total < APP_SETTINGS.minOrderAmount) {
				toasts.show(t('t.toast.minOrder', { amount: formatMoney(APP_SETTINGS.minOrderAmount) }), { type: 'warn' });
				return null;
			}

			store.set({ ui: { busy: true } });
			try {
				const draft = {
					lines,
					subtotal,
					tax,
					tip: tip || 0,
					total,
					paymentMethod,
					notes: notes || '',
					table: s.session.mode === 'dine-in' ? s.session.table : null,
					split: split || null,
				};
				const res = await submitOrderMock({ mode: s.session.mode, orderDraft: draft });

				cancelSim?.();
				cancelSim = null;

				store.set({
					ui: { busy: false },
					cart: { lines: [] },
					order: { active: res.order },
				});

				if (res.type === 'queue') {
					store.set({ queue: { ...res.queue, ready: false } });
					cancelSim = simulateQueue({
						initialPosition: res.queue.position,
						onUpdate: (pos) => {
							store.set({ queue: { ...store.getState().queue, position: pos, etaMinutes: pos * 5 } });
							toasts.show(t('t.toast.queue.left', { n: pos }), { type: 'info', ms: 1800 });
						},
						onReady: () => {
							store.set({ queue: { ...store.getState().queue, ready: true, position: 0, etaMinutes: 0 } });
							store.set({ order: { active: { ...store.getState().order.active, status: ORDER_STATUS.READY } } });
							toasts.show(t('t.toast.queue.ready'), { type: 'success' });
						},
					});
					router.go('queue');
				} else {
					cancelSim = simulateKitchen({
						onStatus: (status, msg) => {
							store.set({ order: { active: { ...store.getState().order.active, status } } });
							toasts.show(msg, { type: 'info', ms: 1800 });
						},
					});
					router.go('order');
				}

				return res.order;
			} catch (e) {
				console.error(e);
				store.set({ ui: { busy: false } });
				toasts.show(t('t.toast.submitErr'), { type: 'error' });
				return null;
			}
		},
		resetAll() {
			cancelSim?.();
			cancelSim = null;
			store.set(structuredClone(initialState));
		},
		addServiceRequest({ typeId, note }) {
			const req = {
				id: Date.now().toString(),
				typeId,
				note: note || '',
				status: 'pending',
				createdAt: new Date().toISOString(),
			};
			store.update(s => ({ service: { ...s.service, requests: [...s.service.requests, req] } }));
			return req;
		},
		setWaitlistInfo(info) {
			store.set({ waitlist: { info } });
		},
	};

	const router = createRouter({
		routes: {
			landing: () => import('./ui/pages/landing.js'),
			menu: () => import('./ui/pages/menu.js'),
			cart: () => import('./ui/pages/cart.js'),
			checkout: () => import('./ui/pages/checkout.js'),
			order: () => import('./ui/pages/order.js'),
			service: () => import('./ui/pages/service.js'),
			queue: () => import('./ui/pages/queue.js'),
			waitlist: () => import('./ui/pages/waitlist.js'),
		},
		notFound: 'landing',
		onRoute: async (key, mod) => {
			isRouting = true;
			try {
				routeCleanup?.();
				routeCleanup = null;

				renderAppbar();
				renderCartbar();

				const ctx = {
					key,
					view: shell.view,
					appbar: shell.appbar,
					cartbar: shell.cartbar,
					store,
					actions,
					router,
					ui: { toasts, openDialog },
					data: { MENU_CATEGORIES, MENU_ITEMS, MODIFIER_GROUPS, CATALOG },
					utils: { formatMoney, clamp },
					i18n: { t },
				};

				currentCtx = ctx;
				currentMod = mod;
				routeCleanup = (await mod.render?.(ctx)) || null;
			} finally {
				isRouting = false;
			}
		},
	});

	function renderAppbar() {
		const s = store.getState();
		const lang = s.prefs.lang;
		const theme = s.prefs.theme;
		const mode = s.session.mode;
		const table = s.session.table;
		const cartCount = countItems(s.cart.lines);

		mount(
			shell.appbar,
			`
				<div class="brand">
					<div class="brand-badge">${RESTAURANT.logo}</div>
					<div>
						<div style="font-size:14px; font-weight:900">${RESTAURANT.name}</div>
						<div style="font-size:12px; color: var(--muted); margin-top:2px;">
							${mode === 'dine-in' && table ? `${t('table')} ${table}` : mode === 'queue' ? t('mode.queue') : mode === 'waitlist' ? t('mode.waitlist') : t('mode.pick')}
						</div>
					</div>
				</div>
				<div class="appbar-actions">
					<button class="icon-btn" data-action="theme" aria-label="${t('nav.theme')}">${theme === 'light' ? '☀' : '☾'}</button>
					<button class="icon-btn" data-action="lang" aria-label="Language">${lang === 'en' ? 'EN' : 'AR'}</button>
					<button class="icon-btn" data-nav="landing" aria-label="${t('nav.home')}">⌂</button>
					<button class="icon-btn" data-nav="cart" aria-label="${t('nav.cart')}">
						🛒
						${cartCount > 0 ? `<span class="sr-only">${t('items.count', { n: cartCount })}</span>` : ''}
					</button>
				</div>
			`,
		);
	}

	let appbarCleanup = null;
	function wireAppbar() {
		appbarCleanup?.();
		appbarCleanup = null;
		const off1 = on(shell.appbar, 'click', '[data-nav]', (_e, t) => router.go(t.dataset.nav));
		const off2 = on(shell.appbar, 'click', '[data-action="lang"]', () => actions.toggleLang());
		const off3 = on(shell.appbar, 'click', '[data-action="theme"]', () => actions.toggleTheme());
		appbarCleanup = () => {
			off1();
			off2();
			off3();
		};
	}

	function renderCartbar() {
		const s = store.getState();
		const lines = s.cart.lines;
		const c = countItems(lines);
		if (c <= 0) {
			shell.cartbar.style.display = 'none';
			shell.cartbar.innerHTML = '';
			return;
		}
		const { subtotal } = calcTotals(lines);
		shell.cartbar.style.display = 'block';
		mount(
			shell.cartbar,
			`
				<div class="container cartbar-inner">
					<div style="display:grid; gap:2px">
						<div style="font-weight:900">${formatMoney(subtotal)}</div>
						<div style="font-size:12px; color: var(--muted)">${t('items.count', { n: c })}</div>
					</div>
					<button class="btn btn-primary" data-go="cart">${t('nav.cart')}</button>
				</div>
			`,
		);
	}

	let cartbarCleanup = null;
	function wireCartbar() {
		cartbarCleanup?.();
		cartbarCleanup = null;
		const off = on(shell.cartbar, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		cartbarCleanup = () => off();
	}

	// Render chrome on every state change.
	store.subscribe((next, prev) => {
		if (next?.prefs && (next.prefs.lang !== prev?.prefs?.lang || next.prefs.theme !== prev?.prefs?.theme)) {
			applyPrefs(next.prefs, t);
		}
		renderAppbar();
		wireAppbar();
		renderCartbar();
		wireCartbar();

		// Re-render current route view on state changes (batched).
		if (isRouting) return;
		if (!currentCtx || !currentMod?.render) return;
		if (rerenderScheduled) return;
		rerenderScheduled = true;
		requestAnimationFrame(async () => {
			rerenderScheduled = false;
			if (isRouting) return;
			try {
				routeCleanup?.();
			} catch {}
			routeCleanup = (await currentMod.render(currentCtx)) || null;
		});
	});

	renderAppbar();
	wireAppbar();
	renderCartbar();
	wireCartbar();

	applyQuerySession(store, actions);
	ensureInitialRoute(store);
	router.start();
}

function applyPrefs(prefs, t) {
	const lang = applyLanguage(prefs?.lang);
	document.documentElement.dataset.theme = prefs?.theme === 'light' ? 'light' : 'dark';
	// Update title with current language direction applied.
	document.title = `${RESTAURANT.name} | QR Demo`;
	// Ensure numeric spacing is stable between RTL/LTR.
	document.documentElement.style.direction = lang === 'en' ? 'ltr' : 'rtl';
}

function applyQuerySession(store, actions) {
	const q = getQuery();
	const mode = q.mode;
	const table = q.table ? Number(q.table) : null;
	const lang = q.lang;
	const theme = q.theme;
	if (lang) actions.setLang(lang);
	if (theme) actions.setTheme(theme);
	if (!mode) return;
	if (mode === 'dine-in') actions.setMode('dine-in', Number.isFinite(table) ? table : null);
	if (mode === 'queue') actions.setMode('queue');
	if (mode === 'waitlist') actions.setMode('waitlist');
	// On QR open we want to land in the relevant flow even if hash is empty.
	if (!window.location.hash) {
		if (mode === 'queue') window.location.hash = '#/queue';
		else if (mode === 'waitlist') window.location.hash = '#/waitlist';
		else window.location.hash = '#/menu';
	}
}

function ensureInitialRoute(store) {
	if (window.location.hash) return;
	const s = store.getState();
	if (s.session.mode === 'queue') window.location.hash = '#/queue';
	else if (s.session.mode === 'waitlist') window.location.hash = '#/waitlist';
	else window.location.hash = '#/landing';
}
