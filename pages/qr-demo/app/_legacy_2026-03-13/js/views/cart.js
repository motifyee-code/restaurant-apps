/**
 * Cart View
 * Shopping cart page
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import { RESTAURANT, APP_SETTINGS } from '../config.js';
import { formatPrice } from '../utils/helpers.js';
import { updateCartBadge } from './menu.js';

export function renderCart(container) {
    const state = store.getState();
    const cart = state.cart;
    const isEmpty = cart.length === 0;

    if (isEmpty) {
        renderEmptyCart(container);
        return;
    }

    const subtotal = selectors.getCartTotal();
    const tax = Math.round(subtotal * RESTAURANT.taxRate);
    const total = subtotal + tax;

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">سلة الطلبات</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Cart Items -->
                    <div class="cart-items">
                        ${cart.map((item, index) => renderCartItem(item, index)).join('')}
                    </div>

                    <!-- Summary -->
                    <div class="cart-summary">
                        <div class="cart-summary-row">
                            <span>المجموع الفرعي</span>
                            <span>${formatPrice(subtotal)}</span>
                        </div>
                        <div class="cart-summary-row">
                            <span>الضريبة (15%)</span>
                            <span>${formatPrice(tax)}</span>
                        </div>
                        <div class="cart-summary-row total">
                            <span>الإجمالي</span>
                            <span style="color: var(--color-primary);">${formatPrice(total)}</span>
                        </div>
                    </div>

                    <!-- Table Info (Dine-in only) -->
                    ${state.mode === 'dine-in' ? `
                        <div class="card" style="margin-bottom: 20px;">
                            <div class="card-body" style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 12px; color: var(--text-muted);">طاولتك</div>
                                    <div style="font-weight: 600;">طاولة ${state.table}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm" data-action="change-table">
                                    تغيير
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Footer -->
            <div class="page-footer">
                <div class="container">
                    <button class="btn btn-primary btn-block btn-lg" data-action="checkout">
                        إتمام الطلب • ${formatPrice(total)}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Back button
    container.querySelector('[data-action="back"]').addEventListener('click', () => {
        navigate('menu');
    });

    // Checkout button
    container.querySelector('[data-action="checkout"]').addEventListener('click', () => {
        navigate('checkout');
    });

    // Cart item controls
    attachCartItemListeners(container);
}

/**
 * Render empty cart state
 */
function renderEmptyCart(container) {
    container.innerHTML = `
        <div class="page">
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">سلة الطلبات</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <div class="page-content">
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">🛒</div>
                        <h3 class="empty-state-title">السلة فارغة</h3>
                        <p class="empty-state-desc">لم تقم بإضافة أي أصناف بعد. ابدأ بتصفح القائمة.</p>
                    </div>
                </div>
            </div>

            <div class="page-footer">
                <div class="container">
                    <button class="btn btn-primary btn-block" data-action="browse">
                        تصفح القائمة
                    </button>
                </div>
            </div>
        </div>
    `;

    container.querySelector('[data-action="back"]').addEventListener('click', () => navigate('menu'));
    container.querySelector('[data-action="browse"]').addEventListener('click', () => navigate('menu'));
}

/**
 * Render single cart item
 */
function renderCartItem(item, index) {
    const modifiersPrice = (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0);
    const itemPrice = item.price + modifiersPrice;
    const itemTotal = itemPrice * item.quantity;

    return `
        <div class="cart-item" data-item-index="${index}">
            <div class="cart-item-img">
                ${item.image
                    ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div style="display:none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 32px; background: var(--bg-tertiary);">${item.emoji || '🍽️'}</div>`
                    : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: var(--bg-tertiary);">${item.emoji || '🍽️'}</div>`
                }
            </div>
            <div class="cart-item-content">
                <div class="cart-item-name">${item.name}</div>
                ${(item.modifiers || []).length > 0 ? `
                    <div class="cart-item-modifiers">
                        ${item.modifiers.map(m => m.name).join(' • ')}
                    </div>
                ` : ''}
                <div class="cart-item-actions">
                    <div class="counter" style="padding: 4px;">
                        <button class="counter-btn btn-sm" data-action="decrease">−</button>
                        <span class="counter-value">${item.quantity}</span>
                        <button class="counter-btn btn-sm" data-action="increase">+</button>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-weight: 600; color: var(--color-primary);">${formatPrice(itemTotal)}</div>
                        <button class="cart-item-remove" data-action="remove">حذف</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach cart item event listeners
 */
function attachCartItemListeners(container) {
    container.querySelectorAll('.cart-item').forEach(itemEl => {
        const index = parseInt(itemEl.dataset.itemIndex);

        // Increase quantity
        itemEl.querySelector('[data-action="increase"]').addEventListener('click', () => {
            store.updateCartItem(index, store.getState().cart[index].quantity + 1);
            reRenderCart();
        });

        // Decrease quantity
        itemEl.querySelector('[data-action="decrease"]').addEventListener('click', () => {
            const currentQuantity = store.getState().cart[index].quantity;
            if (currentQuantity > 1) {
                store.updateCartItem(index, currentQuantity - 1);
                reRenderCart();
            }
        });

        // Remove item
        itemEl.querySelector('[data-action="remove"]').addEventListener('click', () => {
            if (confirm('هل أنت متأكد من حذف هذا الصنف من السلة؟')) {
                store.removeFromCart(index);
                updateCartBadge();
                reRenderCart();
            }
        });
    });

    // Change table (dine-in mode)
    const changeTableBtn = container.querySelector('[data-action="change-table"]');
    if (changeTableBtn) {
        changeTableBtn.addEventListener('click', () => {
            const newTable = prompt('أدخل رقم الطاولة الجديد:', store.getState().table);
            if (newTable && !isNaN(newTable)) {
                store.set({ table: parseInt(newTable) });
                reRenderCart();
            }
        });
    }
}

/**
 * Re-render cart (after quantity changes)
 */
function reRenderCart() {
    const container = document.getElementById('app');
    renderCart(container);
}
