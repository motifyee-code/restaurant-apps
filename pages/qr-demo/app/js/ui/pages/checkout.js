import { mount, on, qs } from '../../core/dom.js';
import { formatMoney, clamp } from '../../core/format.js';
import { RESTAURANT, APP_SETTINGS } from '../../domain/config.js';
import { PAYMENT_METHODS } from '../../domain/order.js';
import { calcTotals } from '../../domain/cart.js';

export function render(ctx) {
	const { view, store, actions, router, i18n } = ctx;
	const { t } = i18n;
	const s = store.getState();
	const lang = s.prefs.lang;
	const lines = s.cart.lines;

	if (lines.length === 0) {
		mount(
			view,
			`
				<div class="card fade-in">
					<div class="card-pad">
						<div style="font-weight:900; font-size:18px;">${t('checkout.nothing.title')}</div>
						<div style="color: var(--muted); margin-top:6px; line-height:1.7;">${t('checkout.nothing.desc')}</div>
						<div style="margin-top: 14px;">
							<button class="btn btn-primary" data-go="menu" type="button">${t('common.menu')}</button>
						</div>
					</div>
				</div>
			`,
		);
		return on(view, 'click', '[data-go]', (_e, tt) => router.go(tt.dataset.go));
	}

	const { subtotal } = calcTotals(lines);
	const tax = Math.round(subtotal * RESTAURANT.taxRate);
	let tipPercent = 0;
	let tip = 0;
	let pay = 'cash';
	let splitMode = 'full'; // full | per-person
	let splitCount = 2;

	const recompute = () => {
		const base = subtotal + tax;
		tip = s.session.mode === 'dine-in' ? Math.round((base * tipPercent) / 100) : 0;
		const total = base + tip;
		return { base, total };
	};

	const { base, total } = recompute();

	mount(
		view,
		`
			<div class="fade-in">
				<div class="card">
					<div class="card-pad">
						<div style="font-weight:900; font-size:18px;">${t('checkout.summary')}</div>
						<div style="margin-top: 10px; display:grid; gap: 8px;">
							${lines.map(l => `
								<div style="display:flex; justify-content:space-between; color: var(--muted);">
									<span>${l.qty} × ${l.name}</span>
									<span>${formatMoney(l.unitPrice * l.qty)}</span>
								</div>
							`).join('')}
						</div>
						<div class="divider"></div>
						<div style="display:flex; justify-content:space-between; color: var(--muted);">
							<span>${t('cart.subtotal')}</span>
							<span>${formatMoney(subtotal)}</span>
						</div>
						<div style="display:flex; justify-content:space-between; color: var(--muted); margin-top: 10px;">
							<span>${t('cart.tax', { pct: Math.round(RESTAURANT.taxRate * 100) })}</span>
							<span>${formatMoney(tax)}</span>
						</div>
						<div id="tipRow" style="display:${tip > 0 ? 'flex' : 'none'}; justify-content:space-between; color: var(--muted); margin-top: 10px;">
							<span>${t('checkout.tip')} (<span id="tipPct">${tipPercent}</span>%)</span>
							<span id="tipVal">${formatMoney(tip)}</span>
						</div>
						<div class="divider"></div>
						<div style="display:flex; justify-content:space-between; align-items:baseline;">
							<span style="font-weight:900;">${t('cart.total')}</span>
							<span style="font-weight:900; font-size:22px;" id="total">${formatMoney(total)}</span>
						</div>
						<div id="perPerson" style="display:none; margin-top: 10px; color: var(--muted); font-size: 13px;"></div>
					</div>
				</div>

				${APP_SETTINGS.enableTipping && s.session.mode === 'dine-in' ? `
					<div class="card" style="margin-top: 12px;">
						<div class="card-pad">
							<div style="font-weight:900">${t('checkout.tip')}</div>
							<div class="chips" style="margin-top: 10px;">
								<button class="chip" data-tip="0" aria-pressed="true" type="button">${t('common.none')}</button>
								${APP_SETTINGS.tippingOptions.map(p => `<button class="chip" data-tip="${p}" aria-pressed="false" type="button">${p}%</button>`).join('')}
							</div>
						</div>
					</div>
				` : ''}

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad">
						<div style="font-weight:900">${t('checkout.pay')}</div>
						<div style="display:grid; gap: 10px; margin-top: 10px;">
							${PAYMENT_METHODS.map(m => `
								<label class="card" style="border-radius: 22px; padding: 12px; display:flex; align-items:center; gap: 10px; cursor:pointer; border-color: ${m.id === pay ? 'rgba(34, 211, 238, 0.35)' : 'var(--stroke)'};">
									<input type="radio" name="pay" value="${m.id}" ${m.id === pay ? 'checked' : ''} style="accent-color: var(--primary2);" />
									<span style="font-size: 20px;">${m.icon}</span>
									<span style="font-weight:800">${lang === 'en' ? (m.labelEn || m.label) : m.label}</span>
								</label>
							`).join('')}
						</div>
					</div>
				</div>

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad">
						<div style="font-weight:900">${t('checkout.split')}</div>
						<div class="chips" style="margin-top: 10px;">
							<button class="chip" data-split="full" aria-pressed="true" type="button">${t('checkout.split.full')}</button>
							<button class="chip" data-split="per-person" aria-pressed="false" type="button">${t('checkout.split.perperson')}</button>
						</div>
						<div id="splitCount" style="display:none; margin-top: 10px; align-items:center; justify-content:space-between; gap:12px;">
							<div style="color: var(--muted); font-size: 13px;">${t('checkout.people')}</div>
							<div class="qty">
								<button type="button" data-split-count="-1">−</button>
								<span id="splitN">${splitCount}</span>
								<button type="button" data-split-count="1">+</button>
							</div>
						</div>
					</div>
				</div>

				<div class="card" style="margin-top: 12px;">
					<div class="card-pad">
						<div class="field">
							<label class="label" for="notes">${t('common.notes')}</label>
							<textarea id="notes" class="input" rows="3" placeholder="..." style="resize:none"></textarea>
						</div>
					</div>
				</div>

				<div style="margin-top: 12px; display:flex; gap: 10px;">
					<button class="btn btn-secondary btn-block" data-action="back" type="button">${t('common.back')}</button>
					<button class="btn btn-primary btn-block" data-action="submit" type="button" id="submitBtn">${t('checkout.submit')}</button>
				</div>
			</div>
		`,
	);

	const elTotal = qs(view, '#total');
	const elTipRow = qs(view, '#tipRow');
	const elTipPct = qs(view, '#tipPct');
	const elTipVal = qs(view, '#tipVal');
	const elPerPerson = qs(view, '#perPerson');
	const elSplitCount = qs(view, '#splitCount');
	const elSplitN = qs(view, '#splitN');
	const submitBtn = qs(view, '#submitBtn');

	const refresh = () => {
		const { total } = recompute();
		elTotal.textContent = formatMoney(total);
		elTipPct && (elTipPct.textContent = String(tipPercent));
		elTipVal && (elTipVal.textContent = formatMoney(tip));
		if (elTipRow) elTipRow.style.display = tip > 0 ? 'flex' : 'none';

		if (splitMode === 'per-person') {
			if (elSplitCount) elSplitCount.style.display = 'flex';
			if (elPerPerson) {
				elPerPerson.style.display = 'block';
				elPerPerson.textContent = t('checkout.perperson', { amount: formatMoney(Math.ceil(total / splitCount)) });
			}
		} else {
			if (elSplitCount) elSplitCount.style.display = 'none';
			if (elPerPerson) elPerPerson.style.display = 'none';
		}
	};

	refresh();

	const offBack = on(view, 'click', '[data-action="back"]', () => router.go('cart'));

	const offTip = on(view, 'click', '[data-tip]', (_e, t) => {
		tipPercent = Number(t.dataset.tip || 0);
		view.querySelectorAll('[data-tip]').forEach(b => b.setAttribute('aria-pressed', b === t ? 'true' : 'false'));
		refresh();
	});

	const offPay = on(view, 'change', 'input[name="pay"]', (e) => {
		pay = e.target.value;
	});

	const offSplit = on(view, 'click', '[data-split]', (_e, t) => {
		splitMode = t.dataset.split;
		view.querySelectorAll('[data-split]').forEach(b => b.setAttribute('aria-pressed', b === t ? 'true' : 'false'));
		refresh();
	});

	const offSplitCount = on(view, 'click', '[data-split-count]', (_e, t) => {
		splitCount = clamp(splitCount + Number(t.dataset.splitCount || 0), 2, Math.max(2, lines.length));
		if (elSplitN) elSplitN.textContent = String(splitCount);
		refresh();
	});

	const offSubmit = on(view, 'click', '[data-action="submit"]', async () => {
		if (store.getState().ui.busy) return;
		submitBtn.disabled = true;
		submitBtn.style.opacity = '0.8';
		submitBtn.textContent = t('checkout.sending');
		const notes = qs(view, '#notes')?.value || '';

		const split = splitMode === 'per-person' ? { mode: splitMode, count: splitCount } : null;
		await actions.submitOrder({ paymentMethod: pay, tip, notes, split });

		submitBtn.disabled = false;
		submitBtn.style.opacity = '';
		submitBtn.textContent = t('checkout.submit');
	});

	return () => {
		offBack();
		offTip();
		offPay();
		offSplit();
		offSplitCount();
		offSubmit();
	};
}
