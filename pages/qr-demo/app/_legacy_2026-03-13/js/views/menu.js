/**
 * Menu View
 * Main menu browsing page
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import {
	MENU_CATEGORIES,
	MENU_ITEMS,
	RESTAURANT,
	SERVICE_TYPES,
} from '../config.js';
import { formatPrice, showToast } from '../utils/helpers.js';

export function renderMenu(container) {
	const state = store.getState();
	const cartCount = selectors.getCartCount();
	const table = state.table;
	const mode = state.mode;

	container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <div class="header-logo">
                        <span style="margin-left: 8px;">${RESTAURANT.logo}</span>
                        ${RESTAURANT.name}
                        ${table ? `<span style="font-size: 12px; color: var(--text-muted); margin-right: 8px;">طاولة ${table}</span>` : ''}
                    </div>
                    <div class="header-actions">
                        <button class="icon-btn header-cart-btn" data-action="cart" title="السلة">
                            🛒
                            ${cartCount > 0 ? `<span class="header-cart-badge">${cartCount}</span>` : ''}
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Categories -->
                    <div class="menu-categories">
                        <div class="container menu-categories-list">
                            <button class="menu-category-btn active" data-category="all">
                                🍽️ الكل
                            </button>
                            ${MENU_CATEGORIES.map(
															cat => `
                                <button class="menu-category-btn" data-category="${cat.id}">
                                    ${cat.icon} ${cat.name}
                                </button>
                            `,
														).join('')}
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="menu-sections" style="margin-top: 20px;">
                        ${renderMenuItems(MENU_ITEMS)}
                    </div>
                </div>
            </div>

            <!-- Floating Action Button (Service Bell) -->
            <div class="fab-container">
                <div class="fab-popup" id="service-popup">
                    <div class="fab-popup-header">خدمة سريعة</div>
                    <div class="fab-popup-actions">
                        <button class="fab-action-btn" data-action="waiter">
                            <span class="fab-action-icon">👨‍🍳</span>
                            <span>النادل</span>
                        </button>
                        <button class="fab-action-btn" data-action="water">
                            <span class="fab-action-icon">💧</span>
                            <span>مياه</span>
                        </button>
                        <button class="fab-action-btn" data-action="napkins">
                            <span class="fab-action-icon">🧻</span>
                            <span>مناديل</span>
                        </button>
                        <button class="fab-action-btn" data-action="bill">
                            <span class="fab-action-icon">🧾</span>
                            <span>الفاتورة</span>
                        </button>
                        <button class="fab-action-btn" data-action="more">
                            <span class="fab-action-icon">⋯</span>
                            <span>المزيد</span>
                        </button>
                    </div>
                </div>
                <button class="fab" id="service-fab" title="طلب خدمة">
                    🔔
                </button>
            </div>
        </div>
    `;

	// Category buttons
	container.querySelectorAll('.menu-category-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const category = btn.dataset.category;
			container
				.querySelectorAll('.menu-category-btn')
				.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			const filteredItems =
				category === 'all'
					? MENU_ITEMS
					: MENU_ITEMS.filter(item => item.categoryId === category);

			container.querySelector('.menu-sections').innerHTML =
				renderMenuItems(filteredItems);
			attachItemListeners(container);
		});
	});

	// Header actions
	container
		.querySelector('[data-action="cart"]')
		.addEventListener('click', () => navigate('cart'));

	// Floating Action Button (Service Bell)
	const fab = container.querySelector('#service-fab');
	const popup = container.querySelector('#service-popup');

	if (fab && popup) {
		// Toggle popup on FAB click
		fab.addEventListener('click', () => {
			fab.classList.toggle('active');
			popup.classList.toggle('active');
		});

		// Handle service actions
		popup.querySelectorAll('.fab-action-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const action = btn.dataset.action;

				// Close popup
				fab.classList.remove('active');
				popup.classList.remove('active');

				// Handle action
				switch (action) {
					case 'waiter':
						actions.addServiceRequest(SERVICE_TYPES.WAITER);
						showToast('تم طلب النادل، سيأتي قريباً', 'success');
						break;
					case 'water':
						actions.addServiceRequest(SERVICE_TYPES.WATER);
						showToast('تم طلب المياه، سيأتي قريباً', 'success');
						break;
					case 'napkins':
						actions.addServiceRequest(SERVICE_TYPES.NAPKINS);
						showToast('تم طلب المناديل، سيأتي قريباً', 'success');
						break;
					case 'bill':
						actions.addServiceRequest(SERVICE_TYPES.BILL);
						showToast('تم طلب الفاتورة، سيأتي النادل قريباً', 'success');
						break;
					case 'more':
						navigate('service');
						break;
				}
			});
		});

		// Close popup when clicking outside
		document.addEventListener('click', e => {
			if (!e.target.closest('.fab-container')) {
				fab.classList.remove('active');
				popup.classList.remove('active');
			}
		});
	}

	// Item click listeners
	attachItemListeners(container);
}

/**
 * Render menu items HTML
 */
function renderMenuItems(items) {
	const groupedItems = items.reduce((groups, item) => {
		const category = MENU_CATEGORIES.find(c => c.id === item.categoryId);
		if (category) {
			if (!groups[category.id]) {
				groups[category.id] = { category, items: [] };
			}
			groups[category.id].items.push(item);
		}
		return groups;
	}, {});

	return Object.values(groupedItems)
		.map(
			group => `
        <div class="menu-section">
            <h3 class="menu-section-title" style="font-family: var(--font-family-serif); font-size: 1.5rem; color: var(--text-gold);">
                <span>${group.category.icon}</span>
                ${group.category.name}
            </h3>
            <div class="menu-grid">
                ${group.items.map((item, index) => renderItemCard(item, index)).join('')}
            </div>

        </div>
    `,
		)
		.join('');
}

/**
 * Render single item card
 */
function renderItemCard(item, index) {
	const delayClass = index < 5 ? `stagger-${index + 1}` : '';
	return `
        <div class="menu-item ${!item.available ? 'menu-item-unavailable' : ''} fade-in-up ${delayClass}" data-item-id="${item.id}">
            <div class="menu-item-img">
                ${
									item.image
										? `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div style="display:none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 40px; background: var(--bg-tertiary);">${item.emoji || '🍽️'}</div>`
										: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: var(--bg-tertiary);">${item.emoji || '🍽️'}</div>`
								}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-name">
                    ${item.name}
                    ${item.spicy ? '<span style="color: var(--color-error); margin-right: 4px;">🌶️</span>' : ''}
                    ${item.vegetarian ? '<span style="color: var(--color-success); margin-right: 4px;">🥬</span>' : ''}
                    ${item.popular ? '<span style="color: var(--color-warning); margin-right: 4px;">⭐</span>' : ''}
                </div>
                <div class="menu-item-desc">${item.description}</div>
                <div class="menu-item-footer">
                    <div class="menu-item-price">${formatPrice(item.price)}</div>
                    ${
											item.available
												? `<button class="menu-item-add" data-action="add" data-item-id="${item.id}">+</button>`
												: `<span style="font-size: 12px; color: var(--color-error);">غير متوفر</span>`
										}
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to menu items
 */
function attachItemListeners(container) {
	container.querySelectorAll('.menu-item').forEach(card => {
		const itemId = card.dataset.itemId;
		const item = MENU_ITEMS.find(i => i.id === itemId);

		if (!item || !item.available) return;

		card.addEventListener('click', e => {
			if (!e.target.classList.contains('menu-item-add')) {
				showItemDetail(item);
			}
		});

		const addBtn = card.querySelector('[data-action="add"]');
		if (addBtn) {
			addBtn.addEventListener('click', e => {
				e.stopPropagation();
				// Quick add - directly to cart
				store.addToCart(item, 1, []);
				updateCartBadge();
				showAddedAnimation(addBtn);
			});
		}
	});
}

/**
 * Show item detail modal
 */
function showItemDetail(item) {
	const overlay = document.createElement('div');
	overlay.className = 'modal-overlay';
	overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${item.name}</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                ${
									item.image
										? `<div style="position: relative; width: 100%; height: 200px; margin-bottom: 20px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-xl);" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display:none; position: absolute; inset: 0; align-items: center; justify-content: center; font-size: 80px; background: var(--bg-tertiary); border-radius: var(--radius-xl);">${item.emoji || '🍽️'}</div>
                       </div>`
										: `<div style="width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; font-size: 80px; background: var(--bg-tertiary); border-radius: var(--radius-xl); margin-bottom: 20px;">${item.emoji || '🍽️'}</div>`
								}
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${item.description}</p>

                <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                    ${item.spicy ? '<span class="badge badge-error">🌶️ حار</span>' : ''}
                    ${item.vegetarian ? '<span class="badge badge-success">🥬 نباتي</span>' : ''}
                    ${item.popular ? '<span class="badge badge-warning">⭐ مشهور</span>' : ''}
                </div>

                <div class="counter" style="justify-content: space-between; margin-bottom: 20px;">
                    <span style="font-weight: 600;">الكمية</span>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="counter-btn" data-action="decrease">−</button>
                        <span class="counter-value" data-value="1">1</span>
                        <button class="counter-btn" data-action="increase">+</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted);">السعر</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--color-primary);" data-total-price>${formatPrice(item.price)}</div>
                    </div>
                    <button class="btn btn-primary btn-lg" data-action="add-to-cart">
                        أضف للسلة
                    </button>
                </div>
            </div>
        </div>
    `;

	document.body.appendChild(overlay);
	requestAnimationFrame(() => overlay.classList.add('active'));

	let quantity = 1;
	const counterValue = overlay.querySelector('[data-value]');
	const totalPrice = overlay.querySelector('[data-total-price]');

	// Counter controls
	overlay
		.querySelector('[data-action="increase"]')
		.addEventListener('click', () => {
			quantity = Math.min(quantity + 1, 99);
			counterValue.textContent = quantity;
			totalPrice.textContent = formatPrice(item.price * quantity);
		});

	overlay
		.querySelector('[data-action="decrease"]')
		.addEventListener('click', () => {
			quantity = Math.max(quantity - 1, 1);
			counterValue.textContent = quantity;
			totalPrice.textContent = formatPrice(item.price * quantity);
		});

	// Add to cart
	overlay
		.querySelector('[data-action="add-to-cart"]')
		.addEventListener('click', () => {
			store.addToCart(item, quantity, []);
			overlay.classList.remove('active');
			setTimeout(() => {
				overlay.remove();
				updateCartBadge();
			}, 300);
		});

	// Close button
	overlay.querySelector('.modal-close').addEventListener('click', () => {
		overlay.classList.remove('active');
		setTimeout(() => overlay.remove(), 300);
	});

	// Close on overlay click
	overlay.addEventListener('click', e => {
		if (e.target === overlay) {
			overlay.classList.remove('active');
			setTimeout(() => overlay.remove(), 300);
		}
	});
}

/**
 * Update cart badge in header
 */
function updateCartBadge() {
	const cartBtn = document.querySelector('.header-cart-btn');
	const cartCount = selectors.getCartCount();

	let badge = cartBtn.querySelector('.header-cart-badge');
	if (cartCount > 0) {
		if (!badge) {
			badge = document.createElement('span');
			badge.className = 'header-cart-badge badge-bounce';
			cartBtn.appendChild(badge);
		}
		badge.textContent = cartCount;
		badge.classList.remove('badge-bounce');
		void badge.offsetWidth; // Trigger reflow
		badge.classList.add('badge-bounce');
	} else if (badge) {
		badge.remove();
	}
}

/**
 * Show added animation
 */
function showAddedAnimation(button) {
	const originalContent = button.innerHTML;
	button.innerHTML = '✓';
	button.style.background = 'var(--color-success)';
	setTimeout(() => {
		button.innerHTML = originalContent;
		button.style.background = '';
	}, 1000);
}

// Export update function for use from other views
export { updateCartBadge };
