import { sleep, uid } from '../core/format.js';
import { ORDER_STATUS } from '../domain/order.js';
import { QUEUE_SETTINGS, WAITLIST_SETTINGS } from '../domain/config.js';

export async function submitOrderMock({ mode, orderDraft }) {
	// Simulate network + server processing.
	await sleep(650);
	const id = uid('ORD').slice(-10).toUpperCase();
	const createdAt = new Date().toISOString();

	if (mode === 'queue') {
		const number = `${QUEUE_SETTINGS.orderPrefix}${Math.floor(Math.random() * 900 + 100)}`;
		const position = Math.floor(Math.random() * 5) + 1;
		const etaMinutes = position * QUEUE_SETTINGS.avgPrepTimeMinutes;
		return {
			type: 'queue',
			queue: { number, position, etaMinutes },
			order: {
				id,
				createdAt,
				status: ORDER_STATUS.PENDING,
				...orderDraft,
			},
		};
	}

	return {
		type: 'table',
		order: {
			id,
			createdAt,
			status: ORDER_STATUS.PENDING,
			...orderDraft,
		},
	};
}

export function simulateKitchen({ onStatus }) {
	// Returns cancel function.
	let alive = true;
	const steps = [
		{ status: ORDER_STATUS.CONFIRMED, delay: 1200, toast: 'تم تأكيد الطلب' },
		{ status: ORDER_STATUS.PREPARING, delay: 3800, toast: 'جاري التحضير' },
		{ status: ORDER_STATUS.READY, delay: 10000, toast: 'طلبك جاهز' },
	];

	(async () => {
		for (const s of steps) {
			await sleep(s.delay);
			if (!alive) return;
			onStatus(s.status, s.toast);
		}
	})();

	return () => {
		alive = false;
	};
}

export function simulateQueue({ initialPosition, onUpdate, onReady }) {
	let alive = true;
	let pos = initialPosition;

	(async () => {
		while (alive && pos > 0) {
			await sleep(7000);
			if (!alive) return;
			pos -= 1;
			if (pos <= 0) {
				onReady?.();
				return;
			}
			onUpdate?.(pos);
		}
	})();

	return () => {
		alive = false;
	};
}

export function joinWaitlistMock({ partySize, preferences, phone }) {
	const ticketNumber = `${WAITLIST_SETTINGS.ticketPrefix}${Math.floor(Math.random() * 900 + 100)}`;
	const position = Math.floor(Math.random() * 6) + 1;
	const etaMinutes = position * WAITLIST_SETTINGS.avgTimePerPartyMinutes;
	return {
		ticketNumber,
		position,
		etaMinutes,
		partySize,
		preferences,
		phone,
		joinedAt: new Date().toISOString(),
	};
}

