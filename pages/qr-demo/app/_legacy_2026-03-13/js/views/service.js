/**
 * Service View
 * Request waiters, water, napkins, bill, etc.
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../config.js';
import { formatRelativeTime, showToast } from '../utils/helpers.js';

export function renderService(container) {
    const state = store.getState();
    const serviceRequests = state.serviceRequests;
    const pendingRequests = serviceRequests.filter(r => r.status === 'pending');

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">خدمة الطاولة</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    ${state.mode === 'dine-in' ? `
                        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
                            طاولة ${state.table} • اختر الخدمة التي تحتاجها
                        </p>
                    ` : ''}

                    <!-- Service Buttons -->
                    <div class="service-grid">
                        ${Object.entries(SERVICE_TYPE_LABELS).map(([type, info]) => `
                            <button class="service-btn ${pendingRequests.some(r => r.type === type) ? 'active' : ''}" data-type="${type}">
                                <div class="service-btn-icon">${info.icon}</div>
                                <div class="service-btn-label">${info.label}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="page-footer">
                <div class="container">
                    ${state.mode === 'dine-in' ? `
                        <button class="btn btn-secondary btn-block" data-action="bill">
                            🧾 طلب الفاتورة
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-block" data-action="back">
                            العودة للقائمة
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    // Back button
    container.querySelector('[data-action="back"]')?.addEventListener('click', () => navigate('menu'));

    // Bill button (dine-in)
    container.querySelector('[data-action="bill"]')?.addEventListener('click', () => {
        actions.addServiceRequest(SERVICE_TYPES.BILL);
        showToast('تم طلب الفاتورة، سيأتي النادل قريباً', 'success');
        reRenderService();
    });

    // Service buttons
    container.querySelectorAll('.service-btn').forEach(btn => {
        const type = btn.dataset.type;
        const info = SERVICE_TYPE_LABELS[type];

        // Check if there's already a pending request of this type
        const hasPending = pendingRequests.some(r => r.type === type);

        btn.addEventListener('click', () => {
            if (hasPending) {
                showToast('لديك طلب ${info.label} قيد المعالجة بالفعل', 'warning');
                return;
            }

            if (type === SERVICE_TYPES.ISSUE || type === SERVICE_TYPES.COMPLIMENT || type === SERVICE_TYPES.OTHER) {
                // These require additional input
                showNoteModal(type);
            } else {
                actions.addServiceRequest(type);
                showToast(`تم طلب ${info.label}، سيأتي النادل قريباً`, 'success');
                reRenderService();
            }
        });
    });
}

/**
 * Render single service request
 */
function renderServiceRequest(request) {
    const info = SERVICE_TYPE_LABELS[request.type];
    const isPending = request.status === 'pending';
    const isCompleted = request.status === 'completed';

    return `
        <div class="service-request-item ${isPending ? 'pending' : ''}">
            <div style="font-size: 24px;">${info.icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600;">${info.label}</div>
                ${request.note ? `<div style="font-size: 12px; color: var(--text-secondary);">${request.note}</div>` : ''}
                <div style="font-size: 12px; color: var(--text-muted);">${formatRelativeTime(request.createdAt)}</div>
            </div>
            <div>
                ${isPending ? `
                    <span class="badge badge-warning">قيد الانتظار</span>
                ` : isCompleted ? `
                    <span class="badge badge-success">✓ تم</span>
                ` : `
                    <span class="badge">تم</span>
                `}
            </div>
        </div>
    `;
}

/**
 * Show note modal for issue/compliment/other
 */
function showNoteModal(type) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const titles = {
        [SERVICE_TYPES.ISSUE]: 'بلغ عن مشكلة',
        [SERVICE_TYPES.COMPLIMENT]: 'أرسل مديح',
        [SERVICE_TYPES.OTHER]: 'أرسل رسالة',
    };

    const placeholders = {
        [SERVICE_TYPES.ISSUE]: 'صف المشكلة التي واجهتها...',
        [SERVICE_TYPES.COMPLIMENT]: 'اكتب ملاحظاتك الإيجابية هنا...',
        [SERVICE_TYPES.OTHER]: 'اكتب رسالتك هنا...',
    };

    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${titles[type]}</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <textarea
                    id="service-note"
                    placeholder="${placeholders[type]}"
                    rows="4"
                    style="width: 100%; resize: none;"
                ></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary btn-block" id="submit-note">
                    إرسال
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const textarea = overlay.querySelector('#service-note');
    textarea.focus();

    // Submit
    overlay.querySelector('#submit-note').addEventListener('click', () => {
        const note = textarea.value.trim();
        if (!note) {
            showToast('الرجاء كتابة ملاحظة', 'warning');
            return;
        }

        actions.addServiceRequest(type, note);
        showToast('تم إرسال طلبك، شكراً لتواصلك معنا', 'success');

        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            reRenderService();
        }, 300);
    });

    // Close
    overlay.querySelector('.modal-close').addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

/**
 * Re-render service page
 */
function reRenderService() {
    const container = document.getElementById('app');
    renderService(container);
}
