import { uid } from '../core/format.js';

function normalizeMods(mods) {
	const list = Array.isArray(mods) ? mods : [];
	// Stable sort by group then option id.
	return list
		.map(m => ({ groupId: m.groupId, optionId: m.optionId, name: m.name, price: Number(m.price || 0) }))
		.sort((a, b) => (a.groupId + ':' + a.optionId).localeCompare(b.groupId + ':' + b.optionId));
}

export function lineKey({ itemId, modifiers }) {
	const mods = normalizeMods(modifiers).map(m => `${m.groupId}.${m.optionId}`).join('|');
	return mods ? `${itemId}::${mods}` : itemId;
}

export function calcLineUnitPrice({ basePrice, modifiers }) {
	const modsTotal = normalizeMods(modifiers).reduce((sum, m) => sum + (m.price || 0), 0);
	return Number(basePrice || 0) + modsTotal;
}

export function calcTotals(cartLines) {
	const lines = Array.isArray(cartLines) ? cartLines : [];
	const subtotal = lines.reduce((sum, l) => sum + (l.unitPrice * l.qty), 0);
	return { subtotal };
}

export function addToCart(lines, { item, qty, modifiers }) {
	const next = [...(lines || [])];
	const key = lineKey({ itemId: item.id, modifiers });
	const idx = next.findIndex(l => l.key === key);
	if (idx >= 0) {
		next[idx] = { ...next[idx], qty: next[idx].qty + qty };
		return next;
	}
	const normMods = normalizeMods(modifiers);
	next.push({
		lineId: uid('line'),
		key,
		itemId: item.id,
		name: item.name,
		image: item.image,
		emoji: item.emoji,
		unitPrice: calcLineUnitPrice({ basePrice: item.price, modifiers: normMods }),
		qty,
		modifiers: normMods,
	});
	return next;
}

export function setQty(lines, lineId, qty) {
	const next = [...(lines || [])];
	const idx = next.findIndex(l => l.lineId === lineId);
	if (idx < 0) return next;
	if (qty <= 0) return next.filter(l => l.lineId !== lineId);
	next[idx] = { ...next[idx], qty };
	return next;
}

export function removeLine(lines, lineId) {
	return (lines || []).filter(l => l.lineId !== lineId);
}

export function countItems(lines) {
	return (lines || []).reduce((sum, l) => sum + l.qty, 0);
}

