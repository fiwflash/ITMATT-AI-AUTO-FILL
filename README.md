# ThaiPost AI Fill (Multi-Site)

> Chrome Extension สำหรับช่วยวิเคราะห์ข้อมูลด้วย Gemini AI และกรอกข้อมูลในระบบ DPOST และ CNIF ของไปรษณีย์ไทย

## ✨ ฟีเจอร์หลัก

- วางหรือพิมพ์ข้อมูลผู้รับเพื่อให้ Gemini AI แยกข้อมูลที่อยู่
- ตรวจทานและแก้ไขข้อมูลก่อนนำไปกรอกใน DPOST หรือ CNIF
- เติมข้อมูลลงหน้าเว็บเป้าหมายผ่าน Chrome Side Panel
- รองรับข้อมูลประเทศปลายทางและรูปแบบหมายเลขโทรศัพท์หลายประเทศ
- เก็บประวัติการวิเคราะห์และการตั้งค่าการพิมพ์ไว้ใน Chrome Storage ภายในเครื่อง

## 📥 การติดตั้ง

1. ดาวน์โหลดหรือ clone โครงการนี้
2. เปิด Chrome แล้วไปที่ `chrome://extensions`
3. เปิด **Developer mode**
4. เลือก **Load unpacked** แล้วเลือกโฟลเดอร์โครงการนี้
5. เปิด Side Panel ของ extension จากไอคอนบน Chrome

## 🔑 วิธีสร้าง Gemini API key สำหรับมือใหม่

API key คือ “กุญแจ” ที่อนุญาตให้ extension เรียกใช้ Gemini AI ด้วยบัญชี Google ของคุณ คุณสร้างเองได้ตามขั้นตอนนี้

1. เปิดหน้า [Google AI Studio – API Keys](https://aistudio.google.com/apikey)
2. ลงชื่อเข้าใช้ด้วยบัญชี Google ที่ต้องการใช้ หากยังไม่มีบัญชี Google ให้สร้างบัญชีก่อน
3. กดปุ่ม **Create API key** หรือ **สร้าง API key**
4. หากระบบถามให้เลือกโปรเจกต์ ให้เลือกโปรเจกต์ที่มีอยู่ หรือสร้างโปรเจกต์ใหม่ตามคำแนะนำบนหน้าจอ
5. คัดลอก key ที่ระบบแสดง (มักเป็นข้อความยาว ๆ)
6. กลับมาที่ extension แล้ววาง key ลงในช่อง **Gemini API Key**
7. รอสักครู่ให้ extension ตรวจสอบ key และแสดงรายชื่อโมเดล จากนั้นเลือกโมเดลที่ต้องการใช้

หากไม่พบปุ่มสร้าง key หรือระบบแจ้งว่าไม่มีสิทธิ์ ให้ลองสร้างโปรเจกต์ Google Cloud ของตนเอง หรือสอบถามผู้ดูแลบัญชี Google Workspace ของคุณ ดูคำแนะนำล่าสุดจาก [เอกสาร Gemini API ของ Google](https://ai.google.dev/gemini-api/docs/api-key)

> **สำคัญ:** เก็บ API key เหมือนรหัสผ่าน ห้ามส่งให้ผู้อื่น ห้ามโพสต์ลงแชตสาธารณะ และห้ามใส่ไว้ใน GitHub หากคิดว่า key หลุด ให้สร้าง key ใหม่และปิด key เดิมทันที

## 🚀 วิธีใช้งาน

1. ทำตามหัวข้อ **วิธีสร้าง Gemini API key** ด้านบน แล้ววาง key ลงใน extension
2. เลือกระบบเป้าหมายระหว่าง DPOST และ CNIF
3. วางข้อมูลผู้รับ แล้วให้ Gemini วิเคราะห์
4. ตรวจสอบหรือแก้ไขข้อมูลในหน้าทบทวน
5. เปิดหน้าเว็บ DPOST หรือ CNIF ที่เกี่ยวข้อง แล้วสั่งกรอกข้อมูล

API key จะถูกเก็บใน `chrome.storage.local` ของเบราว์เซอร์ ไม่ได้อยู่ใน source code ของโครงการนี้

## 📁 โครงสร้างไฟล์

- `manifest.json` — การตั้งค่า Chrome Extension และสิทธิ์ที่ใช้
- `popup.html` — หน้าตา Side Panel
- `popup.js` — การวิเคราะห์ด้วย Gemini, การจัดการข้อมูล และการกรอกแบบฟอร์ม
- `background.js` — กำหนดให้เปิด Side Panel เมื่อคลิกไอคอน extension
- `icon16.png`, `icon48.png`, `icon128.png` — ไอคอน extension

## ⚙️ เทคโนโลยีที่ใช้

- Chrome Extension Manifest V3
- JavaScript (Vanilla)
- Gemini API
- Chrome Storage, Tabs และ Scripting APIs

## 📝 หมายเหตุ

- Extension ขอสิทธิ์เข้าถึงเฉพาะเว็บไซต์ DPOST และ CNIF ตามที่กำหนดใน `manifest.json`
- ตรวจสอบข้อมูลที่ AI วิเคราะห์ก่อนกรอกและส่งข้อมูลทุกครั้ง
