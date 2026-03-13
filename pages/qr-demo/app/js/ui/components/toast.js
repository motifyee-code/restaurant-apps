import { uid } from '../../core/format.js';

const ICON = {
	success: '✓',
	info: 'ℹ',
	warn: '⚠',
	error: '✕',
};

export function createToasts(root = document.body) {
	let host = root.querySelector('.toasts');
	if (!host) {
		host = document.createElement('div');
		host.className = 'toasts';
		root.appendChild(host);
	}

	function show(message, { type = 'info', ms = 2600 } = {}) {
		const id = uid('toast');
		const el = document.createElement('div');
		el.className = 'toast';
		el.dataset.toastId = id;
		el.innerHTML = `
			<div class="t-icn">${ICON[type] || ICON.info}</div>
			<div class="t-msg">${message}</div>
		`;
		el.addEventListener('click', () => dismiss(id));
		host.appendChild(el);
		const t = setTimeout(() => dismiss(id), ms);
		el.dataset.timeout = String(t);
	}

	function dismiss(id) {
		const el = host.querySelector(`[data-toast-id="${id}"]`);
		if (!el) return;
		const t = Number(el.dataset.timeout || 0);
		if (t) clearTimeout(t);
		el.remove();
	}

	return { show, dismiss };
}

