import { mount, on, escapeHtml } from '../../core/dom.js';
import { formatMoney } from '../../core/format.js';
import { countItems } from '../../domain/cart.js';
import { ORDER_STATUS } from '../../domain/order.js';

export function render(ctx) {
	const { view, store, actions, router, ui, data, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lang = s.prefs.lang;
	const nameOf = (x) => lang === 'en' ? (x.nameEn || x.name) : x.name;
	const descOf = (x) => lang === 'en' ? (x.descriptionEn || x.description || '') : (x.description || '');

	if (s.session.mode !== 'queue') {
		actions.setMode('queue');
	}

	const hasTicket = Boolean(s.queue.number);
	if (!hasTicket) {
		renderQueueIntro({ view, data, actions, router, ui, store, t, nameOf, descOf });
		return () => {};
	}

	const order = s.order.active;
	const position = s.queue.position ?? 0;
	const eta = s.queue.etaMinutes ?? 0;
	const ready = Boolean(s.queue.ready) || order?.status === ORDER_STATUS.READY;

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad" style="text-align:center;">
						<div class="brand-badge" style="width:64px; height:64px; border-radius: 24px; margin: 0 auto; box-shadow: var(--glow);">🎫</div>
						<div style="margin-top: 12px; font-weight: 900; font-size: 22px;">${t('queue.ticket')}</div>
						<div style="margin-top: 6px; font-weight: 900; font-size: 42px; letter-spacing: 2px;">${escapeHtml(s.queue.number)}</div>
						<div style="margin-top: 8px; color: var(--muted); line-height: 1.7;">
							${ready ? t('queue.readyNow') : t('queue.ahead', { n: position, m: eta })}
						</div>
					</div>
				</div>

				${order ? `
					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div style="display:flex; justify-content:space-between; align-items:baseline;">
								<div style="font-weight:900">${t('checkout.summary')}</div>
								<span class="badge">${order.paymentMethod === 'cash' ? t('queue.cash') : t('queue.paid')}</span>
							</div>
							<div style="margin-top: 10px; display:grid; gap: 8px;">
								${order.lines.map(l => `
									<div style="display:flex; justify-content:space-between; color: var(--muted);">
										<span>${l.qty} × ${l.name}</span>
										<span>${formatMoney(l.unitPrice * l.qty)}</span>
									</div>
								`).join('')}
							</div>
							<div class="divider"></div>
							<div style="display:flex; justify-content:space-between; align-items:baseline;">
								<span style="font-weight:900">${t('cart.total')}</span>
								<span style="font-weight:900; font-size: 20px;">${formatMoney(order.total)}</span>
							</div>
						</div>
					</div>
				` : ''}

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad" style="color: var(--muted); line-height: 1.8;">
						<strong style="color: var(--text);">${t('queue.instructions.title')}</strong><br />
						${t('queue.instructions.1')}<br />
						${t('queue.instructions.2')}<br />
						${t('queue.instructions.3')}
					</div>
				</div>

				<div style="margin-top: 12px; display:flex; gap: 10px;">
					<button class="btn btn-secondary btn-block" data-action="new" type="button">${t('queue.new')}</button>
					${ready ? `<button class="btn btn-primary btn-block" data-action="notify" type="button">${t('queue.notify')}</button>` : `<button class="btn btn-ghost btn-block" data-action="menu" type="button">${t('common.menu')}</button>`}
				</div>
			</div>
		`,
	);

	const offNew = on(view, 'click', '[data-action="new"]', () => {
		store.set({
			queue: { number: null, position: null, etaMinutes: null, ready: false },
			order: { active: null },
			cart: { lines: [] },
		});
		router.go('landing');
	});

	const offNotify = on(view, 'click', '[data-action="notify"]', () => ui.toasts.show(t('queue.notify.toast'), { type: 'success' }));
	const offMenu = on(view, 'click', '[data-action="menu"]', () => router.go('menu'));

	return () => {
		offNew();
		offNotify();
		offMenu();
	};
}

function renderQueueIntro({ view, data, actions, router, ui, store, t, nameOf, descOf }) {
	const popular = data.MENU_ITEMS.filter(i => i.popular && i.available).slice(0, 4);
	const count = countItems(store.getState().cart.lines);

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad">
						<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
							<div>
								<div style="font-weight:900; font-size:20px;">${t('queue.title')}</div>
								<div style="color: var(--muted); margin-top: 4px; line-height: 1.7;">${t('queue.desc')}</div>
							</div>
							<div class="brand-badge" style="width:54px; height:54px; border-radius: 22px; box-shadow:none;">🎫</div>
						</div>
						<div style="margin-top: 14px; display:flex; gap: 10px;">
							<button class="btn btn-primary btn-block" data-go="menu" type="button">${t('queue.start')}</button>
							<button class="btn btn-secondary btn-block" data-go="landing" type="button">${t('cart.changeMode')}</button>
						</div>
						${count > 0 ? `<div style="margin-top: 10px; color: var(--muted); font-size: 13px;">${t('items.count', { n: count })}</div>` : ''}
					</div>
				</div>

				<div class="section-title">${t('queue.popular')}</div>
				<div style="display:grid; gap: 10px;">
					${popular.map(item => `
						<div class="item" data-open="${item.id}">
							<div class="thumb">
								${item.image ? `<img src="${item.image}" alt="${escapeHtml(nameOf(item))}" loading="lazy" />` : `<div style="font-size: 28px;">${item.emoji || '🍽️'}</div>`}
							</div>
							<div>
								<div class="item-title">${escapeHtml(nameOf(item))}</div>
								<div class="item-desc">${escapeHtml(descOf(item))}</div>
								<div class="item-foot">
									<div class="price">${formatMoney(item.price)}</div>
									<button class="mini-add" data-add="${item.id}" type="button">+</button>
								</div>
							</div>
						</div>
					`).join('')}
				</div>
			</div>
		`,
	);

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
	const offAdd = on(view, 'click', '[data-add]', (_e, t) => {
		const item = data.CATALOG.byId.get(t.dataset.add);
		if (!item) return;
		actions.addToCart(item, 1, []);
	});
	const offOpen = on(view, 'click', '[data-open]', (_e, t) => router.go('menu'));

	return () => {
		offGo();
		offAdd();
		offOpen();
	};
}
