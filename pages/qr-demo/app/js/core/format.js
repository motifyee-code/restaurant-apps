import { RESTAURANT } from '../domain/config.js';

export function formatMoney(amount) {
	const n = Number.isFinite(amount) ? amount : 0;
	const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
	const locale = lang === 'en' ? 'en-US' : 'ar-EG';
	return `${n.toLocaleString(locale)} ${RESTAURANT.currency}`;
}

export function clamp(n, min, max) {
	return Math.min(Math.max(n, min), max);
}

export function uid(prefix = 'id') {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatRelativeTime(iso) {
	const d = new Date(iso);
	const now = new Date();
	const seconds = Math.max(0, Math.floor((now - d) / 1000));
	const isEn = document.documentElement.lang === 'en';
	if (seconds < 45) return isEn ? 'now' : 'الآن';
	if (seconds < 3600) return isEn ? `${Math.floor(seconds / 60)}m ago` : `منذ ${Math.floor(seconds / 60)} دقيقة`;
	if (seconds < 86400) return isEn ? `${Math.floor(seconds / 3600)}h ago` : `منذ ${Math.floor(seconds / 3600)} ساعة`;
	return isEn ? `${Math.floor(seconds / 86400)}d ago` : `منذ ${Math.floor(seconds / 86400)} يوم`;
}

export function formatDurationMinutes(minutes) {
	const m = Math.max(0, Math.floor(minutes));
	const isEn = document.documentElement.lang === 'en';
	if (m < 60) return isEn ? `${m} min` : `${m} دقيقة`;
	const h = Math.floor(m / 60);
	const mm = m % 60;
	if (mm === 0) return isEn ? `${h} hr` : `${h} ساعة`;
	return isEn ? `${h} hr ${mm} min` : `${h} ساعة و${mm} دقيقة`;
}

export function getQuery() {
	const params = new URLSearchParams(window.location.search);
	const q = {};
	for (const [k, v] of params.entries()) q[k] = v;
	return q;
}
