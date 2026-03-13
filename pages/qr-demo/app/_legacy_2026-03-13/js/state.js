/**
 * State Management
 * Simple state management with subscribers
 */

// Initial State
const initialState = {
    // App Mode: 'dine-in', 'queue', or 'waitlist'
    mode: null,
    table: null,

    // Current Page
    currentPage: 'landing',

    // Cart Items
    cart: [],

    // Active Order (after checkout)
    activeOrder: null,

    // Service Requests
    serviceRequests: [],

    // Selected Category
    selectedCategory: null,

    // Currently Viewing Item
    selectedItem: null,

    // Queue Info
    queueNumber: null,
    queuePosition: null,
    queueEstimate: null,

    // Waitlist Info
    waitlistInfo: null,

    // Loading States
    isLoading: false,
    isSubmitting: false,
};

// State Store
class StateStore {
    #state = { ...initialState };
    #subscribers = [];

    /**
     * Get current state
     */
    getState() {
        return this.#state;
    }

    /**
     * Get a specific value from state
     */
    get(key) {
        return this.#state[key];
    }

    /**
     * Update state with new values
     */
    set(updates) {
        const oldState = { ...this.#state };
        this.#state = { ...this.#state, ...updates };
        this.#notify(oldState);
    }

    /**
     * Reset state to initial
     */
    reset() {
        const oldState = { ...this.#state };
        this.#state = { ...initialState };
        this.#notify(oldState);
    }

    /**
     * Subscribe to state changes
     * Returns unsubscribe function
     */
    subscribe(callback) {
        this.#subscribers.push(callback);
        return () => {
            this.#subscribers = this.#subscribers.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all subscribers of state change
     */
    #notify(oldState) {
        for (const callback of this.#subscribers) {
            try {
                callback(this.#state, oldState);
            } catch (error) {
                console.error('State subscriber error:', error);
            }
        }
    }

    // ===== Cart Actions =====

    /**
     * Add item to cart
     */
    addToCart(item, quantity = 1, modifiers = []) {
        const cart = [...this.#state.cart];
        const existingIndex = cart.findIndex(
            cartItem => cartItem.id === item.id &&
            JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
        );

        if (existingIndex >= 0) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity,
                modifiers,
            });
        }

        this.set({ cart });
    }

    /**
     * Update cart item quantity
     */
    updateCartItem(index, quantity) {
        const cart = [...this.#state.cart];
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
        this.set({ cart });
    }

    /**
     * Remove item from cart
     */
    removeFromCart(index) {
        const cart = [...this.#state.cart];
        cart.splice(index, 1);
        this.set({ cart });
    }

    /**
     * Clear cart
     */
    clearCart() {
        this.set({ cart: [] });
    }

    /**
     * Get cart total
     */
    getCartTotal() {
        return this.#state.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            const modifiersTotal = (item.modifiers || []).reduce((mSum, m) => mSum + (m.price || 0), 0);
            return sum + (itemTotal + modifiersTotal * item.quantity);
        }, 0);
    }

    /**
     * Get cart items count
     */
    getCartCount() {
        return this.#state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // ===== Service Request Actions =====

    /**
     * Add service request
     */
    addServiceRequest(type, note = '') {
        const request = {
            id: Date.now().toString(),
            type,
            note,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        this.set({
            serviceRequests: [...this.#state.serviceRequests, request]
        });
        return request;
    }

    /**
     * Update service request status
     */
    updateServiceRequest(id, status) {
        const requests = this.#state.serviceRequests.map(req =>
            req.id === id ? { ...req, status } : req
        );
        this.set({ serviceRequests: requests });
    }

    // ===== Order Actions =====

    /**
     * Set active order
     */
    setActiveOrder(order) {
        this.set({ activeOrder: order });
    }

    /**
     * Update order status
     */
    updateOrderStatus(status) {
        if (this.#state.activeOrder) {
            this.set({
                activeOrder: { ...this.#state.activeOrder, status }
            });
        }
    }

    // ===== Queue Actions =====

    /**
     * Set queue info
     */
    setQueueInfo(number, position, estimate) {
        this.set({
            queueNumber: number,
            queuePosition: position,
            queueEstimate: estimate,
        });
    }

    /**
     * Update queue position
     */
    updateQueuePosition(position) {
        if (this.#state.queuePosition !== null) {
            const estimate = position * 5; // 5 min per order ahead
            this.set({
                queuePosition: position,
                queueEstimate: estimate,
            });
        }
    }

    // ===== Waitlist Actions =====

    /**
     * Set waitlist info
     */
    setWaitlistInfo(info) {
        this.set({ waitlistInfo: info });
    }

    /**
     * Update waitlist position
     */
    updateWaitlistPosition(position, estimateMinutes) {
        if (this.#state.waitlistInfo) {
            this.set({
                waitlistInfo: {
                    ...this.#state.waitlistInfo,
                    position,
                    estimateMinutes,
                }
            });
        }
    }

    /**
     * Clear waitlist info
     */
    clearWaitlistInfo() {
        this.set({ waitlistInfo: null });
    }
}

// Create singleton instance
export const store = new StateStore();

// Convenience selectors
export const selectors = {
    // App mode
    getMode: () => store.get('mode'),
    getTable: () => store.get('table'),
    getCurrentPage: () => store.get('currentPage'),

    // Cart
    getCart: () => store.get('cart'),
    getCartTotal: () => store.getCartTotal(),
    getCartCount: () => store.getCartCount(),
    getCartIsEmpty: () => store.get('cart').length === 0,

    // Order
    getActiveOrder: () => store.get('activeOrder'),
    getOrderStatus: () => store.get('activeOrder')?.status,

    // Service
    getServiceRequests: () => store.get('serviceRequests'),
    getPendingServiceRequests: () => store.get('serviceRequests').filter(r => r.status === 'pending'),

    // Queue
    getQueueNumber: () => store.get('queueNumber'),
    getQueuePosition: () => store.get('queuePosition'),
    getQueueEstimate: () => store.get('queueEstimate'),

    // UI State
    getIsLoading: () => store.get('isLoading'),
    getIsSubmitting: () => store.get('isSubmitting'),
    getSelectedCategory: () => store.get('selectedCategory'),
    getSelectedItem: () => store.get('selectedItem'),
};

// Actions
export const actions = {
    // Navigation
    navigateTo: (page) => store.set({ currentPage: page }),

    // Mode Selection
    setMode: (mode, table = null) => store.set({ mode, table }),

    // Category
    selectCategory: (categoryId) => store.set({ selectedCategory: categoryId }),

    // Item Selection
    selectItem: (item) => store.set({ selectedItem: item }),
    clearSelectedItem: () => store.set({ selectedItem: null }),

    // Cart
    addToCart: (item, quantity, modifiers) => store.addToCart(item, quantity, modifiers),
    updateCartItem: (index, quantity) => store.updateCartItem(index, quantity),
    removeFromCart: (index) => store.removeFromCart(index),
    clearCart: () => store.clearCart(),

    // Service
    addServiceRequest: (type, note) => store.addServiceRequest(type, note),
    updateServiceRequest: (id, status) => store.updateServiceRequest(id, status),

    // Order
    submitOrder: (orderData) => {
        const order = {
            id: `ORD-${Date.now()}`,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            timeline: [
                { status: 'pending', time: new Date().toISOString(), label: 'تم استلام الطلب' }
            ],
        };
        store.setActiveOrder(order);
        store.clearCart();
        actions.navigateTo('order-status');
        return order;
    },
    updateOrderStatus: (status) => store.updateOrderStatus(status),

    // Queue
    setQueueInfo: (number, position, estimate) => store.setQueueInfo(number, position, estimate),
    updateQueuePosition: (position) => store.updateQueuePosition(position),

    // Waitlist
    setWaitlistInfo: (info) => store.setWaitlistInfo(info),
    updateWaitlistPosition: (position, estimate) => store.updateWaitlistPosition(position, estimate),
    clearWaitlistInfo: () => store.clearWaitlistInfo(),

    // Loading
    setLoading: (isLoading) => store.set({ isLoading }),
    setSubmitting: (isSubmitting) => store.set({ isSubmitting }),

    // Reset
    reset: () => store.reset(),
};
