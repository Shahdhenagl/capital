(function () {
  const api = window.CapitalUniverse;
  let data = api.getData();

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
    renderRows("catalogEditor", data.catalog, [
      ["category", "الفئة"],
      ["title", "العنوان"],
      ["description", "الوصف"],
      ["type", "cabin / door / marble / panel / motor / shaft"]
    ], "catalog");
    renderRows("faqEditor", data.faqs, [
      ["q", "السؤال"],
      ["a", "الإجابة"]
    ], "faqs");
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
    ["services", "catalog", "faqs"].forEach(key => {
      data[key] = Array.from(document.querySelectorAll(`.editor-row[data-key="${key}"]`)).map(row => {
        const item = {};
        row.querySelectorAll("[data-field]").forEach(input => item[input.dataset.field] = input.value);
        return item;
      });
    });
  }

  function saveAll() {
    collectData();
    api.saveData(data);
    api.renderPublic();
    renderLeads();
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
      data.catalog.push({ category: "الكبائن", title: "عنصر جديد", description: "وصف العنصر", type: "cabin" });
      renderEditor();
    });
    document.getElementById("addFaq").addEventListener("click", () => {
      collectData();
      data.faqs.push({ q: "سؤال جديد", a: "إجابة مختصرة" });
      renderEditor();
    });
    document.addEventListener("click", event => {
      if (!event.target.classList.contains("remove")) return;
      const row = event.target.closest(".editor-row");
      collectData();
      data[row.dataset.key].splice(Number(row.dataset.index), 1);
      renderEditor();
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
    fillSettings();
    renderEditor();
    renderLeads();
    bindAdds();
    document.getElementById("saveAll").addEventListener("click", saveAll);
    document.getElementById("exportLeads").addEventListener("click", exportLeads);
  });
})();
