ICONS.coach='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M160,40a32,32,0,1,0-32,32A32,32,0,0,0,160,40ZM128,56a16,16,0,1,1,16-16A16,16,0,0,1,128,56ZM231.5,87.71A19.62,19.62,0,0,0,212,72H44a20,20,0,0,0-8.38,38.16l.13,0,50.75,22.35-21,79.72A20,20,0,0,0,102,228.8l26-44.87,26,44.87a20,20,0,0,0,36.4-16.52l-21-79.72,50.75-22.35.13,0A19.64,19.64,0,0,0,231.5,87.71Zm-17.8,7.9-56.93,25.06a8,8,0,0,0-4.51,9.36L175.13,217a7,7,0,0,0,.49,1.35,4,4,0,0,1-5,5.45,4,4,0,0,1-2.25-2.07,6.31,6.31,0,0,0-.34-.63L134.92,164a8,8,0,0,0-13.84,0L88,221.05a6.31,6.31,0,0,0-.34.63,4,4,0,0,1-2.25,2.07,4,4,0,0,1-5-5.45,7,7,0,0,0,.49-1.35L103.74,130a8,8,0,0,0-4.51-9.36L42.3,95.61A4,4,0,0,1,44,88H212a4,4,0,0,1,1.73,7.61Z"></path></svg>';
ICONS.send='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M227.32,28.68a16,16,0,0,0-16.41-3.93L32.41,92.86a16,16,0,0,0,.8,30.14l74.89,25,25,74.89a16,16,0,0,0,15,10.95h.4a16,16,0,0,0,14.74-10.55l68.11-178.5A16,16,0,0,0,227.32,28.68ZM148.5,207.27l-21.07-63.2,44.37-44.37a8,8,0,0,0-11.32-11.32l-44.37,44.37-63.2-21.07L216,49.53Z"></path></svg>';
// Authenticated trainer chat. The browser talks only to this application's server.
const trainerMessages = [];
let trainerBusy = false;
let trainerEpoch = 0;
let trainerPendingPhoto = "";
let trainerPhotoLoading = false;
const originalRender = render;
const originalLoadApp = loadApp;
loadApp = async function (username) {
  trainerEpoch += 1;
  trainerMessages.length = 0;
  trainerBusy = false;
  trainerPendingPhoto = "";
  trainerPhotoLoading = false;
  return originalLoadApp(username);
};
document.addEventListener("click", event => {
  if (event.target.closest('[data-action="logout"]')) {
    trainerEpoch += 1;
    trainerMessages.length = 0;
    trainerBusy = false;
    trainerPendingPhoto = "";
    trainerPhotoLoading = false;
  }
}, true);

navHTML = function () {
  return [
    ["today", "home", "วันนี้"],
    ["food", "food", "อาหาร"],
    ["wheel", "wheel", "กินอะไรดี"],
    ["activity", "run", "กิจกรรม"],
    ["trainer", "coach", "เทรนเนอร์"],
    ["profile", "user", "ฉัน"],
  ].map(([key, name, label]) => `<button type="button" data-action="nav" data-tab="${key}" class="${state.tab === key ? "active" : ""}" aria-current="${state.tab === key ? "page" : "false"}">${icon(name)}<span>${label}</span></button>`).join("");
};

function trainerInline(text) {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function trainerAnswerHtml(content) {
  // HELM sometimes puts emoji bullets in one paragraph. Separate them before rendering.
  const prepared = String(content || "").replace(/\r\n?/g, "\n")
    .replace(/([^\n])\s+[-•]\s+(?=[\u2600-\u27BF\u{1F300}-\u{1FAFF}])/gu, "$1\n- ");
  const blocks = [];
  let list = [];
  let listTag = "";
  const flushList = () => {
    if (list.length) blocks.push(`<${listTag}>${list.map(item => `<li>${trainerInline(item)}</li>`).join("")}</${listTag}>`);
    list = [];
    listTag = "";
  };
  for (const raw of prepared.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const bullet = line.match(/^[-•*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const tag = numbered ? "ol" : "ul";
      if (listTag && listTag !== tag) flushList();
      listTag = tag;
      list.push((bullet || numbered)[1]);
    } else {
      flushList();
      blocks.push(`<p>${trainerInline(line)}</p>`);
    }
  }
  flushList();
  return blocks.join("");
}

function trainerPage() {
  return `<div class="trainer-page" aria-label="แชต AI เทรนเนอร์">
    <div class="trainer-heading"><span class="trainer-heading-mark">${icon("coach")}</span><div><h1>AI เทรนเนอร์</h1><p>คุยเรื่องการออกกำลังกายกับ HELM</p></div></div>
    <div id="trainer-chat" class="trainer-chat" role="log" aria-live="polite">${trainerMessages.map(message =>
      `<div class="trainer-message ${message.role}">${message.role === "assistant" ? trainerAnswerHtml(message.content) : `<p>${esc(message.content)}</p>${message.photo ? `<img class="trainer-message-photo" src="${esc(message.photo)}" alt="รูปอาหารที่ส่งให้ HELM">` : ""}`}</div>`).join("")}${trainerBusy ? '<div class="trainer-message assistant" role="status"><p>HELM กำลังตอบ…</p></div>' : ""}</div>
    ${trainerPendingPhoto ? `<div class="trainer-photo-preview"><img src="${esc(trainerPendingPhoto)}" alt="รูปอาหารที่จะแนบ"><span>รูปอาหารพร้อมส่ง</span><button type="button" data-action="trainer-remove-photo" aria-label="ลบรูปที่แนบ">×</button></div>` : ""}
    <form id="trainer-form" class="trainer-compose"><button class="trainer-attach" type="button" data-action="trainer-camera" aria-label="ถ่ายรูปอาหาร" title="ถ่ายรูปอาหาร" ${previewMode || trainerBusy || trainerPhotoLoading ? "disabled" : ""}>${icon("camera")}</button><button class="trainer-attach" type="button" data-action="trainer-gallery" aria-label="เลือกรูปอาหาร" title="เลือกรูปอาหาร" ${previewMode || trainerBusy || trainerPhotoLoading ? "disabled" : ""}>${icon("upload")}</button><input name="message" type="text" maxlength="1000" autocomplete="off" aria-label="พิมพ์คำถามถึง AI เทรนเนอร์" placeholder="${previewMode ? "โหมดทดลองยังไม่เชื่อม HELM AI" : "ถาม HELM หรือแนบรูปอาหาร…"}" ${previewMode ? "disabled" : ""}><button class="trainer-send" type="submit" aria-label="ส่งข้อความ" ${previewMode || trainerBusy || trainerPhotoLoading ? "disabled" : ""}>${icon("send")}</button><input id="trainer-camera-input" class="trainer-file-input" type="file" accept="image/*" capture="environment" aria-label="ถ่ายรูปอาหาร"><input id="trainer-gallery-input" class="trainer-file-input" type="file" accept="image/*" aria-label="เลือกรูปอาหาร"></form>
    <p class="trainer-note">${previewMode ? "โหมดทดลอง • เปิดแชตได้เมื่อเชื่อมบัญชีบริษัทและ HELM AI" : "คำแนะนำทั่วไป • หากเจ็บหรือมีอาการผิดปกติ ให้หยุดกิจกรรม"}</p>
  </div>`;
}

render = function () {
  if (state.tab !== "trainer") return originalRender();
  $("#main").innerHTML = trainerPage();
  $("#side-nav").innerHTML = navHTML();
  $("#bottom-nav").innerHTML = navHTML();
  document.querySelectorAll("[data-icon]").forEach(element => element.innerHTML = icon(element.dataset.icon));
  document.title = "AI เทรนเนอร์ • HELM Longevity";
  window.scrollTo(0, 0);
};

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "trainer-camera" || action === "trainer-gallery") {
    if (!trainerBusy && !trainerPhotoLoading) $(action === "trainer-camera" ? "#trainer-camera-input" : "#trainer-gallery-input")?.click();
  } else if (action === "trainer-remove-photo") {
    trainerPendingPhoto = "";
    if (state.tab === "trainer") render();
  }
});

function readTrainerPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || file.size > 15_000_000) return reject(new Error("กรุณาเลือกรูปภาพขนาดไม่เกิน 15 MB"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านรูปภาพไม่ได้ กรุณาลองใหม่"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("เปิดรูปภาพไม่ได้ กรุณาเลือกรูปอื่น"));
      image.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        const photo = canvas.toDataURL("image/jpeg", .76);
        if (photo.length > 1_200_000) return reject(new Error("รูปภาพใหญ่เกินไป กรุณาเลือกรูปอื่น"));
        resolve(photo);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.addEventListener("change", async event => {
  if (event.target.id !== "trainer-camera-input" && event.target.id !== "trainer-gallery-input") return;
  const file = event.target.files?.[0];
  if (!file || trainerBusy) return;
  const epoch = trainerEpoch;
  trainerPhotoLoading = true;
  try {
    const photo = await readTrainerPhoto(file);
    if (epoch === trainerEpoch && signedIn) trainerPendingPhoto = photo;
  } catch (error) {
    if (epoch === trainerEpoch) toast(error.message || "แนบรูปภาพไม่สำเร็จ");
  } finally {
    if (epoch === trainerEpoch) {
      trainerPhotoLoading = false;
      if (state.tab === "trainer") render();
    }
  }
});

document.addEventListener("submit", async event => {
  if (event.target.id !== "trainer-form") return;
  event.preventDefault();
  if (previewMode || trainerBusy || !signedIn) return;
  const photo = trainerPendingPhoto;
  const text = event.target.elements.message.value.trim() || (photo ? "ช่วยดูรูปอาหารนี้และบอกสิ่งที่เห็นกับข้อจำกัดของการประเมิน" : "");
  if (!text || trainerPhotoLoading) return;
  trainerMessages.push({role: "user", content: text, photo});
  trainerPendingPhoto = "";
  const epoch = trainerEpoch;
  trainerBusy = true;
  render();
  try {
    const history = trainerMessages.filter(item => item.role === "user" || item.role === "assistant")
      .slice(-12).map(item => ({role: item.role, content: item.role === "assistant" ? item.content.slice(0, 12000) : item.content}));
    const result = await apiCall("ai.trainer", {messages: history, ...(photo ? {photo} : {})});
    if (!signedIn || epoch !== trainerEpoch) return;
    if (typeof result.answer !== "string" || !result.answer.trim()) throw new Error("HELM ไม่ส่งคำตอบกลับมา");
    trainerMessages.push({role: "assistant", content: result.answer});
  } catch (error) {
    if (signedIn && epoch === trainerEpoch) trainerMessages.push({role: "system", content: error.message || "เชื่อมต่อ HELM ไม่สำเร็จ"});
  } finally {
    if (epoch !== trainerEpoch) return;
    trainerBusy = false;
    if (state.tab === "trainer") {
      render();
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  }
});
