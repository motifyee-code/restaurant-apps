export const ORDER_STATUS = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	PREPARING: 'preparing',
	READY: 'ready',
	DELIVERED: 'delivered',
	CANCELLED: 'cancelled',
};

export const ORDER_STATUS_AR = {
	[ORDER_STATUS.PENDING]: 'انتظار',
	[ORDER_STATUS.CONFIRMED]: 'تم التأكيد',
	[ORDER_STATUS.PREPARING]: 'جاري التحضير',
	[ORDER_STATUS.READY]: 'جاهز',
	[ORDER_STATUS.DELIVERED]: 'تم التسليم',
	[ORDER_STATUS.CANCELLED]: 'ملغي',
};

export const PAYMENT_METHODS = [
	{ id: 'cash', label: 'نقداً', labelEn: 'Cash', icon: '💵' },
	{ id: 'card', label: 'بطاقة', labelEn: 'Card', icon: '💳' },
	{ id: 'wallet', label: 'محفظة', labelEn: 'Wallet', icon: '📱' },
];

export const SERVICE_TYPES = [
	{ id: 'waiter', label: 'النادل', labelEn: 'Waiter', icon: '👨‍🍳' },
	{ id: 'water', label: 'مياه', labelEn: 'Water', icon: '💧' },
	{ id: 'napkins', label: 'مناديل', labelEn: 'Napkins', icon: '🧻' },
	{ id: 'bill', label: 'الفاتورة', labelEn: 'Bill', icon: '🧾' },
	{ id: 'issue', label: 'مشكلة', labelEn: 'Issue', icon: '⚠️', needsNote: true },
	{ id: 'compliment', label: 'مديح', labelEn: 'Compliment', icon: '⭐', needsNote: true },
	{ id: 'other', label: 'أخرى', labelEn: 'Other', icon: '💬', needsNote: true },
];
