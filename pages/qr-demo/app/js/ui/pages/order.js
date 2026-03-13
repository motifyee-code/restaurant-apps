import { mount, on } from '../../core/dom.js';
import { formatMoney } from '../../core/format.js';
import { ORDER_STATUS } from '../../domain/order.js';

export function render(ctx) {
	const { view, store, router, ui, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const order = s.order.active;

	if (!order) {
		mount(
			view,
			`
				<div class="card fade-in">
					<div class="card-pad">
						<div style="font-weight:900; font-size:18px;">${t('order.none.title')}</div>
						<div style="color: var(--muted); margin-top:6px; line-height:1.7;">${t('order.none.desc')}</div>
						<div style="margin-top: 14px;">
							<button class="btn btn-primary" data-go="menu" type="button">${t('common.menu')}</button>
						</div>
					</div>
				</div>
			`,
		);
		const off = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		return () => off();
	}

	const steps = [
		{ id: ORDER_STATUS.PENDING, label: t('order.step.pending'), icon: '📝' },
		{ id: ORDER_STATUS.CONFIRMED, label: t('order.step.confirmed'), icon: '✓' },
		{ id: ORDER_STATUS.PREPARING, label: t('order.step.preparing'), icon: '👨‍🍳' },
		{ id: ORDER_STATUS.READY, label: t('order.step.ready'), icon: '🔔' },
		{ id: ORDER_STATUS.DELIVERED, label: t('order.step.delivered'), icon: '✅' },
	];
	const idx = steps.findIndex(s => s.id === order.status);

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad">
						<div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px;">
							<div>
								<div style="font-weight:900; font-size:20px;">${t('order.title')}</div>
								<div style="color: var(--muted); margin-top: 4px;">#${String(order.id).slice(-6).toUpperCase()}</div>
							</div>
							<span class="badge">${statusTitle(order.status, t)}</span>
						</div>
						<div class="divider"></div>
						<div class="timeline">
							${steps.map((st, i) => `
								<div class="step ${i < idx ? 'done' : ''} ${i === idx ? 'now' : ''}">
									<div class="dot">${i < idx ? '✓' : st.icon}</div>
									<div>
										<div style="font-weight:900">${st.label}</div>
										<div style="color: var(--muted); font-size: 12px; margin-top: 2px;">
											${i === idx ? t('order.now') : i < idx ? t('order.done') : t('order.soon')}
										</div>
									</div>
								</div>
							`).join('')}
						</div>
					</div>
				</div>

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad">
						<div style="font-weight:900">${t('order.details')}</div>
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
						${order.notes ? `<div style="margin-top: 10px; color: var(--muted); line-height: 1.7;"><span class="badge">${t('common.notes')}</span> ${order.notes}</div>` : ''}
					</div>
				</div>

				<div style="margin-top: 12px; display:grid; gap: 10px;">
					${s.session.mode === 'dine-in' ? `<button class="btn btn-secondary btn-block" data-go="service" type="button">🔔 ${t('menu.service')}</button>` : ''}
					${order.status === ORDER_STATUS.READY || order.status === ORDER_STATUS.DELIVERED ? `<button class="btn btn-primary btn-block" data-action="new" type="button">${t('order.new')}</button>` : ''}
					${order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED ? `<button class="btn btn-danger btn-block" data-action="cancel" type="button">${t('order.cancel')}</button>` : ''}
				</div>
			</div>
		`,
	);

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
	const offNew = on(view, 'click', '[data-action="new"]', () => {
		store.set({ order: { active: null } });
		router.go('menu');
	});
	const offCancel = on(view, 'click', '[data-action="cancel"]', () => {
		ui.openDialog({
			title: t('order.cancel.title'),
			bodyHtml: `<div style="color: var(--muted); line-height:1.7">${t('order.cancel.desc')}</div>`,
			secondary: { label: t('common.back') },
			primary: {
				label: t('order.cancel'),
				onClick: ({ close }) => {
					store.set({ order: { active: null } });
					close('ok');
					router.go('menu');
				},
			},
		});
	});

	return () => {
		offGo();
		offNew();
		offCancel();
	};
}

function statusTitle(status, t) {
	switch (status) {
		case ORDER_STATUS.PENDING:
			return t('order.status.pending');
		case ORDER_STATUS.CONFIRMED:
			return t('order.status.confirmed');
		case ORDER_STATUS.PREPARING:
			return t('order.status.preparing');
		case ORDER_STATUS.READY:
			return t('order.status.ready');
		case ORDER_STATUS.DELIVERED:
			return t('order.status.delivered');
		case ORDER_STATUS.CANCELLED:
			return t('order.cancel');
		default:
			return t('order.title');
	}
}
