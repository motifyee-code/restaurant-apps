/**
 * Main Entry Point
 * Initializes the application
 */

import { router } from './router.js';
import { store, selectors } from './state.js';
import { RESTAURANT } from './config.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    // Set document title
    document.title = RESTAURANT.name;

    // Check for existing session
    checkSession();

    // Initialize router
    router.init();

    // Subscribe to state changes for debugging/logging
    store.subscribe((state, oldState) => {
        console.log('State changed:', {
            page: state.currentPage,
            mode: state.mode,
            cartCount: state.cart.length,
            queueNumber: state.queueNumber,
        });
    });

    // Add keyboard shortcuts
    setupKeyboardShortcuts();

    // Handle visibility change (pause/resume)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    console.log('QR Ordering Demo initialized');
}

/**
 * Check for existing session
 */
function checkSession() {
    // Check URL params for demo mode
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const table = params.get('table');

    if (mode) {
        store.set({
            mode: mode,
            table: table ? parseInt(table) : null,
            currentPage: 'menu',
        });
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape: close modal or go back
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }

        // Ctrl/Cmd + B: Go to cart
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            const cartCount = selectors.getCartCount();
            if (cartCount > 0) {
                router.navigate('cart');
            }
        }
    });
}

/**
 * Handle visibility change (app background/foreground)
 */
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('App went to background');
        // Could pause real-time updates here
    } else {
        console.log('App came to foreground');
        // Resume real-time updates
        const activeOrder = selectors.getActiveOrder();
        if (activeOrder) {
            console.log('Refreshing order status...');
            // In real app, would fetch latest status
        }
    }
}

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export for debugging
if (import.meta.env.DEV) {
    window.__QR_DEMO__ = {
        store,
        router,
        selectors,
    };
    console.log('QR Demo Dev Tools: window.__QR_DEMO__');
}
