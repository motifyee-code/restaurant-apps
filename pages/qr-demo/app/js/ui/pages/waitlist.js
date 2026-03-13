import { mount, on, qs } from '../../core/dom.js';
import { formatDurationMinutes, clamp } from '../../core/format.js';
import { joinWaitlistMock } from '../../services/mock.js';

export function render(ctx) {
	const { view, store, actions, router, ui, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lang = s.prefs.lang;

	if (s.session.mode !== 'waitlist') {
		actions.setMode('waitlist');
	}

	const info = store.getState().waitlist.info;

	if (!info) {
		let party = 2;
		let indoor = true;
		let outdoor = false;
		let booth = false;

		mount(
			view,
			`
				<div class="fade-in">
					<div class="card">
						<div class="card-pad">
							<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
								<div>
									<div style="font-weight:900; font-size:20px;">${t('wait.title')}</div>
									<div style="color: var(--muted); margin-top: 4px; line-height: 1.7;">${t('wait.desc')}</div>
								</div>
								<div class="brand-badge" style="width:54px; height:54px; border-radius: 22px; box-shadow:none;">⏰</div>
							</div>
							<div class="divider"></div>
							<div class="card" style="border-radius: 26px;">
								<div class="card-pad" style="display:flex; justify-content:space-between; gap: 12px;">
									<div>
										<div style="color: var(--muted); font-size: 12px;">${t('wait.eta')}</div>
										<div style="font-weight:900; font-size: 18px;">${lang === 'en' ? '15-20 min' : '15-20 دقيقة'}</div>
									</div>
									<div>
										<div style="color: var(--muted); font-size: 12px;">${t('wait.ahead')}</div>
										<div style="font-weight:900; font-size: 18px;">5</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div style="font-weight:900">${t('wait.party')}</div>
							<div id="party" class="qty" style="margin-top: 10px; justify-content:space-between; width: 200px;">
								<button type="button" data-party="-1">−</button>
								<span id="partyN">2</span>
								<button type="button" data-party="1">+</button>
							</div>
						</div>
					</div>

					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div style="font-weight:900">${t('wait.prefs')}</div>
							<div style="display:grid; gap: 10px; margin-top: 10px;">
								<label class="card" style="border-radius: 22px; padding: 12px; display:flex; align-items:center; justify-content:space-between; gap: 10px; cursor:pointer;">
									<span>${t('wait.indoor')}</span>
									<input type="checkbox" id="prefIndoor" checked style="accent-color: var(--primary2);" />
								</label>
								<label class="card" style="border-radius: 22px; padding: 12px; display:flex; align-items:center; justify-content:space-between; gap: 10px; cursor:pointer;">
									<span>${t('wait.outdoor')}</span>
									<input type="checkbox" id="prefOutdoor" style="accent-color: var(--primary2);" />
								</label>
								<label class="card" style="border-radius: 22px; padding: 12px; display:flex; align-items:center; justify-content:space-between; gap: 10px; cursor:pointer;">
									<span>${t('wait.booth')}</span>
									<input type="checkbox" id="prefBooth" style="accent-color: var(--primary2);" />
								</label>
							</div>
						</div>
					</div>

					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div class="field">
								<label class="label" for="phone">${t('wait.phone')}</label>
								<input id="phone" class="input" inputmode="tel" placeholder="05xxxxxxxx" />
							</div>
						</div>
					</div>

					<div style="margin-top: 12px; display:flex; gap: 10px;">
						<button class="btn btn-secondary btn-block" data-go="landing" type="button">${t('common.back')}</button>
						<button class="btn btn-primary btn-block" data-action="join" type="button">${t('wait.join')}</button>
					</div>
				</div>
			`,
		);

		const elPartyN = qs(view, '#partyN');
		const offParty = on(view, 'click', '[data-party]', (_e, t) => {
			party = clamp(party + Number(t.dataset.party || 0), 1, 20);
			elPartyN.textContent = String(party);
		});

		const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
		const offJoin = on(view, 'click', '[data-action="join"]', () => {
			indoor = Boolean(qs(view, '#prefIndoor')?.checked);
			outdoor = Boolean(qs(view, '#prefOutdoor')?.checked);
			booth = Boolean(qs(view, '#prefBooth')?.checked);
			const prefs = [];
			if (indoor) prefs.push('indoor');
			if (outdoor) prefs.push('outdoor');
			if (booth) prefs.push('booth');
			const phone = qs(view, '#phone')?.value?.trim() || '';
			const info = joinWaitlistMock({ partySize: party, preferences: prefs, phone });
			actions.setWaitlistInfo(info);
			ui.toasts.show(t('wait.joined'), { type: 'success', ms: 1800 });
		});

		return () => {
			offParty();
			offGo();
			offJoin();
		};
	}

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad" style="text-align:center;">
						<div class="brand-badge" style="width:64px; height:64px; border-radius: 24px; margin: 0 auto; box-shadow: var(--glow);">⏰</div>
						<div style="margin-top: 12px; font-weight: 900; font-size: 22px;">${t('wait.ticket')}</div>
						<div style="margin-top: 6px; font-weight: 900; font-size: 42px; letter-spacing: 2px;">${info.ticketNumber}</div>
						<div style="margin-top: 8px; color: var(--muted); line-height: 1.7;">
							${t('queue.ahead', { n: info.position, m: info.etaMinutes })}
						</div>
						<div style="margin-top: 10px; display:flex; gap: 8px; justify-content:center; flex-wrap: wrap;">
							<span class="badge">👥 ${info.partySize}</span>
							${(info.preferences || []).map(p => `<span class="badge">${prefLabel(p, t)}</span>`).join('')}
							${info.phone ? `<span class="badge">📱 ${info.phone}</span>` : ''}
						</div>
					</div>
				</div>

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad" style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
						<div>
							<div style="font-weight:900">${t('wait.browseWhile')}</div>
							<div style="color: var(--muted); margin-top: 4px; font-size: 13px;">${t('wait.browseDesc')}</div>
						</div>
						<button class="btn btn-primary" data-go="menu" type="button">${t('common.menu')}</button>
					</div>
				</div>

				<div style="margin-top: 12px; display:flex; gap: 10px;">
					<button class="btn btn-secondary btn-block" data-action="cancel" type="button">${t('wait.cancel')}</button>
					<button class="btn btn-ghost btn-block" data-go="landing" type="button">${t('nav.home')}</button>
				</div>
			</div>
		`,
	);

	const offGo = on(view, 'click', '[data-go]', (_e, t) => router.go(t.dataset.go));
	const offCancel = on(view, 'click', '[data-action="cancel"]', () => {
		ui.openDialog({
			title: t('wait.cancel.title'),
			bodyHtml: `<div style="color: var(--muted); line-height:1.7">${t('wait.cancel.desc')}</div>`,
			secondary: { label: t('common.back') },
			primary: {
				label: t('wait.cancel'),
				onClick: ({ close }) => {
					store.set({ waitlist: { info: null } });
					close('ok');
					ui.toasts.show(t('wait.cancel.toast'), { type: 'info', ms: 1600 });
				},
			},
		});
	});

	return () => {
		offGo();
		offCancel();
	};
}

function prefLabel(id, t) {
	switch (id) {
		case 'indoor':
			return t('wait.indoor');
		case 'outdoor':
			return t('wait.outdoor');
		case 'booth':
			return t('wait.booth');
		default:
			return String(id);
	}
}
