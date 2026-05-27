(function () {
  const api = window.CapitalUniverse;
  const DEFAULT_PASSWORD = "123456";
  const PASSWORD_KEY = "capitalUniverseAdminPassword";
  const SESSION_KEY = "capitalUniverseAdminAuthed";
  const ADMIN_RESET_PHONE = "01120442206";
  const RESET_ACCESS_PASSWORD = "192003";
  let data = api.getData();

  function getPassword() {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  }

  function setPassword(password) {
    localStorage.setItem(PASSWORD_KEY, password);
  }

  function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("00")) return digits.slice(2);
    if (digits.startsWith("0")) return "2" + digits;
    return digits || "201120442206";
  }

  function showDashboard() {
    document.getElementById("authScreen").classList.add("is-hidden");
    document.getElementById("ownerResetScreen").classList.add("is-hidden");
    document.getElementById("dashboardApp").classList.remove("is-locked");
  }

  function showLogin() {
    document.getElementById("authScreen").classList.remove("is-hidden");
    document.getElementById("ownerResetScreen").classList.add("is-hidden");
    document.getElementById("dashboardApp").classList.add("is-locked");
  }

  function showOwnerReset() {
    document.getElementById("authScreen").classList.add("is-hidden");
    document.getElementById("ownerResetScreen").classList.remove("is-hidden");
    document.getElementById("dashboardApp").classList.add("is-locked");
  }

  function bindAuth() {
    const loginForm = document.getElementById("loginForm");
    const loginStatus = document.getElementById("loginStatus");
    const params = new URLSearchParams(window.location.search);
    if (params.get("ownerReset") === "1") {
      showOwnerReset();
    } else if (sessionStorage.getItem(SESSION_KEY) === "true") {
      showDashboard();
    }
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const password = new FormData(loginForm).get("password");
      if (password !== getPassword()) {
        loginStatus.textContent = "كلمة المرور غير صحيحة.";
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "true");
      loginForm.reset();
      loginStatus.textContent = "";
      showDashboard();
    });
    document.getElementById("logoutAdmin").addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
    });
  }

  function bindPasswordChange() {
    const status = document.getElementById("passwordStatus");
    const sendLink = document.getElementById("sendPasswordResetLink");
    const ownerResetForm = document.getElementById("ownerResetForm");
    const ownerResetStatus = document.getElementById("ownerResetStatus");

    sendLink.addEventListener("click", () => {
      const resetUrl = `${window.location.origin}/admin?ownerReset=1`;
      const message = [
        "طلب تغيير كلمة مرور داشبورد عاصمة الكون",
        "افتحي لينك التغيير التالي:",
        resetUrl,
        "كلمة مرور رابط التغيير: 192003",
        "بعد الدخول اكتبي كلمة المرور الجديدة للداشبورد."
      ].join("\n");
      status.textContent = "تم تجهيز لينك التغيير. سيتم فتح واتساب لإرساله إلى رقم الإدارة.";
      window.open(`https://wa.me/${normalizePhone(ADMIN_RESET_PHONE)}?text=${encodeURIComponent(message)}`, "_blank");
    });

    ownerResetForm.addEventListener("submit", event => {
      event.preventDefault();
      const fd = new FormData(ownerResetForm);
      const resetAccessPassword = fd.get("resetAccessPassword");
      const newPassword = fd.get("newPassword");
      const confirmPassword = fd.get("confirmPassword");

      if (resetAccessPassword !== RESET_ACCESS_PASSWORD) {
        ownerResetStatus.textContent = "كلمة مرور رابط التغيير غير صحيحة.";
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        ownerResetStatus.textContent = "كلمة المرور الجديدة يجب ألا تقل عن 6 أرقام أو حروف.";
        return;
      }
      if (newPassword !== confirmPassword) {
        ownerResetStatus.textContent = "تأكيد كلمة المرور غير مطابق.";
        return;
      }

      setPassword(newPassword);
      sessionStorage.setItem(SESSION_KEY, "true");
      ownerResetForm.reset();
      ownerResetStatus.textContent = "تم تغيير كلمة السر بنجاح. سيتم فتح الداشبورد الآن.";
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(showDashboard, 700);
    });
  }

  function fillSettings() {
    const form = document.getElementById("settingsForm");
    Object.entries(data.settings).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value || "";
    });
  }

  function renderEditor() {
    renderRows("servicesEditor", data.services, [
      ["title", "اسم الخدمة"],
      ["description", "وصف الخدمة"],
      ["icon", "رمز"]
    ], "services");
    renderCatalogEditor();
    renderRows("faqEditor", data.faqs, [
      ["q", "السؤال"],
      ["a", "الإجابة"]
    ], "faqs");
  }

  function renderCatalogEditor() {
    data.catalogCategories = data.catalogCategories || getCatalogCategories();
    const box = document.getElementById("catalogEditor");
    const categories = data.catalogCategories.map(category => category.name).filter(Boolean);
    const options = categories.map(category => `<option value="${api.escapeHtml(category)}">${api.escapeHtml(category)}</option>`).join("");
    box.innerHTML = `
      <div class="catalog-admin">
        <div class="catalog-admin-head">
          <div>
            <h4>التصنيفات</h4>
            <p>أضيفي تصنيفات الكتالوج، ثم اربطي كل منتج بالتصنيف المناسب.</p>
          </div>
          <button class="ghost dark" id="addCatalogCategory" type="button">إضافة تصنيف</button>
        </div>
        <div class="category-editor">
          ${data.catalogCategories.map((category, index) => `
            <div class="category-row" data-category-index="${index}">
              <input data-field="name" value="${api.escapeHtml(category.name || "")}" placeholder="اسم التصنيف">
              <input data-field="nameEn" value="${api.escapeHtml(category.nameEn || "")}" placeholder="Category in English">
              <button class="remove remove-category" type="button">حذف</button>
            </div>
          `).join("")}
        </div>
        <div class="catalog-admin-head products-head">
          <div>
            <h4>المنتجات</h4>
            <p>الكود هيظهر بوضوح على كارت المنتج، والصورة تتعرض بمقاس ثابت واحترافي.</p>
          </div>
        </div>
        <div class="product-editor">
          ${data.catalog.map((item, index) => `
            <div class="product-row" data-product-index="${index}">
              <div class="product-image-box">
                ${item.image ? `<img src="${api.escapeHtml(item.image)}" alt="">` : `<span>${api.escapeHtml(item.code || "CODE")}</span>`}
                <input class="image-input" type="file" accept="image/*" data-index="${index}" aria-label="رفع صورة المنتج">
              </div>
              <div class="product-fields">
                <select data-field="category">
                  ${options}
                  ${!categories.includes(item.category) && item.category ? `<option value="${api.escapeHtml(item.category)}">${api.escapeHtml(item.category)}</option>` : ""}
                </select>
                <input data-field="title" value="${api.escapeHtml(item.title || "")}" placeholder="اسم المنتج">
                <input data-field="code" value="${api.escapeHtml(item.code || "")}" placeholder="كود المنتج">
                <input data-field="type" value="${api.escapeHtml(item.type || "cabin")}" placeholder="cabin / door / marble / panel / motor / shaft">
                <textarea data-field="description" placeholder="وصف المنتج">${api.escapeHtml(item.description || "")}</textarea>
                <input data-field="image" value="${api.escapeHtml(item.image || "")}" placeholder="رابط الصورة أو ارفعي ملف">
              </div>
              <button class="remove remove-product" type="button">حذف</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    box.querySelectorAll("select[data-field='category']").forEach(select => {
      const item = data.catalog[Number(select.closest(".product-row").dataset.productIndex)];
      select.value = item.category || categories[0] || "";
    });
  }

  function getCatalogCategories() {
    return Array.from(new Set((data.catalog || []).map(item => item.category).filter(Boolean))).map(name => ({ name, nameEn: "" }));
  }

  function updateSummary() {
    const leads = JSON.parse(localStorage.getItem("capitalUniverseLeads") || "[]");
    const map = {
      summaryServices: data.services.length,
      summaryCatalog: data.catalog.length,
      summaryFaqs: data.faqs.length,
      summaryLeads: leads.length
    };
    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function bindModules() {
    const buttons = Array.from(document.querySelectorAll("[data-module-target]"));
    const modules = Array.from(document.querySelectorAll(".dashboard-module"));
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(item => item.classList.toggle("active", item === button));
        modules.forEach(module => module.classList.toggle("active", module.id === button.dataset.moduleTarget));
      });
    });
  }

  function renderRows(containerId, rows, fields, key) {
    const box = document.getElementById(containerId);
    box.innerHTML = rows.map((row, index) => `
      <div class="editor-row" data-key="${key}" data-index="${index}">
        ${fields.map(([field, placeholder]) => {
          const value = api.escapeHtml(row[field] || "");
          const input = field === "description" || field === "a"
            ? `<textarea data-field="${field}" placeholder="${placeholder}">${value}</textarea>`
            : `<input data-field="${field}" value="${value}" placeholder="${placeholder}">`;
          return input;
        }).join("")}
        <button class="remove" type="button">حذف</button>
      </div>
    `).join("");
  }

  function collectData() {
    const form = document.getElementById("settingsForm");
    data.settings = { ...data.settings };
    Array.from(form.elements).forEach(el => {
      if (el.name) data.settings[el.name] = el.value;
    });
    ["services", "faqs"].forEach(key => {
      data[key] = Array.from(document.querySelectorAll(`.editor-row[data-key="${key}"]`)).map(row => {
        const item = {};
        row.querySelectorAll("[data-field]").forEach(input => item[input.dataset.field] = input.value);
        return item;
      });
    });
    data.catalogCategories = Array.from(document.querySelectorAll(".category-row")).map(row => {
      const category = {};
      row.querySelectorAll("[data-field]").forEach(input => category[input.dataset.field] = input.value.trim());
      return category;
    }).filter(category => category.name);
    data.catalog = Array.from(document.querySelectorAll(".product-row")).map(row => {
      const existing = data.catalog[Number(row.dataset.productIndex)] || {};
      const item = { ...existing };
      row.querySelectorAll("[data-field]").forEach(input => item[input.dataset.field] = input.value);
      return item;
    });
  }

  function saveAll() {
    collectData();
    api.saveData(data);
    api.renderPublic();
    renderLeads();
    updateSummary();
    alert("تم حفظ التعديلات بنجاح");
  }

  function bindAdds() {
    document.getElementById("addService").addEventListener("click", () => {
      collectData();
      data.services.push({ title: "خدمة جديدة", description: "وصف مختصر للخدمة", icon: String(data.services.length + 1).padStart(2, "0") });
      renderEditor();
    });
    document.getElementById("addCatalog").addEventListener("click", () => {
      collectData();
      const firstCategory = (data.catalogCategories && data.catalogCategories[0] && data.catalogCategories[0].name) || "الكبائن";
      data.catalog.push({ category: firstCategory, title: "عنصر جديد", description: "وصف العنصر", type: "cabin", code: `PRD-${String(data.catalog.length + 1).padStart(2, "0")}`, image: "" });
      renderEditor();
    });
    document.getElementById("addFaq").addEventListener("click", () => {
      collectData();
      data.faqs.push({ q: "سؤال جديد", a: "إجابة مختصرة" });
      renderEditor();
    });
    document.addEventListener("click", event => {
      if (event.target.id === "addCatalogCategory") {
        collectData();
        data.catalogCategories.push({ name: "تصنيف جديد", nameEn: "New category" });
        renderEditor();
        return;
      }
      if (event.target.classList.contains("remove-category")) {
        const index = Number(event.target.closest(".category-row").dataset.categoryIndex);
        collectData();
        data.catalogCategories.splice(index, 1);
        renderEditor();
        return;
      }
      if (event.target.classList.contains("remove-product")) {
        const index = Number(event.target.closest(".product-row").dataset.productIndex);
        collectData();
        data.catalog.splice(index, 1);
        renderEditor();
        return;
      }
      if (!event.target.classList.contains("remove")) return;
      const row = event.target.closest(".editor-row");
      collectData();
      data[row.dataset.key].splice(Number(row.dataset.index), 1);
      renderEditor();
    });
    document.addEventListener("change", event => {
      if (!event.target.classList.contains("image-input")) return;
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const index = Number(event.target.dataset.index);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        collectData();
        data.catalog[index].image = reader.result;
        renderEditor();
      });
      reader.readAsDataURL(file);
    });
  }

  function renderLeads() {
    const tbody = document.getElementById("leadsTable");
    const leads = JSON.parse(localStorage.getItem("capitalUniverseLeads") || "[]");
    tbody.innerHTML = leads.map(lead => `
      <tr>
        <td>${new Date(lead.created_at).toLocaleString("ar-EG")}</td>
        <td>${api.escapeHtml(lead.name)}</td>
        <td>${api.escapeHtml(lead.phone)}</td>
        <td>${api.escapeHtml(lead.city)}</td>
        <td>${api.escapeHtml((lead.services || []).join("، "))}</td>
        <td>${api.escapeHtml(lead.urgency)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6">لا توجد طلبات بعد.</td></tr>`;
    updateSummary();
  }

  function exportLeads() {
    const leads = JSON.parse(localStorage.getItem("capitalUniverseLeads") || "[]");
    const rows = [["created_at","name","phone","city","building","elevators","urgency","services","notes"], ...leads.map(lead => [
      lead.created_at, lead.name, lead.phone, lead.city, lead.building, lead.elevators, lead.urgency, (lead.services || []).join("|"), lead.notes
    ])];
    const csv = rows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capital-universe-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindAuth();
    bindPasswordChange();
    bindModules();
    fillSettings();
    renderEditor();
    renderLeads();
    updateSummary();
    bindAdds();
    document.getElementById("saveAll").addEventListener("click", saveAll);
    document.getElementById("exportLeads").addEventListener("click", exportLeads);
  });
})();
