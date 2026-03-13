import { storage } from './storage.js';

export function createStore({ initialState, persistKey, persistPick }) {
	let state = structuredClone(initialState);
	const subs = new Set();

	if (persistKey) {
		const saved = storage.get(persistKey);
		if (saved && typeof saved === 'object') {
			state = { ...state, ...saved };
		}
	}

	function getState() {
		return state;
	}

	function set(partial) {
		const prev = state;
		state = { ...state, ...partial };
		for (const cb of subs) cb(state, prev);
		if (persistKey) {
			const snapshot = persistPick ? persistPick(state) : state;
			storage.set(persistKey, snapshot);
		}
	}

	function update(fn) {
		set(fn(state));
	}

	function subscribe(cb) {
		subs.add(cb);
		return () => subs.delete(cb);
	}

	return { getState, set, update, subscribe };
}

