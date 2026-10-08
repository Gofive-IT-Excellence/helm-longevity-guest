// Optional HELM analysis for the authenticated intranet. Results are drafts only.
let foodAnalysis = "";
let foodNutrition = null;
let foodEstimateNotice = "";
let foodAnalysisError = "";
let analyzedPhoto = "";
let activityAnalysis = "";
let foodAiBusy = false;
let activityAiBusy = false;
let aiEpoch = 0;
let foodRequestId = 0;
let foodConfirmedName = "";
const previousAiLoadApp = loadApp;
loadApp = async function (username) {
  aiEpoch += 1;
  foodAnalysis = "";
  foodNutrition = null;
  foodEstimateNotice = "";
  foodAnalysisError = "";
  analyzedPhoto = "";
  activityAnalysis = "";
  foodAiBusy = false;
  foodConfirmedName = "";
  activityAiBusy = false;
  return previousAiLoadApp(username);
};
document.addEventListener("click", event => {
  if (event.target.closest('[data-action="logout"]')) {
    aiEpoch += 1;
    foodAnalysis = "";
    foodNutrition = null;
    foodEstimateNotice = "";
    foodAnalysisError = "";
    analyzedPhoto = "";
    activityAnalysis = "";
    foodAiBusy = false;
    foodConfirmedName = "";
    activityAiBusy = false;
  }
}, true);

const originalReviewPage = review;
function foodCorrectionForm() {
  return `<form id="ai-food-correction-form" class="food-correction-form">
    <label for="food-correct-name">ชื่ออาหารไม่ตรง? ระบุชื่อที่ถูกต้อง</label>
    <div><input id="food-correct-name" name="mealName" type="text" maxlength="100" placeholder="เช่น ข้าวซอย" value="${esc(foodConfirmedName)}" required><button type="submit" ${foodAiBusy ? "disabled" : ""}>แก้ชื่อและวิเคราะห์ใหม่</button></div>
  </form>`;
}
function foodResultCard() {
  if (!foodAnalysis) return "";
  const nutrition = foodNutrition;
  if (!nutrition || typeof nutrition.meal_name !== "string") {
    return `<section class="food-result-card" role="status"><span class="food-result-label">ผลวิเคราะห์จาก HELM</span><p class="food-result-fallback">${esc(foodAnalysis)}</p><p class="food-result-footer">${esc(foodEstimateNotice || "ตรวจชื่ออาหาร ปริมาณ และสารอาหารก่อนบันทึก")}</p>${foodCorrectionForm()}</section>`;
  }
  const notes = Array.isArray(nutrition.assumptions) ? nutrition.assumptions.filter(note =>
    typeof note === "string" && note.trim() && !/ผลนี้เป็นร่าง|กรุณาตรวจ.*ก่อนบันทึก/.test(note)
  ).slice(0, 4) : [];
  return `<section class="food-result-card" role="status" aria-label="ผลวิเคราะห์จาก HELM">
    <div class="food-result-top"><span class="food-result-label">ผลวิเคราะห์จาก HELM</span><span class="food-result-badge">ค่าประมาณ</span></div>
    <h2>${esc(nutrition.meal_name)}</h2>
    ${nutrition.portion ? `<p class="food-result-portion"><strong>ปริมาณที่ใช้ประเมิน</strong><span>${esc(nutrition.portion)}</span></p>` : ""}
    ${notes.length ? `<div class="food-result-notes"><h3>สิ่งที่ควรตรวจเพิ่ม</h3><ul>${notes.map(note => `<li>${esc(note.trim())}</li>`).join("")}</ul></div>` : ""}
    <p class="food-result-footer">${esc(foodEstimateNotice || "ตรวจชื่ออาหาร ปริมาณ และสารอาหารก่อนบันทึก")}</p>
    ${foodCorrectionForm()}
  </section>`;
}
review = function () {
  const samePhoto = analyzedPhoto === state.photo;
  const statusText = previewMode ? "โหมดทดลอง: บันทึกอาหารด้วยตนเองได้ ส่วนการวิเคราะห์รูปจะเปิดหลังเชื่อมบัญชีบริษัท" : !state.photo ? "ถ่ายหรือเลือกรูปอาหารก่อน แล้ว HELM จะวิเคราะห์ให้" : foodAiBusy ? "กำลังวิเคราะห์รูปอาหาร…" : samePhoto && foodAnalysis ? "" : "ผลจาก AI เป็นค่าประมาณ กรุณาตรวจและแก้ไขก่อนบันทึก";
  const button = `<button type="button" class="solid-button ai-photo-button" data-action="ai-food" ${previewMode || !state.photo || foodAiBusy ? "disabled" : ""}>${previewMode ? "วิเคราะห์รูปด้วย HELM (รอเชื่อมต่อ)" : foodAiBusy ? "HELM กำลังวิเคราะห์…" : "วิเคราะห์รูปด้วย HELM"}</button>`;
  const feedback = `<div class="ai-photo-feedback" aria-live="polite">
    ${statusText}
    ${samePhoto && foodAnalysisError ? `<p class="ai-photo-error" role="alert">${esc(foodAnalysisError)}</p>` : ""}
    ${samePhoto && foodAnalysis ? foodResultCard() : ""}
    ${state.photo && !foodAiBusy && !(samePhoto && foodAnalysis) ? `<div class="food-correction-prompt">${foodCorrectionForm()}</div>` : ""}
  </div>`;
  return originalReviewPage()
    .replace('<div class="review-photo-actions">', `<div class="review-photo-actions">${button}`)
    .replace('<section class="review-summary"', `${feedback}<section class="review-summary"`);
};

const originalActivityPage = activity;
activity = function () {
  return originalActivityPage() + `<section class="ai-assist" aria-label="คำแนะนำกิจกรรมจาก HELM">
    <h2>ให้ HELM ช่วยแนะนำกิจกรรม</h2>
    <p>${previewMode ? "โหมดทดลองยังไม่เชื่อม HELM AI บันทึกกิจกรรมด้วยตนเองได้" : "ใช้ข้อมูลที่คุณบันทึกไว้ แผนที่แนะนำจะไม่ถูกนับเป็นกิจกรรมที่ทำแล้ว"}</p>
    <button type="button" class="solid-button" data-action="ai-activity" ${previewMode || activityAiBusy ? "disabled" : ""}>${previewMode ? "รอเชื่อมต่อ HELM" : activityAiBusy ? "HELM กำลังวิเคราะห์…" : "ขอคำแนะนำวันนี้"}</button>
    ${activityAnalysis ? `<div class="ai-assist-result" role="status">${esc(activityAnalysis)}</div>` : ""}
  </section>`;
};

async function requestAi(path, body) {
  const action = ({"/api/ai/food":"ai.food","/api/ai/activity":"ai.activity"})[path];
  if (!action) throw new Error("ไม่รู้จักคำขอ HELM");
  const result = await apiCall(action, body);
  if (typeof result.answer !== "string" || !result.answer.trim()) throw new Error("HELM ไม่ส่งคำตอบกลับมา");
  return result;
}

function foodDraftFromAnalysis(analysis) {
  if (!analysis || typeof analysis.meal_name !== "string" || !analysis.totals) return null;
  const totals = analysis.totals;
  const required = ["kcal", "protein_g", "carbs_g", "fat_g"];
  if (!required.every(key => typeof totals[key] === "number" && Number.isFinite(totals[key]) && totals[key] >= 0)) return null;
  const optional = key => typeof totals[key] === "number" && Number.isFinite(totals[key]) && totals[key] >= 0 ? totals[key] : null;
  return {name: analysis.meal_name.trim(), kcal: totals.kcal, protein: totals.protein_g,
    carbs: totals.carbs_g, fat: totals.fat_g, sugar: optional("sugar_g"),
    sodium: optional("sodium_mg"), cholesterol: optional("cholesterol_mg"),
    source_type: "ai_estimate"};
}

async function analyzeFoodPhoto(confirmedName = foodConfirmedName) {
  if (previewMode) return;
  if (!signedIn || !state.photo || state.tab !== "review") return;
  const photo = state.photo;
  const epoch = aiEpoch;
  const requestId = ++foodRequestId;
  const isCurrent = () => signedIn && aiEpoch === epoch && foodRequestId === requestId && state.photo === photo && state.tab === "review";
  foodAiBusy = true;
  foodAnalysis = "";
  foodNutrition = null;
  foodEstimateNotice = "";
  foodAnalysisError = "";
  analyzedPhoto = photo;
  render();
  try {
    const notes = confirmedName ? `ผู้ใช้ยืนยันชื่อเมนู: ${confirmedName}` : "";
    const result = await requestAi("/api/ai/food", {photo, notes});
    if (!isCurrent()) return;
    if (confirmedName) {
      const modelName = String(result.nutrition?.meal_name || "").replace(/\s/g, "");
      const userName = confirmedName.replace(/\s/g, "");
      if (!modelName || !(modelName.includes(userName) || userName.includes(modelName))) {
        foodAnalysis = confirmedName;
        foodNutrition = {meal_name: confirmedName, portion: "", assumptions: ["HELM ยังระบุเมนูไม่ตรงกับชื่อที่คุณแก้ จึงไม่เติมค่าสารอาหารอัตโนมัติ"]};
        foodEstimateNotice = "กรุณาตรวจส่วนประกอบและกรอกค่าสารอาหารด้วยตนเอง";
        return;
      }
    }
    foodAnalysis = result.answer;
    foodNutrition = result.nutrition || null;
    const draft = foodDraftFromAnalysis(result.nutrition);
    if (draft) {
      state.draftItems = [draft];
      state.draftName = draft.name;
      foodEstimateNotice = "เติมค่าประมาณลงการ์ดแล้ว กรุณาตรวจปริมาณและแก้ไขก่อนกดบันทึกมื้ออาหาร";
      persist();
    } else {
      if (result.nutrition?.needs_label_check) {
        state.draftItems = (state.draftItems || []).filter(item => item.source_type !== "ai_estimate");
        persist();
        foodEstimateNotice = "ยังยืนยันสูตรหรือฉลากไม่ได้ จึงไม่เติมตัวเลขลงการ์ด กรุณาดูฉลากแล้วกรอกค่าด้วยตนเอง";
      } else {
        foodEstimateNotice = "HELM ยังไม่ส่งตัวเลขครบสำหรับการ์ด กรุณาตรวจผลและกรอกค่าด้วยตนเอง";
      }
    }
  } catch (error) {
    if (isCurrent()) foodAnalysisError = error.message || "เชื่อมต่อ HELM ไม่สำเร็จ";
  } finally {
    if (aiEpoch === epoch && foodRequestId === requestId) {
      foodAiBusy = false;
      if (state.tab === "review") render();
    }
  }
}

document.addEventListener("helm:photo-ready", () => {
  // A new photo must not display nutrient values left over from the previous meal.
  foodConfirmedName = "";
  state.draftItems = [];
  state.draftName = "";
  persist();
  void analyzeFoodPhoto();
});

document.addEventListener("submit", async event => {
  if (event.target.id !== "ai-food-correction-form") return;
  event.preventDefault();
  if (previewMode || !signedIn || foodAiBusy) return;
  const name = event.target.elements.mealName.value.trim();
  if (!name || name.length > 100) return;
  foodConfirmedName = name;
  state.draftName = name;
  state.draftItems = (state.draftItems || []).filter(item => item.source_type !== "ai_estimate");
  persist();
  await analyzeFoodPhoto(name);
});

document.addEventListener("click", async event => {
  const button = event.target.closest('[data-action="ai-food"], [data-action="ai-activity"]');
  if (!button || previewMode || !signedIn) return;
  const epoch = aiEpoch;
  if (button.dataset.action === "ai-food") {
    if (foodAiBusy) return;
    await analyzeFoodPhoto();
  } else {
    if (activityAiBusy) return;
    const weight = Number(state.weightKg);
    const context = {
      steps: Number(state.steps) > 0 ? Math.round(Number(state.steps)) : null,
      shift: String(state.shift || "ไม่ระบุ"),
      activity: String(state.activity || ""),
      duration: Math.round(Number(state.duration) || 0),
      activityDone: state.activityDone === true,
      weightKg: weight >= 20 && weight <= 500 ? weight : null,
    };
    activityAiBusy = true;
    activityAnalysis = "";
    render();
    try {
      const result = await requestAi("/api/ai/activity", {context});
      if (signedIn && aiEpoch === epoch) activityAnalysis = result.answer;
    } catch (error) {
      if (signedIn && aiEpoch === epoch) toast(error.message || "เชื่อมต่อ HELM ไม่สำเร็จ");
    } finally {
      if (aiEpoch === epoch) {
        activityAiBusy = false;
        if (state.tab === "activity") render();
      }
    }
  }
});
