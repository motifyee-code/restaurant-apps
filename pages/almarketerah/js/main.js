const cfg = (window && window.MARKETERA) || {};

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const STORAGE = {
	theme: 'marketera_theme',
	lang: 'marketera_lang'
};

const I18N = {
	ar: {
		meta_title: 'Marketera | وكالة تسويق وإعلانات رقمية',
		meta_desc:
			'Marketera وكالة متخصصة في الإعلانات الممولة وإدارة الحملات: Meta (Facebook/Instagram)، Google Ads، TikTok/Snap، إدارة صفحات، تصميم محتوى، وتتبع وقياس الأداء.',
		og_desc: 'إعلانات ممولة، إدارة حملات، إدارة صفحات، تصميم محتوى، وتقارير أداء واضحة.',

		nav_services: 'الخدمات',
		nav_packages: 'الباقات',
		nav_achievements: 'الإنجازات',
		nav_reviews: 'آراء العملاء',
		nav_contact: 'تواصل معنا',

		cta_facebook: 'فيسبوك',
		cta_quote: 'اطلب عرض سعر',
		cta_message_facebook: 'راسلنا على فيسبوك',

		pill_channels: 'Meta • Google • TikTok • Snapchat',
		pill_creative: 'Creative • Content • Pages',

		hero_title_main: 'وكالة تسويق وإعلانات رقمية',
		hero_title_accent: 'تُحوّل الإعلانات لنتائج',
		hero_subtitle:
			'نخطط ونبني ونُحسّن الحملات المدفوعة + ندير صفحاتك + نصنع محتوى مقنع — مع تتبع دقيق وتقارير واضحة.',
		hero_cta_primary: 'احصل على خطة مجانية',
		hero_cta_secondary: 'استعرض الخدمات',

		micro_focus_k: 'التركيز',
		micro_focus_v: 'أداء + شفافية + اختبار مستمر',
		micro_delivery_k: 'التسليم',
		micro_delivery_v: 'تقارير أسبوعية / شهرية',
		micro_comms_k: 'التواصل',
		micro_comms_v: 'Email + Facebook',

		card_badge: 'Marketera System',
		card_title: 'حلقة نمو أسبوعية',
		card_desc: 'تجربة → تحليل → تحسين → توسيع',
		card_cta: 'ابدأ الآن',
		card_email: 'راسلنا',
		card_note: 'نشتغل على حساباتك أنت — أنت المالك، ونحن الشريك.',

		mini_tracking_t: 'Tracking',
		mini_tracking_d: 'Pixel + CAPI + UTM',
		mini_creative_t: 'Creative',
		mini_creative_d: 'Hooks + Formats + Testing',
		mini_opt_t: 'Optimization',
		mini_opt_d: 'Budget + Bidding + Audiences',
		mini_report_t: 'Reporting',
		mini_report_d: 'Dashboards + Insights',

		services_title: 'الخدمات',
		services_lead:
			'كل ما تحتاجه لزيادة المبيعات/العملاء — من الاستراتيجية لحد التنفيذ والتحسين.',
		svc_meta_title: 'إعلانات Meta (FB/IG)',
		svc_meta_desc: 'حملات Leads / Sales / Messages مع اختبار مستمر.',
		svc_google_title: 'Google Ads',
		svc_google_desc: 'Search + Performance Max + YouTube حسب الهدف.',
		svc_tiktok_title: 'TikTok / Snap Ads',
		svc_tiktok_desc: 'Creative-first للوصول السريع + جمهور جديد.',
		svc_strategy_title: 'استراتيجية + Funnel',
		svc_strategy_desc: 'تقسيم الجمهور + عروض + رسائل + خطّة قياس.',
		svc_creative_title: 'تصميم ومحتوى',
		svc_creative_desc: 'إعلانات، Reels، UGC scripts، وBrand assets.',
		svc_pages_title: 'إدارة صفحات',
		svc_pages_desc: 'خطة نشر + Community + رسائل + تقارير تفاعل.',
		svc_lp_title: 'Landing Pages',
		svc_lp_desc: 'صفحات هبوط سريعة بتحويل أعلى (CRO).',
		svc_tracking_title: 'Tracking & Analytics',
		svc_tracking_desc: 'Pixel + CAPI + GA4 + لوحات متابعة وInsights.',

		how_title: 'طريقة الشغل',
		how_lead: 'من أول مكالمة لحد تحسين النتائج — خطوات واضحة.',
		step1_t: 'Audit سريع',
		step1_d: 'نفهم الهدف والمنتج والجمهور ونحدد الفجوات.',
		step2_t: 'Tracking Setup',
		step2_d: 'Pixel/CAPI/UTM + أحداث التحويل الأساسية.',
		step3_t: 'Creative Plan',
		step3_d: 'Hooks + زوايا + صيغ إعلانات + خطة اختبار.',
		step4_t: 'Launch',
		step4_d: 'إطلاق منظّم + توزيع ميزانية + Audience structure.',
		step5_t: 'Optimize',
		step5_d: 'تحسين أسبوعي: creative/budget/bidding/placements.',
		step6_t: 'Report & Scale',
		step6_d: 'تقارير واضحة + قرارات توسيع مبنية على بيانات.',

		pkg_title: 'الباقات (Products)',
		pkg_lead: 'اختر باقة حسب مرحلة البيزنس — ونخصص التفاصيل أثناء المكالمة.',
		pkg_cta: 'اطلب تسعير',
		pkg_starter_tag: 'للبدايات',
		pkg_starter_1: 'إدارة قناة إعلانية واحدة',
		pkg_starter_2: 'Tracking أساسي (Pixel/UTM)',
		pkg_starter_3: '2–4 Creatives/أسبوع (حسب توافر المواد)',
		pkg_starter_4: 'تحسين أسبوعي + تقرير شهري',
		pkg_growth_tag: 'نمو أسرع',
		pkg_growth_1: 'قناتان إعلانيتان (مثال: Meta + Google)',
		pkg_growth_2: 'Tracking متقدم (CAPI/Events)',
		pkg_growth_3: 'خطة Creative Testing شهرية',
		pkg_growth_4: 'تقارير أسبوعية + Insights',
		pkg_scale_tag: 'توسّع',
		pkg_scale_1: 'Multi-channel + Retargeting قوي',
		pkg_scale_2: 'CRO + Landing improvements',
		pkg_scale_3: 'Creative pipeline (أفكار + Scripts + Design)',
		pkg_scale_4: 'Dashboard + مراجعة دورية',

		proof_title: 'الإنجازات & مؤشرات الثقة',
		proof_lead: 'ضع أرقامك الحقيقية هنا. حالياً هذه بطاقات جاهزة للتخصيص.',
		stat_1: 'حملات مُدارة',
		stat_2: 'عملاء نشطين',
		stat_3: 'متوسط زمن الاستجابة',
		stat_4: 'تقارير / شهر',
		logo_placeholder: 'عميل',

		rev_title: 'آراء العملاء',
		rev_lead: 'أضف شهادات حقيقية من عملائك (الـ placeholders موجودة كمكان فقط).',
		rev_q1: '“اكتب هنا رأي العميل + النتيجة التي لاحظها + مدة التعاون.”',
		rev_q2: '“اكتب هنا مثال: تحسن جودة الليدز + انخفضت التكلفة + التقرير واضح.”',
		rev_q3: '“اكتب هنا: التجارب كانت منظمة، والـ creatives كانت قوية ومتجددة.”',
		rev_name: 'اسم العميل',
		rev_role: 'المنصب / النشاط',

		faq_title: 'أسئلة شائعة',
		faq_lead: 'إجابات مختصرة لأهم الأسئلة قبل التعاقد.',
		faq_q1: 'هل الحسابات والإعلانات ملكي؟',
		faq_a1: 'نعم. أنت مالك الـ Ad Account والـ Pages والـ Pixels. نحن نشتغل بصلاحيات.',
		faq_q2: 'هل يوجد عقد/مدة إلزامية؟',
		faq_a2: 'نحدد ذلك حسب الباقة والهدف. نفضّل اتفاق واضح + مؤشرات أداء + مراجعة شهرية.',
		faq_q3: 'هل توفرون محتوى وتصميم؟',
		faq_a3: 'نعم حسب الباقة: خطة محتوى + تصميمات + Scripts + تحسينات على creatives بناءً على النتائج.',
		faq_q4: 'كيف تكون التقارير؟',
		faq_a4: 'Dashboard + تقرير دوري: النتائج، ما تم اختباره، ما نجح، وما هي الخطوة القادمة.',

		contact_title: 'تواصل معنا',
		contact_lead: 'أرسل هدفك وميزانيتك التقريبية — وسنرجع لك بخطة واضحة.',
		contact_email_k: 'Email',
		contact_fb_k: 'Facebook',
		contact_phone_k: 'Phone',
		contact_note: 'لن نطلب منك كلمة سر — نستخدم صلاحيات Business Manager فقط.',

		form_name: 'الاسم',
		form_phone: 'رقم الهاتف (اختياري)',
		form_email: 'البريد الإلكتروني',
		form_service: 'الخدمة المطلوبة',
		form_message: 'رسالة',
		form_placeholder: 'اكتب الهدف + المنتج/الخدمة + البلد + ميزانية تقريبية + رابط الموقع (إن وجد)…',
		form_submit: 'إرسال',
		form_hint: 'سيتم فتح رسالة بريد جاهزة للإرسال إلى',

		opt_meta: 'Meta Ads (Facebook/Instagram)',
		opt_google: 'Google Ads',
		opt_tiktok: 'TikTok/Snap Ads',
		opt_pages: 'Page Management',
		opt_creative: 'Creative & Content',
		opt_lp: 'Landing Page / CRO',
		opt_tracking: 'Tracking / Analytics',

		footer_sub: 'Performance Marketing & Creative',

		mail_subject: 'Marketera — طلب عرض سعر',
		mail_name: 'الاسم',
		mail_phone: 'الهاتف',
		mail_email: 'البريد',
		mail_service: 'الخدمة'
	},
	en: {
		meta_title: 'Marketera | Performance Marketing Agency',
		meta_desc:
			'Marketera is a performance marketing agency: Meta (Facebook/Instagram), Google Ads, TikTok/Snap, page management, creative production, tracking, and clear reporting.',
		og_desc: 'Paid ads, campaign management, content & creative, and clear performance reporting.',

		nav_services: 'Services',
		nav_packages: 'Packages',
		nav_achievements: 'Achievements',
		nav_reviews: 'Reviews',
		nav_contact: 'Contact',

		cta_facebook: 'Facebook',
		cta_quote: 'Get a quote',
		cta_message_facebook: 'Message on Facebook',

		pill_channels: 'Meta • Google • TikTok • Snapchat',
		pill_creative: 'Creative • Content • Pages',

		hero_title_main: 'Performance Marketing & Growth',
		hero_title_accent: 'Ads that drive real results',
		hero_subtitle:
			'We plan, launch, and optimize paid campaigns — manage your pages, produce strong creatives, and report with full tracking clarity.',
		hero_cta_primary: 'Get a free plan',
		hero_cta_secondary: 'View services',

		micro_focus_k: 'Focus',
		micro_focus_v: 'Performance + transparency + testing',
		micro_delivery_k: 'Delivery',
		micro_delivery_v: 'Weekly / monthly reporting',
		micro_comms_k: 'Support',
		micro_comms_v: 'Email + Facebook',

		card_badge: 'Marketera System',
		card_title: 'Weekly growth loop',
		card_desc: 'Test → analyze → improve → scale',
		card_cta: 'Start now',
		card_email: 'Email us',
		card_note: 'We work inside your accounts — you own everything, we operate as partners.',

		mini_tracking_t: 'Tracking',
		mini_tracking_d: 'Pixel + CAPI + UTM',
		mini_creative_t: 'Creative',
		mini_creative_d: 'Hooks + Formats + Testing',
		mini_opt_t: 'Optimization',
		mini_opt_d: 'Budget + Bidding + Audiences',
		mini_report_t: 'Reporting',
		mini_report_d: 'Dashboards + Insights',

		services_title: 'Services',
		services_lead: 'Everything you need to grow — strategy, execution, and continuous optimization.',
		svc_meta_title: 'Meta Ads (FB/IG)',
		svc_meta_desc: 'Lead, sales, and messaging campaigns with systematic testing.',
		svc_google_title: 'Google Ads',
		svc_google_desc: 'Search + Performance Max + YouTube aligned to your goals.',
		svc_tiktok_title: 'TikTok / Snap Ads',
		svc_tiktok_desc: 'Creative-first growth to reach new audiences fast.',
		svc_strategy_title: 'Strategy + Funnel',
		svc_strategy_desc: 'Segmentation, offers, messaging, and measurement plan.',
		svc_creative_title: 'Creative & Content',
		svc_creative_desc: 'Ads, reels, UGC scripts, and brand assets.',
		svc_pages_title: 'Page Management',
		svc_pages_desc: 'Content plan, community, inbox, and engagement reporting.',
		svc_lp_title: 'Landing Pages',
		svc_lp_desc: 'Fast landing pages built for higher conversion (CRO).',
		svc_tracking_title: 'Tracking & Analytics',
		svc_tracking_desc: 'Pixel + CAPI + GA4 + dashboards and actionable insights.',

		how_title: 'How we work',
		how_lead: 'Clear steps from kickoff to better results.',
		step1_t: 'Quick audit',
		step1_d: 'We understand goals, offer, audience, and the biggest gaps.',
		step2_t: 'Tracking setup',
		step2_d: 'Pixel/CAPI/UTM + core conversion events.',
		step3_t: 'Creative plan',
		step3_d: 'Hooks, angles, formats, and a structured testing plan.',
		step4_t: 'Launch',
		step4_d: 'Organized launch, budget distribution, and audience structure.',
		step5_t: 'Optimize',
		step5_d: 'Weekly optimization: creative, budget, bidding, and placements.',
		step6_t: 'Report & scale',
		step6_d: 'Clear reporting + data-driven scaling decisions.',

		pkg_title: 'Packages',
		pkg_lead: 'Pick the right stage — we tailor details during the call.',
		pkg_cta: 'Request pricing',
		pkg_starter_tag: 'For starters',
		pkg_starter_1: 'Manage one ad channel',
		pkg_starter_2: 'Basic tracking (Pixel/UTM)',
		pkg_starter_3: '2–4 creatives/week (based on materials)',
		pkg_starter_4: 'Weekly optimization + monthly report',
		pkg_growth_tag: 'Faster growth',
		pkg_growth_1: 'Two channels (e.g., Meta + Google)',
		pkg_growth_2: 'Advanced tracking (CAPI/Events)',
		pkg_growth_3: 'Monthly creative testing plan',
		pkg_growth_4: 'Weekly reports + insights',
		pkg_scale_tag: 'Scale',
		pkg_scale_1: 'Multi-channel + strong retargeting',
		pkg_scale_2: 'CRO + landing improvements',
		pkg_scale_3: 'Creative pipeline (ideas + scripts + design)',
		pkg_scale_4: 'Dashboard + periodic reviews',

		proof_title: 'Proof & achievements',
		proof_lead: 'Add your real numbers here — placeholders for now.',
		stat_1: 'Campaigns managed',
		stat_2: 'Active clients',
		stat_3: 'Avg. response time',
		stat_4: 'Reports / month',
		logo_placeholder: 'Client',

		rev_title: 'Client reviews',
		rev_lead: 'Add real testimonials (placeholders for now).',
		rev_q1: '“Add a client quote + outcome + how long you worked together.”',
		rev_q2: '“Example: higher-quality leads, lower CPA, clear reporting.”',
		rev_q3: '“Example: organized testing and strong, refreshed creatives.”',
		rev_name: 'Client name',
		rev_role: 'Role / industry',

		faq_title: 'FAQ',
		faq_lead: 'Quick answers to common questions.',
		faq_q1: 'Do I own the ad accounts and assets?',
		faq_a1: 'Yes. You own the ad account, pages, and pixels. We work via roles/permissions.',
		faq_q2: 'Is there a minimum contract term?',
		faq_a2: 'It depends on your goals and package. We prefer clear scope + KPIs + monthly reviews.',
		faq_q3: 'Do you provide creative and content?',
		faq_a3: 'Yes, depending on the package: content plan, designs, scripts, and creative iteration based on performance.',
		faq_q4: 'What does reporting look like?',
		faq_a4: 'Dashboard + periodic report: results, what we tested, what worked, and what’s next.',

		contact_title: 'Contact us',
		contact_lead: 'Send your goal and an approximate budget — we’ll reply with a clear plan.',
		contact_email_k: 'Email',
		contact_fb_k: 'Facebook',
		contact_phone_k: 'Phone',
		contact_note: 'We will never ask for passwords — we only use Business Manager access.',

		form_name: 'Name',
		form_phone: 'Phone (optional)',
		form_email: 'Email',
		form_service: 'Service',
		form_message: 'Message',
		form_placeholder: 'Goal + product/service + country + approximate budget + website (if any)…',
		form_submit: 'Send',
		form_hint: 'This will open a prefilled email to',

		opt_meta: 'Meta Ads (Facebook/Instagram)',
		opt_google: 'Google Ads',
		opt_tiktok: 'TikTok/Snap Ads',
		opt_pages: 'Page management',
		opt_creative: 'Creative & content',
		opt_lp: 'Landing page / CRO',
		opt_tracking: 'Tracking / analytics',

		footer_sub: 'Performance Marketing & Creative',

		mail_subject: 'Marketera — Pricing request',
		mail_name: 'Name',
		mail_phone: 'Phone',
		mail_email: 'Email',
		mail_service: 'Service'
	}
};

function safeGet(key) {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function safeSet(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch {
		// ignore
	}
}

function pickLang() {
	const saved = safeGet(STORAGE.lang);
	if (saved === 'ar' || saved === 'en') return saved;
	const nav = (navigator.languages && navigator.languages.join(',')) || navigator.language || '';
	return /(^|,)\s*ar\b/i.test(nav) ? 'ar' : 'en';
}

function pickTheme() {
	const saved = safeGet(STORAGE.theme);
	if (saved === 'dark' || saved === 'light') return saved;
	const prefersDark =
		window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

let currentLang = pickLang();
let currentTheme = pickTheme();

function t(key) {
	return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.ar && I18N.ar[key]) || '';
}

function setMeta() {
	document.title = t('meta_title');
	const desc = qs('meta[name="description"]');
	if (desc) desc.setAttribute('content', t('meta_desc'));
	const ogt = qs('meta[property="og:title"]');
	if (ogt) ogt.setAttribute('content', t('meta_title'));
	const ogd = qs('meta[property="og:description"]');
	if (ogd) ogd.setAttribute('content', t('og_desc'));
}

function applyI18n() {
	qsa('[data-i18n]').forEach((el) => {
		const key = el.getAttribute('data-i18n');
		if (!key) return;
		el.textContent = t(key);
	});

	qsa('[data-i18n-placeholder]').forEach((el) => {
		const key = el.getAttribute('data-i18n-placeholder');
		if (!key) return;
		el.setAttribute('placeholder', t(key));
	});

	setMeta();

	const track = qs('.marquee__track');
	if (track) {
		const items =
			currentLang === 'ar'
				? [
						'إعلانات Meta',
						'Google Ads',
						'إعلانات TikTok',
						'إعلانات Snap',
						'إدارة السوشيال',
						'تصميم ومحتوى',
						'Landing Pages',
						'Analytics & CRO'
					]
				: [
						'Meta Ads',
						'Google Ads',
						'TikTok Ads',
						'Snap Ads',
						'Social Management',
						'Creative & Content',
						'Landing Pages',
						'Analytics & CRO'
					];
		const all = items.concat(items);
		track.innerHTML = all.map((x) => `<span>${x}</span>`).join('');
	}
}

function applyLang(lang) {
	currentLang = lang;
	safeSet(STORAGE.lang, lang);
	const root = document.documentElement;
	root.lang = lang;
	root.dir = lang === 'ar' ? 'rtl' : 'ltr';
	applyI18n();
	updateLangButtons();
}

function applyTheme(theme) {
	currentTheme = theme;
	safeSet(STORAGE.theme, theme);
	document.documentElement.dataset.theme = theme;
	updateThemeButtons();
}

function updateLangButtons() {
	const label = currentLang === 'ar' ? 'EN' : 'عربي';
	qsa('[data-lang-toggle]').forEach((b) => {
		b.textContent = label;
		b.setAttribute('aria-label', currentLang === 'ar' ? 'Switch to English' : 'التبديل للعربية');
	});
}

function updateThemeButtons() {
	const next = currentTheme === 'dark' ? 'light' : 'dark';
	const icon = next === 'dark' ? '☾' : '☀';
	qsa('[data-theme-toggle]').forEach((b) => {
		b.textContent = icon;
		b.setAttribute('aria-label', next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode');
	});
}

function initToggles() {
	qsa('[data-lang-toggle]').forEach((b) => {
		b.addEventListener('click', () => {
			applyLang(currentLang === 'ar' ? 'en' : 'ar');
		});
	});

	qsa('[data-theme-toggle]').forEach((b) => {
		b.addEventListener('click', () => {
			applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
		});
	});
}

const menuBtn = qs('[data-menu-button]');
const mobileMenu = qs('[data-mobile-menu]');

function setMenu(open) {
	if (!menuBtn || !mobileMenu) return;
	menuBtn.setAttribute('aria-expanded', String(open));
	mobileMenu.hidden = !open;
}

function initMenu() {
	if (!menuBtn || !mobileMenu) return;
	menuBtn.addEventListener('click', () => {
		const open = menuBtn.getAttribute('aria-expanded') !== 'true';
		setMenu(open);
	});
	qsa('a[href^="#"]', mobileMenu).forEach((a) => {
		a.addEventListener('click', () => setMenu(false));
	});
}

function initFaq() {
	qsa('[data-qa]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const wrap = btn.closest('.qa');
			if (!wrap) return;
			wrap.classList.toggle('is-open');
		});
	});
}

function initPhone() {
	const phoneWrap = qs('[data-phone-wrap]');
	const phoneLink = qs('[data-phone-link]');
	if (phoneWrap && phoneLink && cfg.phoneDisplay && cfg.phoneTel) {
		phoneWrap.hidden = false;
		phoneLink.textContent = cfg.phoneDisplay;
		phoneLink.href = `tel:${cfg.phoneTel}`;
	}
}

function initForm() {
	const form = qs('[data-contact-form]');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(form);
		const name = String(fd.get('name') || '').trim();
		const phone = String(fd.get('phone') || '').trim();
		const email = String(fd.get('email') || '').trim();
		const service = String(fd.get('service') || '').trim();
		const message = String(fd.get('message') || '').trim();

		const lines = [
			`${t('mail_name')}: ${name}`,
			phone ? `${t('mail_phone')}: ${phone}` : '',
			`${t('mail_email')}: ${email}`,
			`${t('mail_service')}: ${service}`,
			'',
			message
		].filter(Boolean);

		const subject = encodeURIComponent(t('mail_subject'));
		const body = encodeURIComponent(lines.join('\n'));
		const to = encodeURIComponent(cfg.email || 'almarketerah@garsony.xyz');
		window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
	});
}

applyTheme(currentTheme);
applyLang(currentLang);
initToggles();
initMenu();
initFaq();
initPhone();
initForm();
