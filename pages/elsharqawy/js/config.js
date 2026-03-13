(function () {
  window.PC = window.PC || {};

  PC.config = {
    company: {
      name: {
        en: "Elsharqawy",
        ar: "الشرقاوي",
      },
      phoneE164: "+201226766076",
      email: "sharqawy@garsony.xyz",
      // WhatsApp expects digits only, no plus.
      whatsappDigits: "201226766076",
      address: {
        en: "Cairo, Egypt",
        ar: "القاهرة، مصر",
      },
    },

    // Optional: set a form endpoint to receive submissions automatically.
    // Examples: Formspree, Getform, Netlify Forms, etc.
    // If empty, the forms fall back to mailto: (opens the visitor's email client).
    contactFormEndpoint: "",
  };

  PC.bindingsForLang = function bindingsForLang(lang) {
    var safeLang = lang === "ar" ? "ar" : "en";
    var company = PC.config.company;
    var companyName = company.name[safeLang] || company.name.en;
    var companyAddress = company.address[safeLang] || company.address.en;

    return {
      companyName: companyName,
      companyPhone: company.phoneE164,
      companyTelHref: "tel:" + company.phoneE164,
      companyEmail: company.email,
      companyMailtoHref: "mailto:" + company.email,
      companyWhatsAppHref: "https://wa.me/" + company.whatsappDigits,
      companyAddress: companyAddress,
    };
  };
})();
