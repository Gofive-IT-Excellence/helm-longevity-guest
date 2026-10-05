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
function showEntryPage(){
  const root=document.querySelector("#auth-root");
  if(!root)return;
  root.innerHTML=`<section class="login-scene" aria-label="หน้าเข้าสู่ระบบ HELM Longevity">
    <div class="login-sky">
      <div class="login-brand"><span class="login-brand-mark"><img src="HELM-Longevity-Profile-Icon.png" alt="โลโก้ HELM Longevity"></span><span>HELM<small>Longevity</small></span></div>
      <div class="login-slogan">ดูแลสุขภาพ<br>ไปด้วยกัน<br>ทุกวัน</div>
      <img class="login-hero-illustration" src="assets/login-hero-2026.png" alt="น้อง HELM กับอาหาร กิจกรรม และการติดตามสุขภาพ">
    </div>
    <div class="login-sheet">
      <h1>เข้าสู่ระบบ</h1>
      <p class="login-subtitle">ยินดีต้อนรับสู่ HELM Longevity</p>
      <button class="login-enter" type="button" data-action="enter-app">เข้าสู่ระบบ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path></svg></button>
    </div>
  </section>`;
  root.querySelector('[data-action="enter-app"]').addEventListener("click",async event=>{
    const button=event.currentTarget;
    button.disabled=true;
    try{await loadApp()}catch(error){button.disabled=false;toast("เปิดระบบไม่สำเร็จ กรุณาลองอีกครั้ง")}
  });
}
async function bootstrap(){showEntryPage()}

function calculateBMI(weightKg,heightCm){
  const weight=Number(weightKg),height=Number(heightCm);
  if(!Number.isFinite(weight)||!Number.isFinite(height)||weight<20||weight>400||height<100||height>250)return null;
  const value=weight/((height/100)**2);
  const category=value<18.5?"น้ำหนักน้อย / ผอม":value<23?"น้ำหนักปกติ":value<25?"น้ำหนักเกิน":value<30?"อ้วนระดับ 1":"อ้วนระดับ 2";
  return {value,category};
}
function bmiCard(){
  const result=calculateBMI(state.weightKg,state.heightCm);
  return `<section class="weight-card" aria-label="ดัชนีมวลกาย"><h2>ดัชนีมวลกาย (BMI)</h2><div class="weight-value">${result?result.value.toFixed(2):"—"} <small>kg/m²</small></div><p>${result?result.category:"กรอกน้ำหนักและส่วนสูงเพื่อคำนวณ BMI"}</p><form class="wellness-form" id="bmi-form"><label>ส่วนสูง (ซม.)<input name="heightCm" type="number" min="100" max="250" step="0.1" value="${state.heightCm==null?"":esc(state.heightCm)}" required></label><button class="solid-button" type="submit">บันทึกส่วนสูง</button></form><p class="estimate">BMI = น้ำหนัก (กก.) ÷ ส่วนสูง (เมตร)² • ใช้น้ำหนักล่าสุดที่บันทึก</p><details><summary>เกณฑ์ BMI สำหรับผู้ใหญ่ไทย</summary><p>น้อยกว่า 18.5: น้ำหนักน้อย / ผอม<br>18.5 ถึงน้อยกว่า 23: น้ำหนักปกติ<br>23 ถึงน้อยกว่า 25: น้ำหนักเกิน<br>25 ถึงน้อยกว่า 30: อ้วนระดับ 1<br>ตั้งแต่ 30: อ้วนระดับ 2</p><p class="estimate">เป็นข้อมูลคัดกรองเบื้องต้นสำหรับผู้ใหญ่ ไม่ใช่การวินิจฉัยโรค</p><a href="https://si.mahidol.ac.th/sirirajdoctor/article_detail.aspx?ID=1361" target="_blank" rel="noopener noreferrer">อ้างอิง: ศิริราช</a></details></section>`;
}
const profileBeforeBMI=profile;
profile=function(){return profileBeforeBMI().replace(weightCard(),weightCard()+bmiCard())};
document.addEventListener('submit',event=>{
  if(event.target.id!=='bmi-form')return;
  event.preventDefault();
  const height=Number(new FormData(event.target).get('heightCm'));
  if(!Number.isFinite(height)||height<100||height>250){toast('กรอกส่วนสูงระหว่าง 100–250 ซม.');return}
  state.heightCm=height;persist();render();toast('บันทึกส่วนสูงและคำนวณ BMI แล้ว');
});
