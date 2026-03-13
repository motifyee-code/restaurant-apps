/**
 * Queue View
 * Queue mode - order number and status tracking
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import { MENU_ITEMS, RESTAURANT, QUEUE_SETTINGS } from '../config.js';
import { formatPrice, generateQueueNumber } from '../utils/helpers.js';

export function renderQueue(container) {
    const state = store.getState();
    const queueNumber = state.queueNumber;
    const queuePosition = state.queuePosition ?? 3;
    const queueEstimate = state.queueEstimate ?? (queuePosition * 5);
    const cart = state.cart;
    const cartCount = selectors.getCartCount();

    // If no queue number yet and cart is empty, show menu
    if (!queueNumber && cartCount === 0) {
        renderQueueMenu(container);
        return;
    }

    // Show queue status
    renderQueueStatus(container, queueNumber, queuePosition, queueEstimate);
}

/**
 * Render queue menu (browse and add items)
 */
function renderQueueMenu(container) {
    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <div class="header-logo">
                        <span style="margin-left: 8px;">${RESTAURANT.logo}</span>
                        ${RESTAURANT.name}
                        <span style="font-size: 12px; color: var(--text-muted); margin-right: 8px;">وضع الاستلام</span>
                    </div>
                    <div class="header-actions">
                        <button class="icon-btn header-cart-btn" data-action="cart">
                            🛒
                            ${selectors.getCartCount() > 0 ? `<span class="header-cart-badge">${selectors.getCartCount()}</span>` : ''}
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Queue Mode Info -->
                    <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; border: none;">
                        <div class="card-body" style="text-align: center; padding: 24px;">
                            <div style="font-size: 48px; margin-bottom: 8px;">🎫</div>
                            <h3 style="color: white; margin-bottom: 8px;">وضع الطابور والاستلام</h3>
                            <p style="font-size: 14px; opacity: 0.9;">
                                أضف الأصناف لسلتك ثم ادفع لاستلام طلبك من الكاونتر
                            </p>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <button class="btn btn-secondary btn-block" data-action="popular">
                            ⭐ الأكثر طلباً
                        </button>
                        <button class="btn btn-secondary btn-block" data-action="deals">
                            🔥 العروض
                        </button>
                    </div>

                    <!-- Popular Items Preview -->
                    <h3 style="margin-bottom: 16px;">الأكثر شعبية</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${MENU_ITEMS.filter(item => item.popular && item.available).slice(0, 4).map(item => `
                            <div class="menu-item" data-item-id="${item.id}" style="cursor: pointer;">
                                <div class="menu-item-img">
                                    ${item.image
                                        ? `<img src="${item.image}" alt="${item.name}">`
                                        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🍽️</div>`
                                    }
                                </div>
                                <div class="menu-item-content">
                                    <div class="menu-item-name">${item.name}</div>
                                    <div class="menu-item-desc">${item.description}</div>
                                    <div class="menu-item-footer">
                                        <div class="menu-item-price">${formatPrice(item.price)}</div>
                                        <button class="menu-item-add" data-action="add" data-item-id="${item.id}">+</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <button class="btn btn-primary btn-block btn-lg" style="margin-top: 20px;" data-action="view-menu">
                        عرض القائمة الكاملة
                    </button>
                </div>
            </div>
        </div>
    `;

    // Cart button
    container.querySelector('[data-action="cart"]').addEventListener('click', () => navigate('cart'));

    // View menu button
    container.querySelector('[data-action="view-menu"]').addEventListener('click', () => navigate('menu'));

    // Popular items click
    container.querySelectorAll('.menu-item').forEach(card => {
        const itemId = card.dataset.itemId;
        const item = MENU_ITEMS.find(i => i.id === itemId);

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('menu-item-add')) {
                // TODO: Show item detail modal
                store.addToCart(item, 1, []);
                updateCartBadge();
                showToast(`تمت إضافة ${item.name} للسلة`, 'success');
            }
        });

        const addBtn = card.querySelector('[data-action="add"]');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            store.addToCart(item, 1, []);
            updateCartBadge();
            showToast(`تمت إضافة ${item.name} للسلة`, 'success');
        });
    });
}

/**
 * Render queue status (active order)
 */
function renderQueueStatus(container, queueNumber, queuePosition, queueEstimate) {
    const order = store.getState().activeOrder;

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">حالة الطلب</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Queue Number Display -->
                    <div class="queue-header">
                        <div class="queue-number">${queueNumber || '---'}</div>
                        <div class="queue-label">رقم طلبك</div>
                        <div class="queue-status">
                            <span class="status-dot ${queuePosition <= 2 ? 'warning' : 'success'}"></span>
                            ${queuePosition === 0 ? 'جاهز للاستلام!' : queuePosition === 1 ? 'الأول على الطابور' : `${queuePosition} طلبات قبلك`}
                        </div>
                    </div>

                    <!-- Time Estimate -->
                    <div class="queue-estimate">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">وقت الانتظار المتوقع</div>
                        <div class="queue-estimate-value">${queueEstimate} دقيقة</div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                            ${queuePosition <= 2 ? 'طلبك جاهز قريباً!' : 'نرجو الانتظار، نعمل على طلبك'}
                        </div>
                    </div>

                    <!-- Progress -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-size: 12px; color: var(--text-muted);">التقدم</span>
                                <span style="font-size: 12px; font-weight: 600;">${Math.min(Math.round((5 - queuePosition) / 5 * 100), 100)}%</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar" style="width: ${Math.min(Math.round((5 - queuePosition) / 5 * 100), 100)}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Details -->
                    ${order ? `
                        <div class="card" style="margin-bottom: 20px;">
                            <div class="card-header">
                                <h4>تفاصيل الطلب</h4>
                            </div>
                            <div class="card-body">
                                ${order.items.map(item => `
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                                        <span>${item.quantity} × ${item.name}</span>
                                        <span style="color: var(--text-muted);">${formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                `).join('')}
                                <div class="divider"></div>
                                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                                    <span>الإجمالي</span>
                                    <span style="color: var(--color-primary);">${formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Payment Info -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-body" style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                ${order?.paymentMethod === 'cash' ? '💵' : '💳'}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: var(--text-muted);">طريقة الدفع</div>
                                <div style="font-weight: 600;">
                                    ${order?.paymentMethod === 'cash' ? 'نقداً عند الاستلام' : 'مدفوع إلكترونياً'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div class="card" style="background: rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.2);">
                        <div class="card-body">
                            <div style="font-size: 14px; line-height: 1.6;">
                                <strong>تعليمات الاستلام:</strong><br>
                                1. انتظر إعلان رقم طلبك على الشاشة<br>
                                2. توجه إلى كاونتر الاستلام<br>
                                3. أظهر رقم طلبك للموظف<br>
                                4. استلم طلبك واستمتع!
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-secondary btn-block" data-action="new-order">
                            ➕ طلب جديد
                        </button>
                        ${queuePosition <= 1 ? `
                            <button class="btn btn-primary btn-block" data-action="notify">
                                🔔 أعلن عن وصولي
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelector('[data-action="back"]')?.addEventListener('click', () => navigate('menu'));
    container.querySelector('[data-action="new-order"]')?.addEventListener('click', () => {
        store.set({
            queueNumber: null,
            queuePosition: null,
            queueEstimate: null,
            activeOrder: null,
            cart: [],
        });
        navigate('landing');
    });
    container.querySelector('[data-action="notify"]')?.addEventListener('click', () => {
        showToast('تم إشعار الموظف بوصولك', 'success');
    });
}

/**
 * Update cart badge
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
        void badge.offsetWidth;
        badge.classList.add('badge-bounce');
    } else if (badge) {
        badge.remove();
    }
}
