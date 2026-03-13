import { escapeHtml, mount, on, qs } from '../../core/dom.js';
import { formatMoney, clamp } from '../../core/format.js';

export function render(ctx) {
	const { view, store, actions, router, ui, data, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lang = s.prefs.lang;

	const nameOf = (x) => lang === 'en' ? (x.nameEn || x.name) : x.name;
	const descOf = (x) => lang === 'en' ? (x.descriptionEn || x.description || '') : (x.description || '');

	if (!s.session.mode) {
		mount(
			view,
			`
				<div class="card fade-in">
					<div class="card-pad">
						<div style="font-weight:900; font-size:18px;">${t('menu.start.mode.title')}</div>
						<div style="color: var(--muted); margin-top:6px; line-height:1.7;">
							${t('menu.start.mode.desc')}
						</div>
						<div style="margin-top: 14px; display:flex; gap: 10px; flex-wrap: wrap;">
							<button class="btn btn-primary" data-go="landing" type="button">${t('menu.start.mode.pick')}</button>
							<button class="btn btn-secondary" data-go="queue" type="button">${t('menu.start.mode.tryqueue')}</button>
						</div>
					</div>
				</div>
			`,
		);
		const off = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		return () => off();
	}

	let selectedCat = 'all';
	let query = '';

	mount(
		view,
		`
			<div class="topline fade-in">
				<div class="kpi">
					<span class="badge">${s.session.mode === 'dine-in' ? t('mode.dinein') : s.session.mode === 'queue' ? t('mode.queue') : t('mode.waitlist')}</span>
					${s.session.mode === 'dine-in' && s.session.table ? `<span>•</span><span><strong>${t('table')}</strong> ${s.session.table}</span>` : ''}
				</div>
				<div style="display:flex; gap: 10px;">
					${s.session.mode === 'dine-in' ? `<button class="btn btn-secondary" data-go="service" type="button">🔔 ${t('menu.service')}</button>` : ''}
				</div>
			</div>

			<div class="card fade-in">
				<div class="card-pad">
					<div class="field">
						<label class="label" for="q">${t('menu.search.label')}</label>
						<input id="q" class="input" placeholder="${t('menu.search.ph')}" autocomplete="off" />
					</div>
					<div class="divider"></div>
					<div class="chips" id="cats" aria-label="${t('menu.cats')}">
						<button class="chip" aria-pressed="true" data-cat="all" type="button">🍽️ ${t('menu.cats.all')}</button>
						${data.MENU_CATEGORIES.map(c => `<button class="chip" aria-pressed="false" data-cat="${c.id}" type="button">${c.icon} ${escapeHtml(nameOf(c))}</button>`).join('')}
					</div>
				</div>
			</div>

			<div class="section-title">${t('menu.items')}</div>
			<div id="list" class="fade-in"></div>
		`,
	);

	const listEl = qs(view, '#list');
	const input = qs(view, '#q');

	const renderList = () => {
		const items = data.MENU_ITEMS
			.filter(i => i.available)
			.filter(i => selectedCat === 'all' ? true : i.categoryId === selectedCat)
			.filter(i => {
				if (!query) return true;
				const q = query.toLowerCase();
				return i.name.toLowerCase().includes(q) || (i.nameEn || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q);
			});

		if (items.length === 0) {
			mount(
				listEl,
				`<div class="card"><div class="card-pad" style="color: var(--muted); line-height:1.7">${t('menu.noresults')}</div></div>`,
			);
			return;
		}

		mount(
			listEl,
			items.map(item => `
				<div class="item" data-open="${item.id}" role="button" tabindex="0">
					<div class="thumb">
						${item.image ? `<img src="${item.image}" alt="${escapeHtml(nameOf(item))}" loading="lazy" />` : `<div style="font-size: 28px;">${item.emoji || '🍽️'}</div>`}
					</div>
					<div>
						<div class="item-title">${escapeHtml(nameOf(item))}</div>
						<div class="item-desc">${escapeHtml(descOf(item))}</div>
						<div class="item-foot">
							<div class="price">${formatMoney(item.price)}</div>
							<button class="mini-add" data-add="${item.id}" type="button" aria-label="${t('menu.add')}">+</button>
						</div>
					</div>
				</div>
			`).join(''),
		);
	};

	renderList();

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));

	const offCats = on(view, 'click', '[data-cat]', (_e, t) => {
		selectedCat = t.dataset.cat;
		view.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b === t ? 'true' : 'false'));
		renderList();
	});

	const onInput = () => {
		query = input.value.trim();
		renderList();
	};
	input.addEventListener('input', onInput);

	const offAdd = on(view, 'click', '[data-add]', (_e, t) => {
		const item = data.CATALOG.byId.get(t.dataset.add);
		if (!item) return;
		actions.addToCart(item, 1, []);
	});

	const openItem = (itemId) => {
		const item = data.CATALOG.byId.get(itemId);
		if (!item) return;
		openItemDialog({ item, actions, ui, data, t, lang, nameOf, descOf });
	};

	const offOpen = on(view, 'click', '[data-open]', (_e, t) => openItem(t.dataset.open));
	const onKey = (e) => {
		if (e.key !== 'Enter') return;
		const card = e.target?.closest?.('[data-open]');
		if (card) openItem(card.dataset.open);
	};
	view.addEventListener('keydown', onKey);

	return () => {
		offGo();
		offCats();
		offAdd();
		offOpen();
		input.removeEventListener('input', onInput);
		view.removeEventListener('keydown', onKey);
	};
}

function openItemDialog({ item, actions, ui, data, t, lang, nameOf, descOf }) {
	let qty = 1;
	const selected = new Map(); // groupId -> Set(optionId) or single optionId

	const groups = (item.modifiers || [])
		.map(id => data.MODIFIER_GROUPS[id])
		.filter(Boolean);

	const groupNameOf = (g) => lang === 'en' ? (g.nameEn || g.name) : g.name;
	const optNameOf = (o) => lang === 'en' ? (o.nameEn || o.name) : o.name;

	const renderMods = () => {
		if (groups.length === 0) return '';
		return groups
			.map(g => {
				const isSingle = g.type === 'single';
				const current = selected.get(g.id);
				return `
					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
								<div style="font-weight:900">${escapeHtml(groupNameOf(g))}</div>
								${g.required ? `<span class="badge badge-warn">${t('common.required')}</span>` : `<span class="badge">${t('common.optional')}</span>`}
							</div>
							<div class="chips" style="margin-top: 10px;">
								${g.options.map(o => {
									const pressed = isSingle
										? (current === o.id)
										: (current instanceof Set ? current.has(o.id) : false);
									return `
										<button class="chip" type="button" aria-pressed="${pressed ? 'true' : 'false'}" data-mod="${g.id}:${o.id}">
											${escapeHtml(optNameOf(o))}${o.price ? ` <span style="opacity:.75">(+${formatMoney(o.price)})</span>` : ''}
										</button>
									`;
								}).join('')}
							</div>
						</div>
					</div>
				`;
			})
			.join('');
	};

	const computeSelectedMods = () => {
		const out = [];
		for (const g of groups) {
			const v = selected.get(g.id);
			if (!v) continue;
			if (g.type === 'single') {
				const opt = g.options.find(o => o.id === v);
				if (opt) out.push({ groupId: g.id, optionId: opt.id, name: optNameOf(opt), price: opt.price });
			} else {
				for (const optId of v) {
					const opt = g.options.find(o => o.id === optId);
					if (opt) out.push({ groupId: g.id, optionId: opt.id, name: optNameOf(opt), price: opt.price });
				}
			}
		}
		return out;
	};

	const bodyHtml = `
		<div style="display:grid; gap: 10px;">
			<div style="display:flex; gap: 12px; align-items:flex-start;">
				<div class="thumb" style="width: 92px; height: 92px;">
					${item.image ? `<img src="${item.image}" alt="${escapeHtml(nameOf(item))}" />` : `<div style="font-size: 36px;">${item.emoji || '🍽️'}</div>`}
				</div>
				<div style="flex:1;">
					<div style="font-weight: 900; font-size: 18px;">${escapeHtml(nameOf(item))}</div>
					<div style="color: var(--muted); margin-top: 4px; line-height: 1.7; font-size: 13px;">${escapeHtml(descOf(item))}</div>
					<div style="margin-top: 8px; display:flex; gap: 8px; flex-wrap: wrap;">
						${item.popular ? `<span class="badge badge-warn">${t('flags.popular')}</span>` : ''}
						${item.vegetarian ? `<span class="badge badge-good">${t('flags.veg')}</span>` : ''}
						${item.spicy ? `<span class="badge badge-bad">${t('flags.spicy')}</span>` : ''}
					</div>
				</div>
			</div>

			<div class="card">
				<div class="card-pad" style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
					<div>
						<div style="color: var(--muted); font-size: 12px;">${t('menu.item.price')}</div>
						<div style="font-weight: 900; font-size: 18px;">${formatMoney(item.price)}</div>
					</div>
					<div class="qty" aria-label="${t('menu.item.qty')}">
						<button type="button" data-qty="-1">−</button>
						<span data-qty-value="1">1</span>
						<button type="button" data-qty="1">+</button>
					</div>
				</div>
			</div>
			<div id="mods">${renderMods()}</div>
		</div>
	`;

	const dlg = ui.openDialog({
		title: t('menu.item.details'),
		bodyHtml,
		secondary: { label: t('common.cancel') },
		primary: {
			label: t('menu.item.add'),
			onClick: ({ close }) => {
				const picked = computeSelectedMods();
				// validate required singles
				for (const g of groups) {
					if (g.required && g.type === 'single' && !selected.get(g.id)) {
						ui.toasts.show(t('menu.pick', { name: groupNameOf(g) }), { type: 'warn' });
						return;
					}
				}
				actions.addToCart(item, qty, picked);
				close('added');
			},
		},
	});

	const valueEl = dlg.dialog.querySelector('[data-qty-value]');
	const updateQty = (delta) => {
		qty = clamp(qty + delta, 1, 99);
		if (valueEl) valueEl.textContent = String(qty);
	};

	const clickHandler = (e) => {
		const qBtn = e.target?.closest?.('[data-qty]');
		if (qBtn) {
			updateQty(Number(qBtn.dataset.qty || 0));
			return;
		}
		const mBtn = e.target?.closest?.('[data-mod]');
		if (!mBtn) return;
		const [groupId, optId] = String(mBtn.dataset.mod).split(':');
		const g = groups.find(x => x.id === groupId);
		if (!g) return;

		if (g.type === 'single') {
			selected.set(groupId, optId);
		} else {
			let set = selected.get(groupId);
			if (!(set instanceof Set)) set = new Set();
			if (set.has(optId)) set.delete(optId);
			else set.add(optId);
			if (set.size === 0) selected.delete(groupId);
			else selected.set(groupId, set);
		}
		// Re-render just the mods section for accurate pressed state.
		const modsEl = dlg.dialog.querySelector('#mods');
		if (modsEl) modsEl.innerHTML = renderMods();
	};

	dlg.dialog.addEventListener('click', clickHandler);
	const cleanup = () => dlg.dialog.removeEventListener('click', clickHandler);
	return cleanup;
}
