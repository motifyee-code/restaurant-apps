/**
 * Helper Functions
 * Utility functions for formatting and common operations
 */

import { RESTAURANT } from '../config.js';

/**
 * Format price with currency
 */
export function formatPrice(price) {
	return `${price.toLocaleString('ar-SA')} ${RESTAURANT.currency}`;
}

/**
 * Format date/time
 */
export function formatDateTime(dateString) {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('ar-SA', {
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

/**
 * Format relative time (e.g., "منذ 5 دقائق")
 */
export function formatRelativeTime(dateString) {
	const date = new Date(dateString);
	const now = new Date();
	const diff = Math.floor((now - date) / 1000); // seconds

	if (diff < 60) return 'الآن';
	if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
	if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
	return `منذ ${Math.floor(diff / 86400)} يوم`;
}

/**
 * Format duration (e.g., "20-25 دقيقة")
 */
export function formatDuration(minutes) {
	if (minutes < 60) {
		return `${minutes} دقيقة`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours} ساعة و${mins} دقيقة` : `${hours} ساعة`;
}

/**
 * Generate order number
 */
export function generateOrderNumber() {
	return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Generate queue number
 */
export function generateQueueNumber(prefix = 'A') {
	const random = Math.floor(Math.random() * 900) + 100;
	return `${prefix}${random}`;
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), delay);
	};
}

/**
 * Throttle function
 */
export function throttle(fn, limit) {
	let inThrottle;
	return function (...args) {
		if (!inThrottle) {
			fn.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

/**
 * Clone object/array
 */
export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate unique ID
 */
export function generateId() {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

/**
 * Scroll element into view
 */
export function scrollIntoView(element, options = {}) {
	element.scrollIntoView({
		behavior: 'smooth',
		block: 'start',
		...options,
	});
}

/**
 * Local storage helpers
 */
export const storage = {
	get(key) {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch {
			return null;
		}
	},
	set(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch {
			return false;
		}
	},
	remove(key) {
		try {
			localStorage.removeItem(key);
			return true;
		} catch {
			return false;
		}
	},
	clear() {
		try {
			localStorage.clear();
			return true;
		} catch {
			return false;
		}
	},
};

/**
 * Toast notification helper
 */
export function showToast(message, type = 'info', duration = 2000) {
	// Create toast container if not exists
	let container = document.querySelector('.toast-container');
	if (!container) {
		container = document.createElement('div');
		container.className = 'toast-container';
		document.body.appendChild(container);
	}

	// Create toast element
	const toast = document.createElement('div');
	toast.className = `toast ${type}`;

	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ',
	};

	toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

	container.appendChild(toast);
	toast.style.cursor = 'pointer';

	const dismiss = () => {
		if (toast.parentElement) {
			toast.style.animation = 'toastOut 0.3s ease forwards';
			setTimeout(() => toast.remove(), 300);
		}
	};

	// Dismiss on click
	toast.addEventListener('click', dismiss);

	// Remove after duration
	setTimeout(dismiss, duration);
}

/**
 * Confirm dialog helper
 */
export function confirm(message) {
	return window.confirm(message);
}

/**
 * Safe HTML escape
 */
export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Parse URL query params
 */
export function getQueryParams() {
	const params = new URLSearchParams(window.location.search);
	const result = {};
	for (const [key, value] of params) {
		result[key] = value;
	}
	return result;
}

/**
 * Build URL with query params
 */
export function buildUrl(url, params) {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined) {
			searchParams.append(key, String(value));
		}
	}
	const queryString = searchParams.toString();
	return queryString ? `${url}?${queryString}` : url;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
	try {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
			return true;
		}
		// Fallback
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get random item from array
 */
export function getRandomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array
 */
export function shuffle(array) {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Calculate percentage
 */
export function percentage(value, total) {
	return total > 0 ? (value / total) * 100 : 0;
}

/**
 * Clamp number between min and max
 */
export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Random number between min and max
 */
export function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
