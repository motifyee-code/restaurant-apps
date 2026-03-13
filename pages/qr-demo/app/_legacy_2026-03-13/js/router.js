/**
 * Simple Router
 * Handles page navigation and rendering
 */

import { store, selectors } from './state.js';
import { renderLanding } from './views/landing.js';
import { renderMenu } from './views/menu.js';
import { renderCart } from './views/cart.js';
import { renderCheckout } from './views/checkout.js';
import { renderOrderStatus } from './views/order-status.js';
import { renderService } from './views/service.js';
import { renderQueue } from './views/queue.js';
import { renderWaitlist } from './views/waitlist.js';

// Page renderers mapping
const pageRenderers = {
    'landing': renderLanding,
    'menu': renderMenu,
    'cart': renderCart,
    'checkout': renderCheckout,
    'order-status': renderOrderStatus,
    'service': renderService,
    'queue': renderQueue,
    'waitlist': renderWaitlist,
};

/**
 * Router class
 */
class Router {
    constructor() {
        this.app = document.getElementById('app');
        this.currentPage = null;
    }

    /**
     * Navigate to a page
     */
    navigate(page, params = {}) {
        // Store navigation params
        this.params = params;

        // Update state
        store.set({ currentPage: page });

        // Render new page
        this.renderPage(page);
    }

    /**
     * Render a page
     */
    renderPage(page) {
        const renderer = pageRenderers[page];
        if (!renderer) {
            console.error(`Page not found: ${page}`);
            return;
        }

        // Clear app
        this.app.innerHTML = '';

        // Render new page
        renderer(this.app, this.params);

        // Update current page
        this.currentPage = page;

        // Scroll to top
        window.scrollTo(0, 0);
    }

    /**
     * Go back
     */
    back() {
        // Simple back navigation - in real app would use history
        const pageMap = {
            'menu': 'landing',
            'cart': 'menu',
            'checkout': 'cart',
            'order-status': 'menu',
            'service': 'menu',
            'queue': 'landing',
            'waitlist': 'landing',
        };
        this.navigate(pageMap[this.currentPage] || 'landing');
    }

    /**
     * Initialize router
     */
    init() {
        // Subscribe to state changes
        store.subscribe((state, oldState) => {
            if (state.currentPage !== oldState?.currentPage) {
                this.renderPage(state.currentPage);
            }
        });

        // Render initial page
        this.renderPage(selectors.getCurrentPage());
    }
}

// Create singleton instance
export const router = new Router();

// Export navigate function for convenience
export const navigate = (page, params) => router.navigate(page, params);
export const goBack = () => router.back();
