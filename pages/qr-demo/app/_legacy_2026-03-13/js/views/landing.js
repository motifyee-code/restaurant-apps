/**
 * Landing View
 * Mode selection page (Dine-In vs Queue)
 */

import { actions } from '../state.js';
import { navigate } from '../router.js';
import { RESTAURANT, AVAILABLE_TABLES } from '../config.js';

export function renderLanding(container) {
	container.innerHTML = `
        <div class="landing">
            <div class="landing-content fade-in-up">
                <div class="landing-icon float pulse-glow">
                    <span>📱</span>
                </div>
                <h1 class="landing-title" style="font-family: var(--font-family-serif); font-size: 3rem; margin-bottom: 0.5rem;">نظام الطلب الذكي</h1>
                <p class="landing-subtitle">
                    مرحباً بك في ${RESTAURANT.name}
                    <br>
                    اختر وضعك للبدء
                </p>

                <div class="landing-modes">
                    <button class="landing-mode fade-in-up stagger-1" data-mode="dine-in">
                        <div class="landing-mode-icon">🍽️</div>
                        <div class="landing-mode-title">الأكل في المطعم</div>
                        <div class="landing-mode-desc">اطلب من طاولتك مباشرة</div>
                    </button>

                    <button class="landing-mode fade-in-up stagger-2" data-mode="queue">
                        <div class="landing-mode-icon">🎫</div>
                        <div class="landing-mode-title">الطابور والاستلام</div>
                        <div class="landing-mode-desc">اطلب وانتظر الاستلام من الكاونتر</div>
                    </button>

                    <button class="landing-mode fade-in-up stagger-3" data-mode="waitlist">
                        <div class="landing-mode-icon">⏰</div>
                        <div class="landing-mode-title">قائمة الانتظار</div>
                        <div class="landing-mode-desc">احجز طاولة وانضم للقائمة الافتراضية</div>
                    </button>
                </div>
            </div>
        </div>

    `;

	// Add event listeners
	container.querySelectorAll('.landing-mode').forEach(btn => {
		btn.addEventListener('click', () => {
			const mode = btn.dataset.mode;
			if (mode === 'dine-in') {
				showTableModal();
			} else if (mode === 'queue') {
				actions.setMode('queue');
				navigate('queue');
			} else if (mode === 'waitlist') {
				actions.setMode('waitlist');
				navigate('waitlist');
			}
		});
	});
}

/**
 * Show table selection modal
 */
function showTableModal() {
	const overlay = document.createElement('div');
	overlay.className = 'modal-overlay';
	overlay.innerHTML = `
        <div class="modal" style="max-width: 400px; margin: auto; border-radius: 24px; transform: translateY(0);">
            <div class="modal-header">
                <h3 style="font-family: var(--font-family-serif); color: var(--text-gold); font-size: 1.5rem;">اختر طاولتك</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 20px; color: var(--text-secondary);">
                    امسح رمز QR الموجود على طاولتك، أو اختر رقم الطاولة يدوياً:
                </p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                    ${AVAILABLE_TABLES.map(
											table => `
                        <button class="table-btn" data-table="${table}"
                            style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
                                   background: var(--bg-tertiary); border: 2px solid var(--border-color);
                                   border-radius: 12px; font-weight: 600; cursor: pointer;
                                   transition: all 0.2s;">
                            ${table}
                        </button>
                    `,
										).join('')}
                </div>
            </div>
        </div>
    `;

	document.body.appendChild(overlay);
	requestAnimationFrame(() => overlay.classList.add('active'));

	// Close button
	overlay.querySelector('.modal-close').addEventListener('click', () => {
		overlay.classList.remove('active');
		setTimeout(() => overlay.remove(), 300);
	});

	// Table selection
	overlay.querySelectorAll('.table-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const table = parseInt(btn.dataset.table);
			actions.setMode('dine-in', table);
			overlay.classList.remove('active');
			setTimeout(() => {
				overlay.remove();
				navigate('menu');
			}, 300);
		});

		btn.addEventListener('mouseenter', () => {
			btn.style.borderColor = 'var(--color-primary)';
			btn.style.background = 'rgba(99, 102, 241, 0.1)';
		});

		btn.addEventListener('mouseleave', () => {
			btn.style.borderColor = 'var(--border-color)';
			btn.style.background = 'var(--bg-tertiary)';
		});
	});

	// Close on overlay click
	overlay.addEventListener('click', e => {
		if (e.target === overlay) {
			overlay.classList.remove('active');
			setTimeout(() => overlay.remove(), 300);
		}
	});
}
