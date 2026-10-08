// Sprint production scope. Earlier features remain in the prototype and
// integration files so they can be restored without rebuilding them.
const SPRINT_TABS = new Set(["today", "wheel", "review"]);

// The company site reads the menu from GitHub Pages. A menu commit can then
// update the wheel without rebuilding the Coolify application.
const publishedMenuUrl = location.hostname === "helmlongevity.go5.online"
  ? "https://gofive-it-excellence.github.io/helm-longevity-guest/menus.json"
  : "menus.json";
fetch(`${publishedMenuUrl}?v=${Math.floor(Date.now() / 60000)}`, { cache: "no-store" }).then(response => {
  if (!response.ok) throw new Error("Menu list unavailable");
  return response.json();
}).then(data => {
  if (!Array.isArray(data.meals) || data.meals.length !== 6) throw new Error("Invalid menu count");
  const meals = data.meals.map(meal => ({
    name: String(meal.name || "").trim(),
    emoji: String(meal.emoji || "🍽️").trim(),
    items: []
  }));
  if (meals.some(meal => !meal.name || meal.name.length > 32 || meal.emoji.length > 12)) throw new Error("Invalid menu entry");
  WHEEL_MEALS.splice(0, WHEEL_MEALS.length, ...meals);
  wheelResultIndex = -1;
  if (state.tab === "wheel") render();
}).catch(error => console.warn("Using built-in wheel menus:", error.message));

navHTML = function () {
  return [
    ["today", "camera", "สแกนอาหาร"],
    ["wheel", "wheel", "สุ่มเมนู"],
  ].map(([key, symbol, label]) =>
    `<button type="button" data-action="nav" data-tab="${key}" class="${state.tab === key || key === "today" && state.tab === "review" ? "active" : ""}" aria-current="${state.tab === key || key === "today" && state.tab === "review" ? "page" : "false"}">${icon(symbol)}<span>${label}</span></button>`
  ).join("");
};

home = function () {
  return `<div class="sprint-home">
    ${header("สแกนอาหาร ดูแคลอรี", "ถ่ายหรือเลือกรูปอาหาร แล้วตรวจค่าประมาณจาก HELM")}
    ${previewMode ? '<p class="sprint-status" role="status">ตอนนี้ดูหน้าสแกนได้ แต่การวิเคราะห์แคลอรีด้วย HELM ยังรอเปิดระบบเชื่อมต่อ</p>' : ''}
    <section class="sprint-primary" aria-label="สแกนอาหาร">
      <div class="sprint-primary-copy"><span class="eyebrow">HELM FOOD SCAN</span>
        <h2>มื้อนี้ประมาณกี่แคล?</h2>
        <p>เห็นชื่ออาหารและพลังงานโดยประมาณจากรูป ตรวจปริมาณจริงก่อนนำไปใช้</p>
        <div class="sprint-actions"><button type="button" class="solid-button" data-action="camera-live">${icon("camera")} เปิดกล้อง</button>
        <button type="button" class="ghost-button" data-action="scan">${icon("upload")} เลือกรูปอาหาร</button></div>
      </div><img data-mascot="home" alt="น้อง HELM ชวนสแกนอาหาร">
    </section>
    <button type="button" class="sprint-wheel-link" data-action="nav" data-tab="wheel">
      <span class="sprint-wheel-icon">${icon("wheel")}</span>
      <span><strong>กินอะไรดี?</strong><small>หมุนวงล้อสุ่มไอเดียเมนู</small></span>${icon("right")}
    </button>
    <p class="sprint-disclaimer">ผลวิเคราะห์จากภาพเป็นค่าประมาณ ชื่ออาหาร ปริมาณ และแคลอรีอาจคลาดเคลื่อน</p>
  </div>`;
};

wheelResultHTML = function () {
  if (wheelResultIndex < 0) return "";
  const meal = WHEEL_MEALS[wheelResultIndex];
  return `<div class="wheel-result-heading"><img class="mascot-win" data-mascot="thumbs" alt="น้อง HELM ยกนิ้วให้"><div><span class="eyebrow">ผลที่สุ่มได้ ${esc(meal.emoji)} ✨</span><h2>${esc(meal.name)}</h2></div></div>
    <p>เมนูที่สุ่มเป็นไอเดียอาหาร พลังงานจริงขึ้นกับสูตรและปริมาณ</p>
    <div class="wheel-result-actions"><button class="solid-button" data-action="scan">${icon("camera")} ซื้อแล้วสแกนอาหาร</button>
    <button class="ghost-button" data-action="spin-wheel">หมุนอีกครั้ง</button></div>`;
};

const sprintWheelPage = wheelPage;
wheelPage = function () {
  return sprintWheelPage().replace(
    "• พลังงานเป็นค่าประมาณจากรายการตัวอย่าง",
    ""
  );
};

const sprintReview = review;
review = function () {
  return sprintReview()
    .replace("ตรวจมื้ออาหาร", "ผลสแกนอาหาร")
    .replace("ตรวจวัตถุดิบและสารอาหารก่อนบันทึก", "ดูค่าประมาณและแก้ชื่ออาหารได้")
    .replace(/<form id="food-review-form" class="review-save">[\s\S]*?<\/form>/, "")
    .replaceAll("ก่อนบันทึก", "ก่อนนำไปใช้")
    .replace("โหมดทดลอง: บันทึกอาหารด้วยตนเองได้ ส่วนการวิเคราะห์รูปจะเปิดหลังเชื่อมบัญชีบริษัท", "การวิเคราะห์แคลอรีด้วย HELM ยังรอเปิดระบบเชื่อมต่อ")
    .replace("วิเคราะห์รูปด้วย HELM (รอเชื่อมต่อ)", "วิเคราะห์แคลอรี (รอเปิดระบบ)")
    .replace("ตรวจอาหารในจาน", "ตรวจชื่ออาหารและปริมาณจริง");
};

const sprintRender = render;
render = function () {
  if (!SPRINT_TABS.has(state.tab)) state.tab = "today";
  sprintRender();
};

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "scan") {
    event.stopImmediatePropagation();
    event.preventDefault();
    modal("สแกนอาหาร", "ถ่ายหรือเลือกรูปเพื่อดูแคลอรีโดยประมาณ",
      `<div class="modal-list"><button data-action="camera-live">${icon("camera")} เปิดกล้องถ่ายรูป</button>
      <button data-action="choose-photo">${icon("upload")} เลือกรูปจากเครื่อง</button></div>
      <p class="modal-help">ตรวจชื่ออาหารและปริมาณจริงหลังวิเคราะห์รูป</p>`);
  } else if (button.dataset.action === "nav" && !SPRINT_TABS.has(button.dataset.tab)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);
