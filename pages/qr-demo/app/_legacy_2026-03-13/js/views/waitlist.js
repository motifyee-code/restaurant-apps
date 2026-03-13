/**
 * Waitlist View
 * Walk-In Waitlist Mode - Virtual queue for table reservations
 */

import { store, selectors, actions } from '../state.js';
import { navigate } from '../router.js';
import { RESTAURANT, WAITLIST_SETTINGS } from '../config.js';
import { formatDuration, generateQueueNumber, showToast } from '../utils/helpers.js';

export function renderWaitlist(container) {
    const state = store.getState();
    const waitlistInfo = state.waitlistInfo;

    container.innerHTML = `
        <div class="page">
            <!-- Header -->
            <header class="header">
                <div class="container header-content">
                    <button class="icon-btn" data-action="back">→</button>
                    <div class="header-logo">قائمة الانتظار</div>
                    <div style="width: 40px;"></div>
                </div>
            </header>

            <!-- Content -->
            <div class="page-content">
                <div class="container">
                    ${!waitlistInfo ? `
                        <!-- Join Waitlist Form -->
                        <div class="waitlist-join fade-in-up">
                            <div class="waitlist-join-header">
                                <div class="waitlist-icon">⏰</div>
                                <h2>انضم لقائمة الانتظار</h2>
                                <p>احجز مكانك في القائمة الافتراضية واستلم طاولة عند دورك</p>
                            </div>

                            <!-- Current Wait Info -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-body">
                                    <div class="waitlist-stats">
                                        <div class="waitlist-stat">
                                            <div class="waitlist-stat-value">5</div>
                                            <div class="waitlist-stat-label">مجموعات في الانتظار</div>
                                        </div>
                                        <div class="divider"></div>
                                        <div class="waitlist-stat">
                                            <div class="waitlist-stat-value">15-20</div>
                                            <div class="waitlist-stat-label">دقيقة تقريباً</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Party Size Selection -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4>عدد الأشخاص</h4>
                                </div>
                                <div class="card-body">
                                    <div class="party-size-selector">
                                        ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `
                                            <button class="party-size-btn" data-size="${n}">${n}</button>
                                        `).join('')}
                                        <button class="party-size-btn" data-size="9">9+</button>
                                    </div>
                                    <div id="selected-party-size" style="text-align: center; margin-top: 12px; color: var(--text-secondary); font-size: 14px;">
                                        اختر عدد الأشخاص
                                    </div>
                                </div>
                            </div>

                            <!-- Table Type Preferences -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4>تفضيلات الطاولة (اختياري)</h4>
                                </div>
                                <div class="card-body">
                                    <div class="table-preferences">
                                        <label class="checkbox-label">
                                            <input type="checkbox" class="checkbox-input" data-pref="indoor">
                                            <span>داخل المطعم</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" class="checkbox-input" data-pref="outdoor">
                                            <span>في الخارج</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" class="checkbox-input" data-pref="booth">
                                            <span> booth (ركن)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Contact Info -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4>معلومات التواصل (اختياري)</h4>
                                </div>
                                <div class="card-body">
                                    <div style="margin-bottom: 12px;">
                                        <label style="display: block; margin-bottom: 4px; font-size: 14px; color: var(--text-secondary);">رقم الجوال</label>
                                        <input
                                            type="tel"
                                            id="waitlist-phone"
                                            placeholder="05xxxxxxxx"
                                            style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 12px; font-size: 16px;"
                                        >
                                    </div>
                                    <p style="font-size: 12px; color: var(--text-muted);">
                                        💡 سنرسل لك إشعاراً عندما يقترب دورك
                                    </p>
                                </div>
                            </div>

                            <!-- Join Button -->
                            <button class="btn btn-primary btn-block btn-lg" id="join-waitlist" disabled>
                                انضم لقائمة الانتظار
                            </button>
                        </div>
                    ` : `
                        <!-- Waitlist Status -->
                        <div class="waitlist-status fade-in-up">
                            <div class="waitlist-status-header">
                                <div class="waitlist-status-icon">✓</div>
                                <h2>تم الانضمام للقائمة</h2>
                                <p>رقمك في القائمة</p>
                                <div class="waitlist-number">${waitlistInfo.ticketNumber}</div>
                            </div>

                            <!-- Position Info -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-body">
                                    <div class="waitlist-position">
                                        <div class="waitlist-position-info">
                                            <div class="waitlist-position-label">موقعك في القائمة</div>
                                            <div class="waitlist-position-value">${waitlistInfo.position}</div>
                                            <div class="waitlist-position-desc">
                                                ${waitlistInfo.position === 1
                                                    ? 'أنت التالي! 🎉'
                                                    : `${waitlistInfo.position - 1} مجموعات قبلك`
                                                }
                                            </div>
                                        </div>
                                        <div class="waitlist-estimate">
                                            <div class="waitlist-estimate-label">الوقت المتوقع</div>
                                            <div class="waitlist-estimate-value">${formatDuration(waitlistInfo.estimateMinutes)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Party Info -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-body">
                                    <div class="waitlist-party-info">
                                        <div class="waitlist-party-item">
                                            <span class="waitlist-party-icon">👥</span>
                                            <span>عدد الأشخاص: ${waitlistInfo.partySize}</span>
                                        </div>
                                        ${waitlistInfo.preferences?.length ? `
                                            <div class="waitlist-party-item">
                                                <span class="waitlist-party-icon">🪑</span>
                                                <span>التفضيلات: ${waitlistInfo.preferences.join('، ')}</span>
                                            </div>
                                        ` : ''}
                                        ${waitlistInfo.phone ? `
                                            <div class="waitlist-party-item">
                                                <span class="waitlist-party-icon">📱</span>
                                                <span>${waitlistInfo.phone}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Live Updates -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4>
                                        <span style="color: var(--color-success);">●</span>
                                        تحديثات مباشرة
                                    </h4>
                                </div>
                                <div class="card-body">
                                    <p style="font-size: 14px; color: var(--text-secondary);">
                                        سنقوم بتحديث موقعك تلقائياً. سيظهر إشعار عندما يقترب دورك.
                                    </p>
                                    <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">آخر تحديث</div>
                                        <div style="font-size: 14px;">منذ دقيقة</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Browse Menu While Waiting -->
                            <div class="card" style="margin-bottom: 20px; border-color: var(--color-primary);">
                                <div class="card-body" style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 4px;">تصفح القائمة أثناء الانتظار</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">اطلب مسبقاً ليكون جاهزاً عند وصولك</div>
                                    </div>
                                    <button class="btn btn-primary" data-action="browse-menu">
                                        القائمة
                                    </button>
                                </div>
                            </div>

                            <!-- Cancel Button -->
                            <button class="btn btn-secondary btn-block" id="cancel-waitlist">
                                إلغاء الانضمام للقائمة
                            </button>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    // Back button
    container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
        store.set({ waitlistInfo: null });
        navigate('landing');
    });

    if (!waitlistInfo) {
        // Party size selection
        let selectedSize = null;
        const sizeButtons = container.querySelectorAll('.party-size-btn');
        const sizeDisplay = container.querySelector('#selected-party-size');
        const joinBtn = container.querySelector('#join-waitlist');

        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = parseInt(btn.dataset.size);
                sizeDisplay.textContent = `عدد الأشخاص: ${selectedSize}`;
                joinBtn.disabled = false;
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = 'var(--color-primary)';
                btn.style.background = 'rgba(99, 102, 241, 0.1)';
            });

            btn.addEventListener('mouseleave', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.background = 'var(--bg-tertiary)';
                }
            });
        });

        // Add CSS for active state
        const style = document.createElement('style');
        style.textContent = `
            .party-size-btn.active {
                background: var(--color-primary) !important;
                color: var(--color-white) !important;
                border-color: var(--color-primary) !important;
            }
        `;
        container.appendChild(style);

        // Join waitlist
        joinBtn.addEventListener('click', () => {
            if (!selectedSize) return;

            const phone = container.querySelector('#waitlist-phone')?.value?.trim();
            const preferences = [];
            container.querySelectorAll('.checkbox-input:checked').forEach(cb => {
                const pref = cb.dataset.pref;
                const labels = { indoor: 'داخل', outdoor: 'خارج', booth: 'ركن' };
                if (labels[pref]) preferences.push(labels[pref]);
            });

            const ticketNumber = generateQueueNumber('W');
            const position = Math.floor(Math.random() * 5) + 1; // Simulated position
            const estimateMinutes = position * 5; // 5 min per group

            actions.setWaitlistInfo({
                ticketNumber,
                position,
                estimateMinutes,
                partySize: selectedSize,
                preferences,
                phone,
                joinedAt: new Date().toISOString(),
            });

            showToast('تم الانضمام لقائمة الانتظار بنجاح!', 'success');
            renderWaitlist(container); // Re-render
        });

    } else {
        // Browse menu button
        container.querySelector('[data-action="browse-menu"]')?.addEventListener('click', () => {
            navigate('menu');
        });

        // Cancel waitlist
        container.querySelector('#cancel-waitlist')?.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من إلغاء انضمامك لقائمة الانتظار؟')) {
                store.set({ waitlistInfo: null });
                showToast('تم إلغاء انضمامك لقائمة الانتظار', 'info');
                renderWaitlist(container); // Re-render
            }
        });
    }
}
