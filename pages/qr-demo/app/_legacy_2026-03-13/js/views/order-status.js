/**
 * Order Status View
 * Track order status in real-time
 */

import { store, selectors } from '../state.js';
import { navigate } from '../router.js';
import { RESTAURANT, ORDER_STATUS, ORDER_STATUS_LABELS } from '../config.js';
import { formatPrice, formatDateTime } from '../utils/helpers.js';

export function renderOrderStatus(container) {
    const state = store.getState();
    const order = state.activeOrder;

    if (!order) {
        renderNoOrder(container);
        return;
    }

    const statusSteps = [
        { key: ORDER_STATUS.PENDING, label: 'انتظار', icon: '📝' },
        { key: ORDER_STATUS.CONFIRMED, label: 'تم التأكيد', icon: '✓' },
        { key: ORDER_STATUS.PREPARING, label: 'جاري التحضير', icon: '👨‍🍳' },
        { key: ORDER_STATUS.READY, label: 'جاهز', icon: '🔔' },
        { key: ORDER_STATUS.DELIVERED, label: 'تم التقديم', icon: '✅' },
    ];

    const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <div class="header-logo">حالة الطلب</div>
                    <div style="font-size: 14px; color: var(--text-muted);">#${order.id.slice(-6).toUpperCase()}</div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Status Header -->
                    <div class="order-status-header">
                        <div class="order-status-icon">${getStatusIcon(order.status)}</div>
                        <h2 class="order-status-title">${getStatusTitle(order.status)}</h2>
                        <p class="order-status-subtitle">${getStatusMessage(order.status)}</p>
                    </div>

                    <!-- Timeline -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-body">
                            <div class="order-timeline">
                                ${statusSteps.map((step, index) => {
                                    const isCompleted = index < currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;
                                    const isPending = index > currentStatusIndex;

                                    return `
                                        <div class="order-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}">
                                            <div class="order-timeline-dot">
                                                ${isCompleted ? '✓' : step.icon}
                                            </div>
                                            <div class="order-timeline-content">
                                                <div class="order-timeline-title">${step.label}</div>
                                                ${isCompleted || isCurrent ? `
                                                    <div class="order-timeline-time">
                                                        ${index === currentStatusIndex ? 'الآن' : 'تم'}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Order Details -->
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

                    ${order.notes ? `
                        <div class="card" style="margin-bottom: 20px;">
                            <div class="card-body">
                                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">ملاحظات</div>
                                <div style="font-size: 14px;">${order.notes}</div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Actions -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-secondary btn-block" data-action="service">
                            🔔 طلب خدمة
                        </button>
                        ${order.status === ORDER_STATUS.READY || order.status === ORDER_STATUS.DELIVERED ? `
                            <button class="btn btn-primary btn-block" data-action="new-order">
                                ➕ طلب جديد
                            </button>
                        ` : ''}
                        ${order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED ? `
                            <button class="btn btn-ghost btn-block" data-action="cancel" style="color: var(--color-error);">
                                ✕ إلغاء الطلب
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelector('[data-action="service"]')?.addEventListener('click', () => navigate('service'));
    container.querySelector('[data-action="new-order"]')?.addEventListener('click', () => {
        store.set({ activeOrder: null });
        navigate('menu');
    });
    container.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من إلغاء الطلب؟')) {
            store.set({ activeOrder: null });
            navigate('menu');
        }
    });
}

/**
 * Render no order state
 */
function renderNoOrder(container) {
    container.innerHTML = `
        <div class="page">
            <div class="page-content">
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3 class="empty-state-title">لا يوجد طلب نشط</h3>
                        <p class="empty-state-desc">لم تقم بإرسال أي طلب بعد. ابدأ بتصفح القائمة.</p>
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

    container.querySelector('[data-action="browse"]').addEventListener('click', () => navigate('menu'));
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
    const icons = {
        [ORDER_STATUS.PENDING]: '📝',
        [ORDER_STATUS.CONFIRMED]: '✓',
        [ORDER_STATUS.PREPARING]: '👨‍🍳',
        [ORDER_STATUS.READY]: '🔔',
        [ORDER_STATUS.DELIVERED]: '✅',
        [ORDER_STATUS.CANCELLED]: '✕',
    };
    return icons[status] || '📝';
}

/**
 * Get status title
 */
function getStatusTitle(status) {
    const titles = {
        [ORDER_STATUS.PENDING]: 'تم استلام طلبك',
        [ORDER_STATUS.CONFIRMED]: 'تم تأكيد الطلب',
        [ORDER_STATUS.PREPARING]: 'جاري التحضير',
        [ORDER_STATUS.READY]: 'طلبك جاهز!',
        [ORDER_STATUS.DELIVERED]: 'تم التقديم',
        [ORDER_STATUS.CANCELLED]: 'تم إلغاء الطلب',
    };
    return titles[status] || 'حالة الطلب';
}

/**
 * Get status message
 */
function getStatusMessage(status) {
    const messages = {
        [ORDER_STATUS.PENDING]: 'نحن نراجع طلبك الآن',
        [ORDER_STATUS.CONFIRMED]: 'تم تأكيد الطلب وسيبدأ التحضير قريباً',
        [ORDER_STATUS.PREPARING]: 'طاهينا يعد طلبك بعناية',
        [ORDER_STATUS.READY]: 'طلبك جاهز! استمتع',
        [ORDER_STATUS.DELIVERED]: 'تم تقديم طلبك، بالهنا والشفا!',
        [ORDER_STATUS.CANCELLED]: 'تم إلغاء الطلب',
    };
    return messages[status] || '';
}
