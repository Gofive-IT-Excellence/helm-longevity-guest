// Public GitHub Pages client. Personal records stay in this browser.
const INITIAL_STATE=JSON.parse(JSON.stringify(state));
let signedIn=false;
const previewMode=false; // AI is available in this guest pilot.
const cfg=window.HELM_CONFIG||{};
const LOCAL_STORAGE_KEY="helm-longevity-guest-v1";
function stateForStorage(){const copy=JSON.parse(JSON.stringify(state));copy.photo=null;for(const meal of copy.meals||[])meal.photo=null;return copy}
persist=function(){try{localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(stateForStorage()))}catch{toast("พื้นที่จัดเก็บในเครื่องเต็ม")}};
async function apiCall(action,payload={}){
  if(!cfg.webhookBaseUrl)throw new Error("ยังไม่ได้ตั้งค่า n8n สำหรับเว็บนี้");
  const endpoint=cfg.webhookBaseUrl.replace(/\/$/,"")+"/"+action.replace(".","/");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),90000);
  try{
    const response=await fetch(endpoint,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"text/plain"},body:JSON.stringify({action,payload}),signal:controller.signal});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.ok===false)throw new Error(result.error||`n8n ตอบกลับไม่สำเร็จ (${response.status})`);
    return result;
  }catch(error){if(error.name==="AbortError")throw new Error("HELM ใช้เวลานานเกินไป กรุณาลองอีกครั้ง");throw error}finally{clearTimeout(timer)}
}
function updateDateAndShift(){const date=new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"numeric"}).format(new Date());document.querySelectorAll(".today-date").forEach(el=>el.textContent=date);document.querySelectorAll(".shift-pill").forEach(el=>{if(el.lastChild)el.lastChild.textContent=state.shift||"ไม่ระบุ"})}
async function loadApp(){
  try{state={...INITIAL_STATE,...JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)||"{}")}}catch{state=JSON.parse(JSON.stringify(INITIAL_STATE))}
  if(!Array.isArray(state.meals))state.meals=[];
  if(!Array.isArray(state.draftItems))state.draftItems=[];
  if(!Array.isArray(state.weightHistory))state.weightHistory=[];
  if(state.trackerDate!==currentDay()){state.waterMl=0;state.steps=0;state.activityKcal=0;state.activityDone=false;state.trackerDate=currentDay()}
  signedIn=true;
  document.querySelector("#auth-root")?.remove();
  document.body.classList.add("authenticated");
  document.querySelectorAll(".sidebar-note").forEach(el=>el.textContent="ข้อมูลส่วนตัวเก็บในเบราว์เซอร์เครื่องนี้");
  updateDateAndShift();render();persist();
}
async function bootstrap(){await loadApp()}
