"use strict";

const fallback = {version: 1, meals: [
  {name: "ข้าวกะเพราไก่", emoji: "🌶️"},
  {name: "ข้าวมันไก่", emoji: "🍗"},
  {name: "ข้าวผัดหมู", emoji: "🍚"},
  {name: "ข้าวไข่เจียว", emoji: "🍳"},
  {name: "ผัดซีอิ๊วหมู", emoji: "🍜"},
  {name: "ข้าวต้มหมู", emoji: "🥣"}
]};
const repository = "Gofive-IT-Excellence/helm-longevity-guest";
const apiUrl = `https://api.github.com/repos/${repository}/contents/menus.json`;
const list = document.getElementById("menu-list");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const tokenInput = document.getElementById("github-token");
const publishButton = document.getElementById("publish");
let loadedMeals = null;

function setStatus(message, error = false, commitUrl = "") {
  status.replaceChildren(document.createTextNode(message));
  status.classList.toggle("error", error);
  if (commitUrl) {
    const link = document.createElement("a");
    link.href = commitUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = " ดู commit บน GitHub";
    status.append(link);
  }
}

function renderEditor(meals) {
  list.replaceChildren();
  meals.forEach((meal, index) => {
    const row = document.createElement("div");
    row.className = "row";
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(index + 1);
    row.append(num);
    for (const [field, label, max] of [["name", "ชื่ออาหาร", 32], ["emoji", "ไอคอน", 12]]) {
      const wrap = document.createElement("label");
      wrap.className = "field";
      wrap.textContent = label;
      const input = document.createElement("input");
      input.name = field;
      input.value = meal[field];
      input.maxLength = max;
      input.required = true;
      input.setAttribute("aria-label", `${label} ช่องที่ ${index + 1}`);
      wrap.append(input);
      row.append(wrap);
    }
    list.append(row);
  });
  updatePreview();
}

function currentMeals() {
  return [...list.children].map(row => ({
    name: row.querySelector('[name="name"]').value.trim(),
    emoji: row.querySelector('[name="emoji"]').value.trim()
  }));
}

function updatePreview() {
  preview.replaceChildren(...currentMeals().map(meal => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `${meal.emoji || "🍽️"} ${meal.name || "ยังไม่มีชื่อ"}`;
    return chip;
  }));
}

function output() {
  const meals = currentMeals();
  if (meals.length !== 6 || meals.some(meal => !meal.name || !meal.emoji)) {
    setStatus("กรุณาใส่ชื่ออาหารและไอคอนให้ครบทั้ง 6 ช่อง", true);
    return null;
  }
  if (new Set(meals.map(meal => meal.name.toLocaleLowerCase("th-TH"))).size !== 6) {
    setStatus("มีชื่อเมนูซ้ำกัน กรุณาเปลี่ยนให้ไม่ซ้ำ", true);
    return null;
  }
  return JSON.stringify({version: 1, meals}, null, 2) + "\n";
}

function decodeBase64Utf8(content) {
  const binary = atob(content.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

function encodeBase64Utf8(content) {
  const bytes = new TextEncoder().encode(content);
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
}

async function githubRequest(url, options, token) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("GitHub ไม่อนุญาตให้เผยแพร่ ตรวจสิทธิ์ token และ repository");
    if (response.status === 409 || response.status === 422) throw new Error("ไฟล์เมนูเปลี่ยนไปแล้ว กรุณารีโหลดหน้าก่อนเผยแพร่อีกครั้ง");
    throw new Error(`GitHub ตอบกลับไม่สำเร็จ (${response.status})`);
  }
  return data;
}

async function publish() {
  const json = output();
  if (!json) return;
  const token = tokenInput.value.trim();
  if (!token) {
    setStatus("กรุณาวาง GitHub token ก่อนเผยแพร่", true);
    tokenInput.focus();
    return;
  }
  publishButton.disabled = true;
  publishButton.textContent = "กำลังเผยแพร่…";
  setStatus("กำลังตรวจเมนูบน GitHub…");
  try {
    const file = await githubRequest(`${apiUrl}?ref=main`, {method: "GET"}, token);
    if (!file.sha || !file.content) throw new Error("อ่านไฟล์เมนูบน GitHub ไม่ได้");
    const remote = JSON.parse(decodeBase64Utf8(file.content));
    if (!loadedMeals || JSON.stringify(remote.meals) !== JSON.stringify(loadedMeals)) {
      throw new Error("เมนูบน GitHub เปลี่ยนไปจากตอนเปิดหน้านี้ กรุณาคัดลอกข้อมูลที่แก้ไว้แล้วรีโหลดหน้า");
    }
    if (JSON.stringify(remote.meals) === JSON.stringify(JSON.parse(json).meals)) {
      setStatus("รายการนี้เผยแพร่อยู่แล้ว ไม่มีข้อมูลที่ต้องอัปเดต");
      return;
    }
    setStatus("กำลังบันทึกเมนูบน GitHub…");
    const result = await githubRequest(apiUrl, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        message: "Update HELM wheel menu from admin editor",
        content: encodeBase64Utf8(json),
        sha: file.sha,
        branch: "main"
      })
    }, token);
    loadedMeals = JSON.parse(json).meals;
    tokenInput.value = "";
    const commitUrl = result.commit?.html_url || "";
    setStatus("บันทึกเมนูบน GitHub แล้ว รอ Coolify Deploy แล้วรีเฟรชหน้าเว็บ", false, commitUrl);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "เผยแพร่ไม่สำเร็จ กรุณาลองใหม่", true);
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "เผยแพร่เมนูขึ้นเว็บ";
  }
}

list.addEventListener("input", () => { updatePreview(); setStatus("รายการยังไม่ถูกเผยแพร่"); });
document.getElementById("copy").addEventListener("click", async () => {
  const json = output();
  if (!json) return;
  try {
    await navigator.clipboard.writeText(json);
    setStatus("คัดลอกแล้ว สามารถนำไปแก้ menus.json บน GitHub ได้");
  } catch { setStatus("คัดลอกไม่สำเร็จ กรุณาใช้ปุ่มดาวน์โหลดแทน", true); }
});
document.getElementById("download").addEventListener("click", () => {
  const json = output();
  if (!json) return;
  const url = URL.createObjectURL(new Blob([json], {type: "application/json"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = "menus.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("ดาวน์โหลดแล้ว นำข้อมูลไปแทนที่ menus.json บน GitHub ได้");
});
publishButton.addEventListener("click", publish);
fetch("menus.json", {cache: "no-store"})
  .then(response => { if (!response.ok) throw new Error(); return response.json(); })
  .then(data => {
    if (!Array.isArray(data.meals) || data.meals.length !== 6) throw new Error();
    loadedMeals = data.meals;
    renderEditor(data.meals);
  })
  .catch(() => {
    renderEditor(fallback.meals);
    setStatus("โหลดเมนูที่เผยแพร่ไม่ได้ จึงแสดงรายการตัวอย่าง กรุณารีโหลดหน้าก่อนเผยแพร่", true);
  });
