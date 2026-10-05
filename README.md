# HELM Longevity — GitHub Pages guest pilot

เว็บรุ่นนี้เป็นสำเนาใหม่ แยกจากรุ่นทดสอบมือถือเดิมโดยสมบูรณ์ เปิดเว็บได้ทันทีโดยไม่ต้องล็อกอิน ข้อมูลอาหาร น้ำ และกิจกรรมเก็บใน `localStorage` ของเบราว์เซอร์เครื่องนั้น ไม่ซิงก์ข้ามเครื่องและไม่บันทึกรูปอาหารไว้หลังปิดหน้า

## โครงสร้าง

- `index.html`, `config.js`, `assets/`: เว็บ GitHub Pages
- `prototype.html` และ `build_frontend.py`: ต้นฉบับและสคริปต์สร้าง `index.html`
- `workflows-guest/`: workflow n8n สำหรับ `ai/food`, `ai/trainer`, `ai/activity`; ไม่มี API key

เว็บเรียก `https://n8n.tks.co.th/webhook/helm-longevity-guest/ai/{food,trainer,activity}` ด้วย POST แบบ `text/plain` ซึ่งมี JSON `{action,payload}`. n8n ต้องถือคีย์ HELM ใน Header Auth credential (`Authorization: Bearer ...`) และเรียก `https://helm.tks.co.th/api/chat/completions`. ห้ามใส่คีย์ใน `config.js`, GitHub หรือ JavaScript หน้าเว็บ

## เปิดใช้งาน

1. นำเข้า JSON ทั้งสามไฟล์ใน n8n Personal project (นำเข้าแล้วในวันที่ 5 ต.ค. 2569)
2. สร้าง Header Auth credential ชื่อ `HELM Longevity guest API` โดยตั้ง Name เป็น `Authorization`, Value เป็น `Bearer <HELM_API_KEY>` และจำกัด Allowed HTTP Request Domains ให้เฉพาะ `helm.tks.co.th`
3. เลือก credential นี้ในโหนด `Call HELM` ของทุก workflow และทดสอบแต่ละ workflow ด้วย test webhook ก่อน Publish
4. Publish ทั้งสาม workflow แล้วทดสอบหน้าเว็บ GitHub Pages ด้วยแชตและรูปอาหารจริง

**ข้อควรทราบ:** เว็บและ webhook ไม่มีล็อกอิน บุคคลที่รู้ URL สามารถเรียก HELM ผ่าน n8n ได้ โค้ดมีเพดานคำขอรายวันแบบนับใน n8n workflow static data (อาหาร 40, กิจกรรม 40, แชต 100) เพื่อจำกัดการทดลอง แต่ไม่ใช่การป้องกันการใช้งานผิดวัตถุประสงค์ที่แข็งแรง ควรใช้มาตรการ rate limit ที่ reverse proxy ก่อนเปิดวงกว้าง

## พัฒนาในเครื่อง

```sh
python3 build_frontend.py
python3 -m http.server 8102
```

เปิด `http://127.0.0.1:8102/`. เนื่องจาก workflow จำกัด CORS ไว้ที่ GitHub Pages หน้า local จะใช้ดู UI และข้อมูลในเครื่อง ส่วนทดสอบ API ให้ใช้ n8n test webhook หรือเว็บ Pages ที่เผยแพร่แล้ว
