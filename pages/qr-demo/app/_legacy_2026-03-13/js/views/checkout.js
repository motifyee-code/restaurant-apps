/**
 * Checkout View
 * Payment, split bill, and order submission
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import {
    RESTAURANT,
    PAYMENT_METHODS,
    PAYMENT_METHOD_LABELS,
    APP_SETTINGS,
    QUEUE_SETTINGS,
} from '../config.js';
import { formatPrice, generateOrderNumber, generateQueueNumber, showToast } from '../utils/helpers.js';

export function renderCheckout(container) {
    const state = store.getState();
    const cart = state.cart;
    const subtotal = selectors.getCartTotal();
    const tax = Math.round(subtotal * RESTAURANT.taxRate);

    let tip = 0;
    let tipPercent = 0;
    let selectedPaymentMethod = PAYMENT_METHODS.CASH;
    let splitMode = 'full'; // 'full', 'per-person', 'per-item'
    let splitCount = 1;

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">إتمام الطلب</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    <!-- Order Summary -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h4>ملخص الطلب</h4>
                        </div>
                        <div class="card-body">
                            ${cart.map(item => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                                    <span>${item.quantity} × ${item.name}</span>
                                    <span>${formatPrice(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}

                            <div class="divider"></div>

                            <div class="cart-summary-row">
                                <span style="color: var(--text-secondary);">المجموع الفرعي</span>
                                <span>${formatPrice(subtotal)}</span>
                            </div>
                            <div class="cart-summary-row">
                                <span style="color: var(--text-secondary);">الضريبة (15%)</span>
                                <span>${formatPrice(tax)}</span>
                            </div>
                            <div class="cart-summary-row" id="tip-row" style="display: none;">
                                <span style="color: var(--text-secondary);">إكرامية (${tipPercent}%)</span>
                                <span id="tip-amount">${formatPrice(tip)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tipping Section -->
                    ${APP_SETTINGS.enableTipping && state.mode === 'dine-in' ? `
                        <div class="card" style="margin-bottom: 20px;">
                            <div class="card-header">
                                <h4>إكرامية للموظفين (اختياري)</h4>
                            </div>
                            <div class="card-body">
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button class="chip tip-btn active" data-tip="0">لا شكراً</button>
                                    ${APP_SETTINGS.tippingOptions.map(percent => `
                                        <button class="chip tip-btn" data-tip="${percent}">${percent}%</button>
                                    `).join('')}
                                    <button class="chip tip-btn" data-tip="custom">مخصص</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Payment Method -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h4>طريقة الدفع</h4>
                        </div>
                        <div class="card-body">
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${Object.entries(PAYMENT_METHOD_LABELS).map(([method, info]) => `
                                    <label class="radio-label payment-method" style="padding: 12px; background: var(--bg-secondary); border-radius: 12px; cursor: pointer;">
                                        <input type="radio" name="payment" value="${method}" ${method === selectedPaymentMethod ? 'checked' : ''} class="radio-input">
                                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                            <span style="font-size: 24px;">${info.icon}</span>
                                            <div>
                                                <div style="font-weight: 600;">${info.label}</div>
                                                ${method === PAYMENT_METHODS.CASH && state.mode === 'queue'
                                                    ? '<div style="font-size: 12px; color: var(--text-muted);">الدفع عند الاستلام</div>'
                                                    : ''
                                                }
                                            </div>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Split Bill (Dine-in only) -->
                    ${state.mode === 'dine-in' && APP_SETTINGS.enableSplitBill ? `
                        <div class="card" style="margin-bottom: 20px;">
                            <div class="card-header">
                                <h4>تقسيم الفاتورة</h4>
                            </div>
                            <div class="card-body">
                                <select id="split-mode" style="margin-bottom: 12px;">
                                    <option value="full">دفع الفاتورة كاملة</option>
                                    <option value="per-person">تقسيم على عدد الأشخاص</option>
                                    <option value="per-item">دفع أصناف محددة</option>
                                </select>

                                <div id="split-count-container" style="display: none;">
                                    <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; display: block;">عدد الأشخاص</label>
                                    <div class="counter" style="width: fit-content;">
                                        <button class="counter-btn" id="split-decrease">−</button>
                                        <span class="counter-value" id="split-count">${splitCount}</span>
                                        <button class="counter-btn" id="split-increase">+</button>
                                    </div>
                                </div>

                                <div id="split-per-person-total" style="display: none; margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-align: center;">
                                    <div style="font-size: 12px; color: var(--text-secondary);">المبلغ لكل شخص</div>
                                    <div style="font-size: 20px; font-weight: bold; color: var(--color-primary);" id="per-person-amount">${formatPrice(0)}</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Notes -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h4>ملاحظات الطلب</h4>
                        </div>
                        <div class="card-body">
                            <textarea
                                id="order-notes"
                                placeholder="أضف ملاحظاتك هنا... (أي حساسية، مفضل، إلخ)"
                                rows="3"
                                style="width: 100%; resize: none;"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer with Total -->
            <div class="page-footer">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">الإجمالي</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--color-primary);" id="total-amount">${formatPrice(subtotal + tax)}</div>
                        </div>
                        ${state.mode === 'queue' ? `
                            <div style="text-align: left;">
                                <div style="font-size: 12px; color: var(--text-secondary);">وقت التحضير المتوقع</div>
                                <div style="font-size: 16px; font-weight: 600;">${APP_SETTINGS.estimatedPrepTime - 5} - ${APP_SETTINGS.estimatedPrepTime} دقيقة</div>
                            </div>
                        ` : ''}
                    </div>

                    <button class="btn btn-primary btn-block btn-lg" id="submit-order" data-action="submit">
                        ${state.mode === 'queue' ? 'أكد الطلب وادفع' : 'أكد الطلب'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // ===== Event Listeners =====

    // Back button
    container.querySelector('[data-action="back"]').addEventListener('click', () => navigate('cart'));

    // Tip buttons
    container.querySelectorAll('.tip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tipValue = btn.dataset.tip;
            if (tipValue === 'custom') {
                const customTip = prompt('أدخل مبلغ الإكرامية:');
                if (customTip && !isNaN(customTip)) {
                    tip = parseInt(customTip);
                    tipPercent = 0;
                } else {
                    tip = 0;
                    tipPercent = 0;
                }
            } else if (tipValue === '0') {
                tip = 0;
                tipPercent = 0;
            } else {
                tipPercent = parseInt(tipValue);
                tip = Math.round(subtotal * (tipPercent / 100));
            }

            updateTotals();
        });
    });

    // Payment method selection
    container.querySelectorAll('.payment-method input').forEach(input => {
        input.addEventListener('change', () => {
            selectedPaymentMethod = input.value;
        });
    });

    // Split bill mode
    const splitModeSelect = container.querySelector('#split-mode');
    if (splitModeSelect) {
        splitModeSelect.addEventListener('change', () => {
            splitMode = splitModeSelect.value;
            const splitCountContainer = container.querySelector('#split-count-container');
            const splitPerPersonTotal = container.querySelector('#split-per-person-total');

            if (splitMode === 'per-person') {
                splitCountContainer.style.display = 'block';
                splitPerPersonTotal.style.display = 'block';
            } else {
                splitCountContainer.style.display = 'none';
                splitPerPersonTotal.style.display = 'none';
            }

            updateTotals();
        });
    }

    // Split count controls
    const splitIncrease = container.querySelector('#split-increase');
    const splitDecrease = container.querySelector('#split-decrease');
    if (splitIncrease && splitDecrease) {
        splitIncrease.addEventListener('click', () => {
            splitCount = Math.min(splitCount + 1, cart.length);
            container.querySelector('#split-count').textContent = splitCount;
            updateTotals();
        });

        splitDecrease.addEventListener('click', () => {
            splitCount = Math.max(splitCount - 1, 1);
            container.querySelector('#split-count').textContent = splitCount;
            updateTotals();
        });
    }

    // Submit order
    container.querySelector('[data-action="submit"]').addEventListener('click', async () => {
        const btn = container.querySelector('#submit-order');
        const notes = container.querySelector('#order-notes')?.value || '';

        // Show loading
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create order
        const orderTotal = subtotal + tax + tip;
        const orderData = {
            items: cart,
            subtotal,
            tax,
            tip,
            total: orderTotal,
            paymentMethod: selectedPaymentMethod,
            notes,
            table: state.mode === 'dine-in' ? state.table : null,
            splitMode: splitMode !== 'full' ? splitMode : null,
            splitCount: splitMode === 'per-person' ? splitCount : null,
        };

        if (state.mode === 'queue') {
            // Queue mode: generate queue number
            const queueNumber = generateQueueNumber(QUEUE_SETTINGS.orderPrefix);
            const queuePosition = Math.floor(Math.random() * 5) + 1;
            const queueEstimate = queuePosition * QUEUE_SETTINGS.avgPrepTime;

            store.setQueueInfo(queueNumber, queuePosition, queueEstimate);

            // Simulate order status updates
            simulateQueueUpdates(queuePosition);

            navigate('queue');
        } else {
            // Dine-in mode: create table order
            actions.submitOrder(orderData);

            // Simulate order status updates
            simulateOrderStatus();
        }

        showToast('تم استلام طلبك بنجاح!', 'success');
    });

    /**
     * Update totals display
     */
    function updateTotals() {
        const total = subtotal + tax + tip;
        container.querySelector('#total-amount').textContent = formatPrice(total);

        const tipRow = container.querySelector('#tip-row');
        const tipAmount = container.querySelector('#tip-amount');
        if (tip > 0 && tipRow) {
            tipRow.style.display = 'flex';
            tipAmount.textContent = formatPrice(tip);
        } else if (tipRow) {
            tipRow.style.display = 'none';
        }

        // Per person total
        const perPersonAmount = container.querySelector('#per-person-amount');
        if (perPersonAmount && splitMode === 'per-person' && splitCount > 1) {
            perPersonAmount.textContent = formatPrice(Math.ceil(total / splitCount));
        }
    }

    /**
     * Simulate order status updates (dine-in)
     */
    function simulateOrderStatus() {
        const timeline = [
            { status: 'confirmed', delay: 2000, label: 'تم تأكيد الطلب' },
            { status: 'preparing', delay: 5000, label: 'جاري التحضير' },
            { status: 'ready', delay: 15000, label: 'جاهز للتقديم' },
        ];

        timeline.forEach(({ status, delay, label }) => {
            setTimeout(() => {
                actions.updateOrderStatus(status);
                showToast(label, 'info');
            }, delay);
        });
    }

    /**
     * Simulate queue position updates
     */
    function simulateQueueUpdates(initialPosition) {
        let position = initialPosition;

        const updateInterval = setInterval(() => {
            position--;
            if (position <= 0) {
                clearInterval(updateInterval);
                actions.updateOrderStatus('ready');
                showToast('طلبك جاهز للاستلام!', 'success');
            } else {
                actions.updateQueuePosition(position);
                showToast(`متبقي ${position} طلبات قبل طلبك`, 'info');
            }
        }, 8000);
    }
}
