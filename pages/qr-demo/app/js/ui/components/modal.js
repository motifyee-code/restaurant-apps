import { mount, on } from '../../core/dom.js';

export function openDialog({
	title,
	bodyHtml,
	primary,
	secondary,
	onClose,
}) {
	const overlay = document.createElement('div');
	overlay.className = 'overlay';
	overlay.setAttribute('role', 'presentation');

	const dialog = document.createElement('div');
	dialog.className = 'dialog';
	dialog.setAttribute('role', 'dialog');
	dialog.setAttribute('aria-modal', 'true');
	if (title) dialog.setAttribute('aria-label', title);

	mount(
		dialog,
		`
			<div class="dialog-head">
				<div class="dialog-title">${title || ''}</div>
				<button class="icon-btn" data-close="1" aria-label="إغلاق">✕</button>
			</div>
			<div class="dialog-body">${bodyHtml || ''}</div>
			${primary || secondary ? `
				<div class="dialog-foot">
					${secondary ? `<button class="btn btn-secondary btn-block" data-secondary="1">${secondary.label}</button>` : ''}
					${primary ? `<button class="btn btn-primary btn-block" data-primary="1">${primary.label}</button>` : ''}
				</div>
			` : ''}
		`,
	);

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	let cleanup = [];
	const close = (reason = 'close') => {
		for (const fn of cleanup) fn();
		overlay.remove();
		onClose?.(reason);
	};

	cleanup.push(
		on(overlay, 'click', '[data-close]', () => close('x')),
		on(overlay, 'click', '[data-secondary]', () => {
			if (secondary?.onClick) secondary.onClick({ close });
			else close('secondary');
		}),
		on(overlay, 'click', '[data-primary]', () => {
			if (primary?.onClick) primary.onClick({ close });
			else close('primary');
		}),
	);

	const onOverlay = (e) => {
		if (e.target === overlay) close('overlay');
	};
	overlay.addEventListener('click', onOverlay);
	cleanup.push(() => overlay.removeEventListener('click', onOverlay));

	const onEsc = (e) => {
		if (e.key === 'Escape') close('esc');
	};
	document.addEventListener('keydown', onEsc);
	cleanup.push(() => document.removeEventListener('keydown', onEsc));

	// Basic focus: focus the close button.
	const closeBtn = dialog.querySelector('[data-close]');
	closeBtn?.focus?.();

	return { close, overlay, dialog };
}

