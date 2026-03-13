import { mount } from '../../core/dom.js';

export function renderShell(root) {
	mount(
		root,
		`
			<div class="bg-blobs" aria-hidden="true"></div>
			<div class="app">
				<header class="appbar">
					<div class="container appbar-inner" id="appbar"></div>
				</header>
				<main class="view">
					<div class="container" id="view"></div>
				</main>
				<div class="cartbar" id="cartbar" style="display:none"></div>
			</div>
		`,
	);

	return {
		appbar: root.querySelector('#appbar'),
		view: root.querySelector('#view'),
		cartbar: root.querySelector('#cartbar'),
	};
}

