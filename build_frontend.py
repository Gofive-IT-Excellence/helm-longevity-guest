#!/usr/bin/env python3
"""Build the intranet pilot UI from the reviewed HELM Longevity prototype."""

from pathlib import Path

root = Path(__file__).resolve().parent
source = (root / "prototype.html").read_text(encoding="utf-8")
client = (root / "client-integration.js").read_text(encoding="utf-8")
ai = (root / "ai-integration.js").read_text(encoding="utf-8")
ai_style = (root / "ai-integration.css").read_text(encoding="utf-8")
trainer = (root / "trainer-integration.js").read_text(encoding="utf-8")
trainer_style = (root / "trainer.css").read_text(encoding="utf-8")
focus = (root / "sprint-focus.js").read_text(encoding="utf-8")
focus_style = (root / "sprint-focus.css").read_text(encoding="utf-8")

# The source also contains a public-preview-only login overlay. The intranet
# uses its own authenticated login, so remove that overlay and its render hooks.
preview_start = source.index("/* Public preview entry: visual only.")
preview_end = source.index("render();\n</script>", preview_start)
source = source[:preview_start] + source[preview_end:]


def replace_once(old: str, new: str) -> None:
    global source
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"Expected one occurrence of {old[:50]!r}; found {count}")
    source = source.replace(old, new)


replace_once(
    'try{state={...defaults,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{}',
    "// Company data is loaded after Microsoft login.",
)
replace_once(
    'function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}',
    "function persist(){} // Replaced by authenticated n8n persistence below.",
)
replace_once('if(!Array.isArray(state.meals))state.meals=[initialMeal];', 'if(!Array.isArray(state.meals))state.meals=[];')
replace_once('state.draftItems=Array.isArray(state.draftItems)?state.draftItems:sampleParts();', 'state.draftItems=Array.isArray(state.draftItems)?state.draftItems:[];')
replace_once('const photoOf=m=>m.photo||MEAL;', '''const EMPTY_MEAL_IMAGE="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#edf4ff"/><circle cx="300" cy="195" r="115" fill="#fff" stroke="#b7d0fa" stroke-width="16"/><circle cx="300" cy="195" r="70" fill="#f8fbff"/><path d="M95 95v210M75 95v85M115 95v85M505 95v210" fill="none" stroke="#0054c9" stroke-linecap="round" stroke-width="17"/><circle cx="300" cy="195" r="28" fill="#ff7058"/></svg>');
const photoOf=m=>m.photo||EMPTY_MEAL_IMAGE;''')
replace_once('photo:state.photo||MEAL,items:state.draftItems.map', 'photo:state.photo||null,items:state.draftItems.map')
replace_once('<span class="food-emoji" aria-hidden="true">${m.emoji}</span>', '<span class="food-emoji" aria-hidden="true">${esc(m.emoji)}</span>')
replace_once('state.photo=withSample?MEAL:null;', 'state.photo=null;')
replace_once('state.photo=MEAL;render()', 'state.photo=null;render()')
source = source.replace('alt="ภาพอาหารล่าสุด"', 'alt="ภาพประกอบอาหารหรือภาพอาหารล่าสุด"')
source = source.replace('ค่าตัวอย่างจากอาหารที่บันทึก แก้ไขแต่ละวัตถุดิบได้', 'ค่าโดยประมาณจากอาหารที่บันทึก แก้ไขแต่ละวัตถุดิบได้')
replace_once("render();\n</script>", client + "\n" + ai + "\n" + trainer + "\n" + focus + "\nbootstrap();\n</script>")
source = source.replace("30 ก.ย. 2569", '<span class="today-date"></span>')
source = source.replace("ข้อมูลทั้งหมดในไฟล์นี้อยู่บนเครื่องของคุณ", "ข้อมูลส่วนตัวอยู่ในเบราว์เซอร์เครื่องนี้")
source = source.replace("เก็บในเบราว์เซอร์เครื่องนี้", "เก็บในเบราว์เซอร์เครื่องนี้")
source = source.replace("เว็บไฟล์ในเครื่องนี้ยังเชื่อมไม่ได้", "เว็บรุ่นนี้ยังไม่เชื่อม")
source = source.replace("ไฟล์นี้ยังไม่รู้จำอาหารจากภาพ", "รุ่นนี้ยังไม่รู้จำอาหารจากภาพ")
source = source.replace("รูปยังไม่ได้วิเคราะห์ด้วย HELM AI กรุณาเลือกหรือแก้ไขวัตถุดิบด้วยตนเอง", "ถ่ายหรือเลือกรูป แล้ว HELM จะวิเคราะห์ให้อัตโนมัติ")
source = source.replace("หลังถ่ายรูป ให้เลือกหรือกรอกอาหารในจานด้วยตนเอง ระหว่างรอเชื่อม HELM AI", "หลังถ่ายหรือเลือกรูป HELM จะวิเคราะห์ให้ แล้วตรวจชื่ออาหารและสารอาหารก่อนบันทึก")
source = source.replace("วิเคราะห์โภชนาการทันที", '${previewMode?"บันทึกอาหารในโหมดทดลอง":"วิเคราะห์โภชนาการทันที"}')
source = source.replace("ถ่ายหรือเลือกรูป แล้ว HELM จะวิเคราะห์ให้อัตโนมัติ", '${previewMode?"ถ่ายหรือเลือกรูป แล้วเพิ่มอาหารในจานด้วยตนเอง":"ถ่ายหรือเลือกรูป แล้ว HELM จะวิเคราะห์ให้อัตโนมัติ"}')
source = source.replace("โภชนาการเป็นค่าประมาณจากข้อมูลที่เลือกหรือกรอกเอง • ยังไม่เชื่อม HELM AI", "โภชนาการเป็นค่าประมาณ • ตรวจและแก้ไขข้อมูลก่อนบันทึก")
source = source.replace(
    "ค่าประมาณจากอาหารที่เลือกเอง • — คือยังไม่มีข้อมูล",
    '${items.some(x=>x.source_type==="ai_estimate")?"ค่าประมาณจาก HELM AI • ตรวจแก้ก่อนบันทึก":"ค่าประมาณจากอาหารที่เลือกเอง"} • — คือยังไม่มีข้อมูล',
)

auth_style = r"""
#preview-login{display:none!important}
body:not(.authenticated) .shell,body:not(.authenticated) .bottom-nav{display:none!important}
.auth-root{min-height:100dvh;display:grid;place-items:center;padding:25px;background:radial-gradient(circle at 82% 8%,#d6f6ff,transparent 31%),radial-gradient(circle at 8% 86%,#e0eeff,transparent 36%),#f6faff}
body.authenticated .auth-root{display:none}
.auth-card{width:min(100%,430px);padding:34px;border:1px solid #dceaf9;border-radius:26px;background:#fff;box-shadow:0 23px 60px #0866c51f}
.auth-brand{display:flex;align-items:center;gap:12px;margin:0 0 31px}.auth-card .auth-brand img{display:block;width:64px;height:64px;object-fit:cover;margin:0;border-radius:50%;clip-path:circle(46% at 50% 50%);box-shadow:0 7px 17px #0b70dc2d}.auth-brand span{display:grid;line-height:1.05}.auth-brand strong{font-size:29px;letter-spacing:-.05em;color:#0759cd}.auth-brand small{font-size:17px;font-weight:750;color:#168de8}.auth-card h1{font-size:26px;margin:0;color:#13376c}.auth-card p{font-size:14px;color:#748baa;margin:3px 0 25px}
.auth-card form{display:grid;gap:15px}.auth-card label{display:grid;gap:6px;color:#4d6a91;font-size:13px;font-weight:750}.auth-card input{width:100%;padding:12px 13px;border:1px solid #d6e7f8;border-radius:12px;font:inherit}.auth-card button{margin-top:5px;padding:12px;border:0;border-radius:12px;background:linear-gradient(110deg,#075bdc,#1498ec);color:#fff;font:inherit;font-weight:800;box-shadow:0 8px 19px #086cdb2c}.auth-card button:disabled{opacity:.6}.auth-card #login-error{min-height:23px;margin-top:14px;color:#c23b32;font-size:12px}
.auth-root{display:block;min-height:100svh;min-height:100dvh;padding:0;background:radial-gradient(circle at 84% 13%,#08d4f1 0,transparent 38%),linear-gradient(145deg,#0348c6 0%,#087aef 59%,#09b9f1 100%)}
.auth-root .login-scene{width:min(100%,520px);max-width:none;min-height:100svh;min-height:100dvh;aspect-ratio:auto;margin:0 auto;border:0;border-radius:0;box-shadow:none}
.auth-root .login-brand-mark img{object-fit:cover}
.auth-root .login-field{cursor:text}
.auth-root .login-field:focus-within{border-color:#0b8bea;box-shadow:0 0 0 3px #0999ec25}
.auth-root .login-field input{min-width:0;flex:1;width:100%;padding:0;border:0;outline:0;background:transparent;color:#153a70;font:inherit}
.auth-root .login-field input::placeholder{color:#8a9bb6;opacity:1}
.auth-root .login-password-toggle{display:grid;place-items:center;flex:none;padding:0;border:0;background:transparent;color:#5e7192;cursor:pointer}
.auth-root .login-password-toggle:focus-visible,.auth-root .login-muted-link:focus-visible,.auth-root .login-google:focus-visible,.auth-root .login-register button:focus-visible{outline:2px solid #0879ed;outline-offset:3px}
.auth-root .login-muted-link,.auth-root .login-google,.auth-root .login-register button{cursor:pointer}
.auth-root .login-enter:disabled{opacity:.65;cursor:wait}
.auth-root #login-error{min-height:0;color:#b72e37;font-size:3.3cqw;line-height:1.2}
.auth-root #login-error:not(:empty){margin-top:2cqw}
@media(max-width:760px){html,body:not(.authenticated){background:#0759d4}.auth-root .login-scene{width:100%;max-width:none}}
.account-control{border:0;border-radius:9px;background:#eef4ff;color:#0049c5;padding:6px 9px;font-size:11px;font-weight:800;white-space:nowrap}.mobile-brand .account-control{font-size:10px;padding:4px 7px}
.preview-label{display:inline-block;margin-left:8px;padding:5px 9px;border-radius:999px;background:#e8f4ff;color:#0868c9;font-size:11px;font-weight:700;white-space:nowrap}
.preview-mode .ai-photo-button:disabled,.preview-mode .ai-assist button:disabled{opacity:.6;cursor:not-allowed}
"""
replace_once("</style>", auth_style + ai_style + trainer_style + focus_style + "\n</style>")
replace_once("<script>", '<script src="config.js?v=20261008-1"></script>\n<script>')
source = source.replace("font-weight:750", "font-weight:400").replace("font-weight:800", "font-weight:400")
replace_once('<div class="shell">', '<div id="auth-root" class="auth-root"><div class="auth-card">กำลังตรวจสอบการเข้าสู่ระบบ...</div></div>\n<div class="shell">')

output = root / "index.html"
output.write_text(source, encoding="utf-8")
print(output)
