export function escapeHtml(value) {
	const div = document.createElement('div');
	div.textContent = value ?? '';
	return div.innerHTML;
}

export function html(strings, ...values) {
	let out = '';
	for (let i = 0; i < strings.length; i++) {
		out += strings[i];
		if (i < values.length) out += String(values[i] ?? '');
	}
	return out;
}

export function mount(el, markup) {
	el.innerHTML = markup;
}

export function qs(root, selector) {
	return root.querySelector(selector);
}

export function qsa(root, selector) {
	return Array.from(root.querySelectorAll(selector));
}

export function on(root, type, selector, handler, options) {
	const listener = (e) => {
		const target = e.target?.closest?.(selector);
		if (!target) return;
		handler(e, target);
	};
	root.addEventListener(type, listener, options);
	return () => root.removeEventListener(type, listener, options);
}

