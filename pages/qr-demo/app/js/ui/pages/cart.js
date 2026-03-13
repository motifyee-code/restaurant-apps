import { mount, on, escapeHtml } from '../../core/dom.js';
import { formatMoney, clamp } from '../../core/format.js';
import { RESTAURANT, AVAILABLE_TABLES } from '../../domain/config.js';
import { calcTotals, countItems } from '../../domain/cart.js';

export function render(ctx) {
	const { view, store, actions, router, ui, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lines = s.cart.lines;

	if (lines.length === 0) {
		mount(
			view,
			`
				<div class="card fade-in">
					<div class="card-pad">
						<div style="font-weight: 900; font-size: 18px;">${t('cart.empty.title')}</div>
						<div style="color: var(--muted); margin-top:6px; line-height:1.7;">${t('cart.empty.desc')}</div>
						<div style="margin-top: 14px; display:flex; gap: 10px; flex-wrap: wrap;">
							<button class="btn btn-primary" data-go="menu" type="button">${t('cart.browse')}</button>
							<button class="btn btn-secondary" data-go="landing" type="button">${t('cart.changeMode')}</button>
						</div>
					</div>
				</div>
			`,
		);
		const off = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		return () => off();
	}

	const { subtotal } = calcTotals(lines);
	const tax = Math.round(subtotal * RESTAURANT.taxRate);
	const total = subtotal + tax;

	mount(
		view,
		`
			<div class="fade-in">
				<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
					<div>
						<div style="font-weight: 900; font-size: 20px;">${t('cart.title')}</div>
						<div style="color: var(--muted); margin-top: 4px; font-size: 13px;">${t('items.count', { n: countItems(lines) })}</div>
					</div>
					<button class="btn btn-ghost" data-action="clear" type="button">${t('common.clear')}</button>
				</div>

				<div style="display:grid; gap: 12px; margin-top: 14px;">
					${lines.map(line => renderLine(line)).join('')}
				</div>

				<div class="card" style="margin-top: 14px;">
					<div class="card-pad">
						<div style="display:flex; justify-content:space-between; color: var(--muted);">
							<span>${t('cart.subtotal')}</span>
							<span>${formatMoney(subtotal)}</span>
						</div>
						<div style="display:flex; justify-content:space-between; color: var(--muted); margin-top: 10px;">
							<span>${t('cart.tax', { pct: Math.round(RESTAURANT.taxRate * 100) })}</span>
							<span>${formatMoney(tax)}</span>
						</div>
						<div class="divider"></div>
						<div style="display:flex; justify-content:space-between; align-items:baseline;">
							<span style="font-weight: 900;">${t('cart.total')}</span>
							<span style="font-weight: 900; font-size: 20px;">${formatMoney(total)}</span>
						</div>
					</div>
				</div>

				${s.session.mode === 'dine-in' ? `
					<div class="card" style="margin-top: 14px;">
						<div class="card-pad" style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
							<div>
								<div style="color: var(--muted); font-size: 12px;">${t('cart.table.yours')}</div>
								<div style="font-weight:900">${t('table')} ${s.session.table ?? '-'}</div>
							</div>
							<button class="btn btn-secondary" data-action="table" type="button">${t('cart.table.change')}</button>
						</div>
					</div>
				` : ''}

				<div style="margin-top: 14px; display:flex; gap: 10px;">
					<button class="btn btn-secondary btn-block" data-go="menu" type="button">${t('cart.addMore')}</button>
					<button class="btn btn-primary btn-block" data-go="checkout" type="button">${t('cart.checkout')}</button>
				</div>
			</div>
		`,
	);

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));

	const offQty = on(view, 'click', '[data-qty]', (_e, t) => {
		const lineId = t.closest('[data-line]')?.dataset?.line;
		if (!lineId) return;
		const delta = Number(t.dataset.qty || 0);
		const line = store.getState().cart.lines.find(l => l.lineId === lineId);
		if (!line) return;
		const nextQty = clamp(line.qty + delta, 0, 99);
		actions.setLineQty(lineId, nextQty);
	});

	const offRemove = on(view, 'click', '[data-remove]', (_e, t) => {
		const lineId = t.closest('[data-line]')?.dataset?.line;
		if (!lineId) return;
		ui.openDialog({
			title: t('cart.remove.title'),
			bodyHtml: `<div style="color: var(--muted); line-height:1.7">${t('cart.remove.desc')}</div>`,
			secondary: { label: t('common.cancel') },
			primary: {
				label: t('common.remove'),
				onClick: ({ close }) => {
					actions.removeLine(lineId);
					close('rm');
				},
			},
		});
	});

	const offClear = on(view, 'click', '[data-action="clear"]', () => {
		ui.openDialog({
			title: t('cart.clear.title'),
			bodyHtml: `<div style="color: var(--muted); line-height:1.7">${t('cart.clear.desc')}</div>`,
			secondary: { label: t('common.cancel') },
			primary: {
				label: t('common.clear'),
				onClick: ({ close }) => {
					actions.clearCart();
					close('ok');
					router.go('menu');
				},
			},
		});
	});

	const offTable = on(view, 'click', '[data-action="table"]', () => openTablePicker({ store, actions, router, ui, t }));

	return () => {
		offGo();
		offQty();
		offRemove();
		offClear();
		offTable();
	};
}

function renderLine(line) {
	const mods = (line.modifiers || []).map(m => m.name).join(' • ');
	return `
		<div class="cart-line" data-line="${line.lineId}">
			<div class="thumb" style="width:76px; height:76px;">
				${line.image ? `<img src="${line.image}" alt="${escapeHtml(line.name)}" loading="lazy" />` : `<div style="font-size: 28px;">${line.emoji || '🍽️'}</div>`}
			</div>
			<div>
				<div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 10px;">
					<div>
						<div style="font-weight: 900;">${escapeHtml(line.name)}</div>
						${mods ? `<div style="color: var(--muted); font-size: 12px; margin-top: 4px; line-height: 1.6;">${escapeHtml(mods)}</div>` : ''}
					</div>
					<button class="icon-btn" data-remove="1" aria-label="حذف">🗑</button>
				</div>

				<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px; margin-top: 10px;">
					<div class="qty">
						<button type="button" data-qty="-1">−</button>
						<span>${line.qty}</span>
						<button type="button" data-qty="1">+</button>
					</div>
					<div style="text-align:left">
						<div style="color: var(--muted); font-size: 12px;">${formatMoney(line.unitPrice)} × ${line.qty}</div>
						<div style="font-weight: 900;">${formatMoney(line.unitPrice * line.qty)}</div>
					</div>
				</div>
			</div>
		</div>
	`;
}

function openTablePicker({ store, actions, router, ui, t }) {
	const s = store.getState();
	const current = s.session.table;
	const bodyHtml = `
		<div style="color: var(--muted); font-size: 13px; line-height: 1.7; margin-bottom: 12px;">${t('cart.table.change')}</div>
		<div class="grid-2">
			${AVAILABLE_TABLES.map(n => `
				<button class="btn ${n === current ? 'btn-primary' : 'btn-secondary'}" data-table="${n}" type="button" style="border-radius: 20px; padding: 14px;">
					<strong style="font-size: 18px;">${n}</strong>
				</button>
			`).join('')}
		</div>
	`;

	const dlg = ui.openDialog({ title: t('cart.table.change'), bodyHtml });
	const handler = (e) => {
		const btn = e.target?.closest?.('[data-table]');
		if (!btn) return;
		const table = Number(btn.dataset.table);
		actions.setMode('dine-in', table);
		dlg.close('picked');
	};
	dlg.overlay.addEventListener('click', handler);
	return () => dlg.overlay.removeEventListener('click', handler);
}
