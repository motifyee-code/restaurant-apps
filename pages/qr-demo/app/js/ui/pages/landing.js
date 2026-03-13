import { mount, on } from '../../core/dom.js';
import { AVAILABLE_TABLES } from '../../domain/config.js';

export function render(ctx) {
	const { view, store, actions, router, ui, i18n } = ctx;
	const { t } = i18n;

	mount(
		view,
		`
			<div class="hero fade-in">
				<div class="hero-card">
					<div class="badge" style="display:inline-flex; position:relative; z-index:1;">${t('landing.badge')}</div>
					<h1 class="hero-title" style="position:relative; z-index:1;">${t('landing.title')}</h1>
					<p class="hero-sub" style="position:relative; z-index:1;">
						${t('landing.subtitle')}
					</p>
					<div class="mode-cards" style="position:relative; z-index:1;">
						<button class="mode" data-mode="dine-in" type="button">
							<div class="mode-icn">🍽️</div>
							<p class="mode-title">${t('landing.dinein.title')}</p>
							<p class="mode-desc">${t('landing.dinein.desc')}</p>
						</button>
						<button class="mode" data-mode="queue" type="button">
							<div class="mode-icn">🎫</div>
							<p class="mode-title">${t('landing.queue.title')}</p>
							<p class="mode-desc">${t('landing.queue.desc')}</p>
						</button>
						<button class="mode" data-mode="waitlist" type="button">
							<div class="mode-icn">⏰</div>
							<p class="mode-title">${t('landing.waitlist.title')}</p>
							<p class="mode-desc">${t('landing.waitlist.desc')}</p>
						</button>
					</div>
				</div>
			</div>

			<div class="card fade-in" style="margin-top: 14px;">
				<div class="card-pad">
					<div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
						<div>
							<div style="font-weight:900">${t('landing.demo.title')}</div>
							<div style="color: var(--muted); font-size: 13px; margin-top: 4px;">${t('landing.demo.desc')} <span class="badge" style="margin-inline-start:8px">?mode=dine-in&table=3</span></div>
						</div>
						<button class="btn btn-secondary" data-action="reset" type="button">${t('common.reset')}</button>
					</div>
				</div>
			</div>
		`,
	);

	const off = on(view, 'click', '[data-mode]', (_e, el) => {
		const mode = el.dataset.mode;
		if (mode === 'dine-in') return openTablePicker({ store, actions, router, ui, t });
		if (mode === 'queue') {
			actions.setMode('queue');
			router.go('queue');
		}
		if (mode === 'waitlist') {
			actions.setMode('waitlist');
			router.go('waitlist');
		}
	});

	const off2 = on(view, 'click', '[data-action="reset"]', () => {
		ui.openDialog({
			title: t('landing.reset.title'),
			bodyHtml: `<div style="color: var(--muted); line-height:1.7">${t('landing.reset.desc')}</div>`,
			secondary: { label: t('common.cancel') },
			primary: {
				label: t('common.reset'),
				onClick: ({ close }) => {
					actions.resetAll();
					close('done');
					router.go('landing', { replace: true });
				},
			},
		});
	});

	return () => {
		off();
		off2();
	};
}

function openTablePicker({ actions, router, ui, t }) {
	const bodyHtml = `
		<div style="color: var(--muted); font-size: 13px; line-height: 1.7; margin-bottom: 12px;">${t('landing.table.desc')}</div>
		<div class="grid-2">
			${AVAILABLE_TABLES.map(n => `
				<button class="btn btn-secondary" data-table="${n}" type="button" style="border-radius: 20px; padding: 14px;">
					<strong style="font-size: 18px;">${n}</strong>
				</button>
			`).join('')}
		</div>
	`;

	const dlg = ui.openDialog({
		title: t('landing.table.pick'),
		bodyHtml,
	});

	const handler = (e) => {
		const btn = e.target?.closest?.('[data-table]');
		if (!btn) return;
		const table = Number(btn.dataset.table);
		actions.setMode('dine-in', table);
		dlg.close('picked');
		router.go('menu');
	};
	dlg.overlay.addEventListener('click', handler);

	return () => {
		dlg.overlay.removeEventListener('click', handler);
	};
}
