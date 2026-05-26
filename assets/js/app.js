(function () {
  const defaults = {
    settings: {
      whatsapp: "01120442206",
      phone: "+966544113161",
      email: "marketing@fujiyem.com",
      address: "السعودية - مكة - جدة",
      instagram: "",
      facebook: "",
      tiktok: "",
      supabaseUrl: "",
      supabaseKey: ""
    },
    services: [
      { title: "تركيب المصاعد", description: "تركيب احترافي للمصاعد السكنية والتجارية وفق معايير السلامة والجودة.", icon: "01" },
      { title: "صيانة دورية", description: "عقود صيانة مرنة تقلل الأعطال وتحافظ على التشغيل الآمن.", icon: "02" },
      { title: "دعم الأعطال", description: "استجابة طارئة للمصاعد المتوقفة مع فريق جاهز في مكة وجدة.", icon: "03" },
      { title: "معاينات ومقايسات", description: "زيارة فنية ورفع مقاسات وتوصية مناسبة لطبيعة المبنى.", icon: "04" },
      { title: "تحديث المصاعد", description: "تطوير المصاعد القديمة ورفع مستوى الأمان والمظهر بدون هدم كامل.", icon: "05" },
      { title: "توريد قطع الغيار", description: "قطع غيار أصلية ومعتمدة لتقليل التوقف وتحسين الاعتمادية.", icon: "06" }
    ],
    catalog: [
      { category: "الكبائن", title: "كابينة بانوراما فاخرة", description: "تشطيب ستانلس وإضاءة مخفية للمباني الراقية.", type: "cabin" },
      { category: "الكبائن", title: "كابينة عملية للمباني السكنية", description: "اختيار اقتصادي أنيق وسهل الصيانة.", type: "cabin" },
      { category: "الأبواب", title: "باب أوتوماتيك ستانلس", description: "حركة سلسة ومتانة عالية للاستخدام الكثيف.", type: "door" },
      { category: "الرخام", title: "أرضية رخام فاتح", description: "ملمس فاخر يرفع قيمة الكابينة بصريا.", type: "marble" },
      { category: "لوحة التحكم", title: "لوحة لمس حديثة", description: "أزرار واضحة ومؤشرات أنيقة وسهلة الاستخدام.", type: "panel" },
      { category: "المحركات", title: "محرك FUJI YEM", description: "تشغيل هادئ وكفاءة مناسبة للمباني متعددة الأدوار.", type: "motor" },
      { category: "بئر المصعد", title: "حلول البئر والتجهيز", description: "تجهيزات آمنة ومتوافقة مع متطلبات الموقع.", type: "shaft" }
    ],
    faqs: [
      { q: "ما مدة تنفيذ تركيب المصعد؟", a: "تختلف حسب النوع وعدد الأدوار وتجهيز الموقع، وغالبا تبدأ من 7 إلى 21 يوما بعد اعتماد التصميم والمعاينة." },
      { q: "هل توفرون طوارئ للأعطال؟", a: "نعم، نوفر دعم أعطال سريع للمباني والفنادق والمنشآت في مكة وجدة." },
      { q: "هل يمكن تحديث مصعد قديم؟", a: "نعم، يمكن تحديث الكابينة ولوحة التحكم والأبواب ورفع مستوى الأمان بدون استبدال كامل في حالات كثيرة." },
      { q: "هل الفحص المجاني ملزم بعقد؟", a: "لا، الفحص يقدم تقرير حالة وتوصيات واضحة، ثم يقرر العميل الخطوة التالية." }
    ]
  };

  function getData() {
    const saved = JSON.parse(localStorage.getItem("capitalUniverseData") || "{}");
    return {
      settings: { ...defaults.settings, ...(saved.settings || {}) },
      services: saved.services || defaults.services,
      catalog: saved.catalog || defaults.catalog,
      faqs: saved.faqs || defaults.faqs
    };
  }

  function saveData(data) {
    localStorage.setItem("capitalUniverseData", JSON.stringify(data));
  }

  function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("00")) return digits.slice(2);
    if (digits.startsWith("0")) return "2" + digits;
    return digits || "201120442206";
  }

  function renderPublic() {
    const data = getData();
    const { settings } = data;
    const wa = "https://wa.me/" + normalizePhone(settings.whatsapp);
    ["heroWhatsapp", "floatingWhatsapp"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = wa;
    });
    const footerPhone = document.getElementById("footerPhone");
    if (footerPhone) footerPhone.textContent = settings.phone || settings.whatsapp;
    const footerEmail = document.getElementById("footerEmail");
    if (footerEmail) footerEmail.textContent = settings.email;
    const footerAddress = document.getElementById("footerAddress");
    if (footerAddress) footerAddress.textContent = settings.address;

    const serviceGrid = document.getElementById("serviceGrid");
    if (serviceGrid) {
      serviceGrid.innerHTML = data.services.map(service => `
        <article class="service-card">
          <span class="icon">${service.icon || "✓"}</span>
          <h3>${escapeHtml(service.title)}</h3>
          <p>${escapeHtml(service.description)}</p>
        </article>
      `).join("");
    }

    const choices = document.getElementById("serviceChoices");
    if (choices) {
      choices.innerHTML = data.services.map((service, i) => `
        <label><input type="checkbox" name="services" value="${escapeHtml(service.title)}" ${i === 0 ? "checked" : ""}>${escapeHtml(service.title)}</label>
      `).join("");
    }

    renderCatalog(data.catalog);

    const faqList = document.getElementById("faqList");
    if (faqList) {
      faqList.innerHTML = data.faqs.map(item => `
        <article class="faq-item"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></article>
      `).join("");
    }
  }

  function renderCatalog(items) {
    const tabs = document.getElementById("catalogTabs");
    const grid = document.getElementById("catalogGrid");
    if (!tabs || !grid) return;
    const categories = ["الكل", ...Array.from(new Set(items.map(item => item.category)))];
    let active = "الكل";
    const paint = () => {
      tabs.innerHTML = categories.map(cat => `<button class="${cat === active ? "active" : ""}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join("");
      const visible = active === "الكل" ? items : items.filter(item => item.category === active);
      grid.innerHTML = visible.map(item => `
        <article class="catalog-card">
          <div class="catalog-art ${escapeHtml(item.type || "cabin")}"></div>
          <div class="catalog-body">
            <span class="eyebrow">${escapeHtml(item.category)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
        </article>
      `).join("");
      tabs.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
        active = btn.dataset.cat;
        paint();
      }));
    };
    paint();
  }

  async function submitLead(event) {
    event.preventDefault();
    const data = getData();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const selected = Array.from(form.querySelectorAll("input[name='services']:checked")).map(input => input.value);
    const lead = {
      created_at: new Date().toISOString(),
      name: fd.get("name"),
      phone: fd.get("phone"),
      city: fd.get("city"),
      building: fd.get("building"),
      elevators: fd.get("elevators"),
      urgency: fd.get("urgency"),
      services: selected,
      notes: fd.get("notes")
    };
    const leads = JSON.parse(localStorage.getItem("capitalUniverseLeads") || "[]");
    leads.unshift(lead);
    localStorage.setItem("capitalUniverseLeads", JSON.stringify(leads));
    await sendToSupabase(lead, data.settings);
    const message = [
      "طلب معاينة من موقع عاصمة الكون",
      `الاسم: ${lead.name}`,
      `الجوال: ${lead.phone}`,
      `المدينة: ${lead.city}`,
      `نوع المبنى: ${lead.building}`,
      `عدد المصاعد: ${lead.elevators}`,
      `الأولوية: ${lead.urgency}`,
      `الخدمات: ${lead.services.join("، ")}`,
      `ملاحظات: ${lead.notes || "لا يوجد"}`
    ].join("\n");
    const status = document.getElementById("formStatus");
    if (status) status.textContent = "تم تسجيل الطلب. سيتم فتح واتساب برسالة جاهزة.";
    window.open(`https://wa.me/${normalizePhone(data.settings.whatsapp)}?text=${encodeURIComponent(message)}`, "_blank");
    form.reset();
  }

  async function sendToSupabase(lead, settings) {
    if (!settings.supabaseUrl || !settings.supabaseKey) return;
    try {
      await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": settings.supabaseKey,
          "Authorization": `Bearer ${settings.supabaseKey}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(lead)
      });
    } catch (error) {
      console.warn("Supabase lead sync failed", error);
    }
  }

  function bindScrollElevator() {
    const stage = document.querySelector(".elevator-stage");
    const car = document.getElementById("elevatorCar");
    if (!stage || !car) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - innerHeight)));
      document.documentElement.style.setProperty("--lift", `${-progress * 190}px`);
      document.documentElement.style.setProperty("--lift-lines", `${progress * 360}px`);
    };
    update();
    addEventListener("scroll", update, { passive: true });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  window.CapitalUniverse = { defaults, getData, saveData, renderPublic, escapeHtml };
  document.addEventListener("DOMContentLoaded", () => {
    renderPublic();
    bindScrollElevator();
    const form = document.getElementById("leadForm");
    if (form) form.addEventListener("submit", submitLead);
  });
})();
