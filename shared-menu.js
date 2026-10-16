// Load the shared wheel choices without restricting the rest of the app.
// The company site reads menus published by the admin editor on GitHub Pages.
const publishedMenuUrl = location.hostname === "helmlongevity.go5.online"
  ? "https://gofive-it-excellence.github.io/helm-longevity-guest/menus.json"
  : "menus.json";
fetch(`${publishedMenuUrl}?v=${Math.floor(Date.now() / 60000)}`, {cache: "no-store"}).then(response => {
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

// Admin-managed menus have names and icons, but no ingredient or energy data.
// Send the user to scan the actual dish rather than displaying a false 0 kcal.
wheelResultHTML = function () {
  if (wheelResultIndex < 0) return "";
  const meal = WHEEL_MEALS[wheelResultIndex];
  return `<div class="wheel-result-heading"><img class="mascot-win" data-mascot="thumbs" alt="น้อง HELM ยกนิ้วให้"><div><span class="eyebrow">ผลที่สุ่มได้ ${esc(meal.emoji)} ✨</span><h2>${esc(meal.name)}</h2></div></div>
    <p>เมนูที่สุ่มเป็นไอเดียอาหาร พลังงานจริงขึ้นกับสูตรและปริมาณ</p>
    <div class="wheel-result-actions"><button class="solid-button" data-action="scan">${icon("camera")} ซื้อแล้วสแกนอาหาร</button>
    <button class="ghost-button" data-action="spin-wheel">หมุนอีกครั้ง</button></div>`;
};
