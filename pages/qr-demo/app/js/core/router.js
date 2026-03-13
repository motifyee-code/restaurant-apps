const normalize = (s) => (s || '').replace(/^#\/?/, '').trim();

export function createRouter({ routes, onRoute, notFound = 'landing' }) {
	let current = null;

	function getRoute() {
		const raw = normalize(window.location.hash);
		return raw || notFound;
	}

	async function go(route, { replace = false } = {}) {
		const next = normalize(route) || notFound;
		current = next;
		const hash = `#/${next}`;
		if (replace) window.location.replace(hash);
		else window.location.hash = hash;
	}

	async function handle() {
		const key = getRoute();
		const loader = routes[key] || routes[notFound];
		const mod = await loader();
		await onRoute(key, mod);
	}

	function start() {
		window.addEventListener('hashchange', handle);
		handle();
	}

	function stop() {
		window.removeEventListener('hashchange', handle);
	}

	return {
		start,
		stop,
		go,
		get current() {
			return current;
		},
	};
}

