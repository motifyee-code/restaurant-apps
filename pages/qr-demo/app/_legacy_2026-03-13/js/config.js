/**
 * Configuration and Dummy Data
 * Contains all static data, settings, and constants
 */

// Restaurant Info
export const RESTAURANT = {
    name: 'مطعم الذواق',
    branch: 'الفرع الرئيسي',
    table: null, // Will be set based on mode
    logo: '🍽️',
    currency: 'EPG',
    taxRate: 0.15, // 15% VAT
};

// Order Status Enum
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

// Order Status Labels (Arabic)
export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'انتظار',
    [ORDER_STATUS.CONFIRMED]: 'تم التأكيد',
    [ORDER_STATUS.PREPARING]: 'جاري التحضير',
    [ORDER_STATUS.READY]: 'جاهز',
    [ORDER_STATUS.DELIVERED]: 'تم التسليم',
    [ORDER_STATUS.CANCELLED]: 'ملغي',
};

// Service Request Types
export const SERVICE_TYPES = {
    WAITER: 'waiter',
    WATER: 'water',
    NAPKINS: 'napkins',
    BILL: 'bill',
    ISSUE: 'issue',
    COMPLIMENT: 'compliment',
    OTHER: 'other',
};

// Service Request Labels (Arabic)
export const SERVICE_TYPE_LABELS = {
    [SERVICE_TYPES.WAITER]: { label: 'النادل', icon: '👨‍🍳' },
    [SERVICE_TYPES.WATER]: { label: 'مياه', icon: '💧' },
    [SERVICE_TYPES.NAPKINS]: { label: 'مناديل', icon: '🧻' },
    [SERVICE_TYPES.BILL]: { label: 'الفاتورة', icon: '🧾' },
    [SERVICE_TYPES.ISSUE]: { label: 'بلغ عن مشكلة', icon: '⚠️' },
    [SERVICE_TYPES.COMPLIMENT]: { label: 'مديح', icon: '⭐' },
    [SERVICE_TYPES.OTHER]: { label: 'أخرى', icon: '💬' },
};

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    WALLET: 'wallet',
    STCpay: 'stcpay',
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.CASH]: { label: 'نقداً', icon: '💵' },
    [PAYMENT_METHODS.CARD]: { label: 'بطاقة', icon: '💳' },
    [PAYMENT_METHODS.WALLET]: { label: 'محفظة', icon: '📱' },
    [PAYMENT_METHODS.STCpay]: { label: 'STC Pay', icon: '🔵' },
};

// Dummy Menu Categories
export const MENU_CATEGORIES = [
    { id: 'appetizers', name: 'المقبلات', icon: '🥗', order: 1 },
    { id: 'mains', name: 'الأطباق الرئيسية', icon: '🍖', order: 2 },
    { id: 'grills', name: 'المشاوي', icon: '🔥', order: 3 },
    { id: 'seafood', name: 'المأكولات البحرية', icon: '🦐', order: 4 },
    { id: 'drinks', name: 'المشروبات', icon: '🥤', order: 5 },
    { id: 'desserts', name: 'الحلويات', icon: '🍰', order: 6 },
];

// Dummy Menu Items
export const MENU_ITEMS = [
    // Appetizers
    {
        id: 'app1',
        categoryId: 'appetizers',
        name: 'حمص بالصنوبر',
        nameEn: 'Hummus with Pine Nuts',
        description: 'حمص كريمي مع زيت الزيتون والصنوبر المحمص',
        price: 18,
        image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop',
        emoji: '🫘',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: true,
    },
    {
        id: 'app2',
        categoryId: 'appetizers',
        name: 'تبولة',
        nameEn: 'Tabbouleh',
        description: 'سلطة بقدونس طازجة مع الطماطم والبرغل والليمون',
        price: 22,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        emoji: '🥗',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: true,
    },
    {
        id: 'app3',
        categoryId: 'appetizers',
        name: 'فلافل',
        nameEn: 'Falafel',
        description: 'كرة فلافل مقرمشة مع الطحينة',
        price: 15,
        image: 'https://images.unsplash.com/photo-1518589681436-7f4d0090b97b?w=400&h=400&fit=crop',
        emoji: '🧆',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },
    {
        id: 'app4',
        categoryId: 'appetizers',
        name: 'متبلات',
        nameEn: 'Pickles',
        description: 'تشكيلة من المخللات الشرقية',
        price: 12,
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
        emoji: '🥒',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },

    // Mains
    {
        id: 'main1',
        categoryId: 'mains',
        name: 'مندي لحم',
        nameEn: 'Lamb Mandi',
        description: 'لحم ضأن طري مع الأرز الباسمتي والتوابل الخاصة',
        price: 65,
        image: 'https://images.unsplash.com/photo-1513185158878-8d8f2a2a3da3?w=400&h=400&fit=crop',
        emoji: '🍖',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: true,
    },
    {
        id: 'main2',
        categoryId: 'mains',
        name: 'كبسة دجاج',
        nameEn: 'Chicken Kabsa',
        description: 'أرز كبسة بالدجاج مع اللوز والزبيب',
        price: 45,
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&h=400&fit=crop',
        emoji: '🍛',
        available: true,
        spicy: true,
        vegetarian: false,
        popular: true,
    },
    {
        id: 'main3',
        categoryId: 'mains',
        name: 'برياني هندي',
        nameEn: 'Indian Biryani',
        description: 'أرز برياني بالدجاج مع الزبادي',
        price: 42,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
        emoji: '🍚',
        available: true,
        spicy: true,
        vegetarian: false,
        popular: false,
    },
    {
        id: 'main4',
        categoryId: 'mains',
        name: 'محشي ورق عنب',
        nameEn: 'Stuffed Grape Leaves',
        description: 'ورق عنب محشي بالأرز واللحم المفروم',
        price: 28,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop',
        emoji: '🍃',
        available: false,
        spicy: false,
        vegetarian: false,
        popular: false,
    },

    // Grills
    {
        id: 'grill1',
        categoryId: 'grills',
        name: 'شواية مشكل',
        nameEn: 'Mixed Grill',
        description: 'تشكيلة من اللحوم والدجاج والكباب',
        price: 95,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
        emoji: '🥩',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: true,
    },
    {
        id: 'grill2',
        categoryId: 'grills',
        name: 'شيش طاووق',
        nameEn: 'Shish Tawook',
        description: 'قطع دجاج متبلة بالزبادي والزعفران',
        price: 48,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop',
        emoji: '🍢',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: true,
    },
    {
        id: 'grill3',
        categoryId: 'grills',
        name: 'كباب لحم',
        nameEn: 'Lamb Kebab',
        description: 'كباب لحم ضأن مع البصل والفلفل',
        price: 55,
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=400&fit=crop',
        emoji: '🍡',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: false,
    },

    // Seafood
    {
        id: 'sea1',
        categoryId: 'seafood',
        name: 'سمك مشوي',
        nameEn: 'Grilled Fish',
        description: 'سمك مشوي بالزعتر والليمون',
        price: 58,
        image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=400&fit=crop',
        emoji: '🐟',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: true,
    },
    {
        id: 'sea2',
        categoryId: 'seafood',
        name: 'روبيان مقلي',
        nameEn: 'Fried Shrimp',
        description: 'روبيان مقلي مع صلصة الثوم',
        price: 62,
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop',
        emoji: '🦐',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: false,
    },
    {
        id: 'sea3',
        categoryId: 'seafood',
        name: 'كاليماري',
        nameEn: 'Calamari',
        description: 'حبار مقلي مع صلصة الترTar Tar',
        price: 54,
        image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=400&fit=crop',
        emoji: '🦑',
        available: true,
        spicy: false,
        vegetarian: false,
        popular: false,
    },

    // Drinks
    {
        id: 'drink1',
        categoryId: 'drinks',
        name: 'عصير برتقال طازج',
        nameEn: 'Fresh Orange Juice',
        description: 'عصير برتقال طبيعي 100%',
        price: 16,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
        emoji: '🍊',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: true,
    },
    {
        id: 'drink2',
        categoryId: 'drinks',
        name: 'عصير ليمون بالنعناع',
        nameEn: 'Lemon Mint Juice',
        description: 'عصير ليمون منعش مع أوراق النعناع',
        price: 14,
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop',
        emoji: '🍋',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: true,
    },
    {
        id: 'drink3',
        categoryId: 'drinks',
        name: 'موهيتو',
        nameEn: 'Mojito',
        description: 'موهيتو كلاسيك بدون كحول',
        price: 22,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
        emoji: '🥃',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },
    {
        id: 'drink4',
        categoryId: 'drinks',
        name: 'قهوة عربية',
        nameEn: 'Arabic Coffee',
        description: 'قهوة عربية بالهيل والزعفران',
        price: 12,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        emoji: '☕',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },
    {
        id: 'drink5',
        categoryId: 'drinks',
        name: 'شاي كركديه',
        nameEn: 'Hibiscus Tea',
        description: 'شاي كركديه بارد أو ساخن',
        price: 10,
        image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop',
        emoji: '🍵',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },

    // Desserts
    {
        id: 'dessert1',
        categoryId: 'desserts',
        name: 'كنافة نابلسية',
        nameEn: 'Nablus Kunafa',
        description: 'كنافة بالجبنة والقطر',
        price: 24,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        emoji: '🥧',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: true,
    },
    {
        id: 'dessert2',
        categoryId: 'desserts',
        name: 'أم علي',
        nameEn: 'Um Ali',
        description: 'حلوى أم علي بالحليب والمكسرات',
        price: 20,
        image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop',
        emoji: '🍮',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },
    {
        id: 'dessert3',
        categoryId: 'desserts',
        name: 'بسبوسة',
        nameEn: 'Basbousa',
        description: 'بسبوسة بالقطر',
        price: 16,
        image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=400&fit=crop',
        emoji: '🧁',
        available: true,
        spicy: false,
        vegetarian: true,
        popular: false,
    },
];

// Modifier Groups
export const MODIFIER_GROUPS = {
    spiciness: {
        id: 'spiciness',
        name: 'الحموضة',
        type: 'single',
        required: false,
        options: [
            { id: 'mild', name: 'خفيفة', price: 0 },
            { id: 'medium', name: 'متوسطة', price: 0 },
            { id: 'hot', name: 'حارة', price: 0 },
            { id: 'extra', name: 'Extra حارة', price: 2 },
        ],
    },
    extras: {
        id: 'extras',
        name: 'إضافات',
        type: 'multiple',
        required: false,
        options: [
            { id: 'cheese', name: 'جبنة إضافية', price: 5 },
            { id: 'sauce', name: 'صوص إضافي', price: 3 },
            { id: 'garlic', name: 'ثوم', price: 2 },
            { id: 'nuts', name: 'مكسرات', price: 4 },
        ],
    },
    size: {
        id: 'size',
        name: 'الحجم',
        type: 'single',
        required: true,
        options: [
            { id: 'small', name: 'صغير', price: 0 },
            { id: 'medium', name: 'متوسط', price: 5 },
            { id: 'large', name: 'كبير', price: 10 },
        ],
    },
    sides: {
        id: 'sides',
        name: 'المرافق',
        type: 'multiple',
        required: false,
        options: [
            { id: 'rice', name: 'أرز', price: 8 },
            { id: 'bread', name: 'خبز', price: 3 },
            { id: 'salad', name: 'سلطة', price: 10 },
            { id: 'fries', name: 'بطاطس', price: 12 },
        ],
    },
};

// App Settings
export const APP_SETTINGS = {
    enableSplitBill: true,
    enableTipping: true,
    tippingOptions: [10, 15, 20],
    minOrderAmount: 20,
    maxQuantity: 99,
    estimatedPrepTime: 20, // minutes
};

// Queue Settings
export const QUEUE_SETTINGS = {
    orderPrefix: 'A',
    ordersAhead: 3,
    avgPrepTime: 15, // minutes per order
};

// Waitlist Settings
export const WAITLIST_SETTINGS = {
    ticketPrefix: 'W',
    avgTimePerParty: 5, // minutes per party ahead
    maxPartySize: 20,
    notificationMinutesBefore: 5, // notify when 5 minutes away
};

// Available Tables (for dine-in mode demo)
export const AVAILABLE_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Welcome Messages
export const WELCOME_MESSAGES = {
    dineIn: 'أهلاً بك! أنت متصل الآن بطاولة {table}. اطلب ما تريد مباشرة!',
    queue: 'أهلاً بك! أضف items إلى سلتك وادفع لاستلام طلبك.',
    waitlist: 'أهلاً بك! انضم لقائمة الانتظار وسنرسل لك إشعاراً عند اقتراب دورك.',
};
