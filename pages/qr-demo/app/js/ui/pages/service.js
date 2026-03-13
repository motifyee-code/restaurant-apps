import { mount, on, escapeHtml } from '../../core/dom.js';
import { formatRelativeTime } from '../../core/format.js';
import { SERVICE_TYPES } from '../../domain/order.js';

export function render(ctx) {
	const { view, store, actions, ui, router, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lang = s.prefs.lang;
	const labelOf = (x) => lang === 'en' ? (x.labelEn || x.label) : x.label;
	const requests = s.service.requests.slice().reverse();

	if (s.session.mode !== 'dine-in') {
		mount(
			view,
			`
				<div class="card fade-in">
					<div class="card-pad">
						<div style="font-weight:900; font-size:18px;">${t('service.title')}</div>
						<div style="color: var(--muted); margin-top:6px; line-height:1.7;">${t('service.onlyDineIn')}</div>
						<div style="margin-top: 14px; display:flex; gap: 10px;">
							<button class="btn btn-secondary btn-block" data-go="landing" type="button">${t('cart.changeMode')}</button>
							<button class="btn btn-primary btn-block" data-go="menu" type="button">${t('common.menu')}</button>
						</div>
					</div>
				</div>
			`,
		);
		const off = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		return () => off();
	}

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad">
						<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
							<div>
								<div style="font-weight:900; font-size:18px;">${t('service.title')}</div>
								<div style="color: var(--muted); margin-top: 4px;">${t('table')} ${s.session.table ?? '-'}</div>
							</div>
							<button class="btn btn-secondary" data-go="menu" type="button">${t('common.menu')}</button>
						</div>
						<div class="divider"></div>
							<div class="grid-2">
							${SERVICE_TYPES.map(st => `
								<button class="btn btn-secondary" data-service="${st.id}" type="button" style="border-radius: 24px; padding: 14px; text-align:start;">
									<div style="display:flex; gap: 10px; align-items:center; justify-content:space-between;">
										<div style="display:flex; gap: 10px; align-items:center;">
											<span style="font-size: 20px;">${st.icon}</span>
											<span style="font-weight: 900;">${escapeHtml(labelOf(st))}</span>
										</div>
										<span class="badge" style="opacity:.9">${st.needsNote ? t('service.note') : t('menu.add')}</span>
									</div>
								</button>
							`).join('')}
						</div>
					</div>
				</div>

				<div class="section-title">${t('service.yourRequests')}</div>
				${requests.length === 0 ? `
					<div class="card"><div class="card-pad" style="color: var(--muted); line-height: 1.7;">${t('service.none')}</div></div>
				` : `
					<div style="display:grid; gap: 10px;">
						${requests.map(r => renderReq(r, { labelOf, t })).join('')}
					</div>
				`}
			</div>
		`,
	);

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));

	const offService = on(view, 'click', '[data-service]', (_e, t) => {
		const typeId = t.dataset.service;
		const type = SERVICE_TYPES.find(x => x.id === typeId);
		if (!type) return;

		if (type.needsNote) {
			openNote({ type, actions, ui, t, labelOf });
			return;
		}

		actions.addServiceRequest({ typeId, note: '' });
		ui.toasts.show(`${t('menu.service')}: ${labelOf(type)}`, { type: 'success', ms: 1800 });
	});

	return () => {
		offGo();
		offService();
	};
}

function renderReq(r, { labelOf, t }) {
	const type = SERVICE_TYPES.find(t => t.id === r.typeId);
	const label = type ? labelOf(type) : r.typeId;
	const icon = type?.icon || '🔔';
	const badge = r.status === 'pending' ? `<span class="badge badge-warn">${t('order.soon')}</span>` : `<span class="badge badge-good">${t('order.done')}</span>`;
	return `
		<div class="card" style="border-radius: 26px;">
			<div class="card-pad" style="display:flex; gap: 12px; align-items:flex-start;">
				<div class="brand-badge" style="width:44px; height:44px; border-radius: 18px; box-shadow:none;">${icon}</div>
				<div style="flex:1;">
					<div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
						<div style="font-weight:900">${escapeHtml(label)}</div>
						${badge}
					</div>
					${r.note ? `<div style="color: var(--muted); margin-top: 4px; line-height: 1.7;">${escapeHtml(r.note)}</div>` : ''}
					<div style="color: var(--subtle); margin-top: 6px; font-size: 12px;">${formatRelativeTime(r.createdAt)}</div>
				</div>
			</div>
		</div>
	`;
}

function openNote({ type, actions, ui, t, labelOf }) {
	const bodyHtml = `
		<div class="field">
			<label class="label" for="note">${t('service.note')}</label>
			<textarea id="note" class="input" rows="4" style="resize:none" placeholder="..."></textarea>
		</div>
	`;
	const dlg = ui.openDialog({
		title: labelOf(type),
		bodyHtml,
		secondary: { label: t('common.cancel') },
		primary: {
			label: t('common.send'),
			onClick: ({ close }) => {
				const note = dlg.dialog.querySelector('#note')?.value?.trim();
				if (!note) {
					ui.toasts.show(t('service.writeFirst'), { type: 'warn' });
					return;
				}
				actions.addServiceRequest({ typeId: type.id, note });
				ui.toasts.show(t('service.sent'), { type: 'success', ms: 1600 });
				close('sent');
			},
		},
	});
	setTimeout(() => dlg.dialog.querySelector('#note')?.focus?.(), 0);
}
