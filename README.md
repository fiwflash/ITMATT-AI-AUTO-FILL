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

## 🚀 วิธีใช้งาน

1. ใส่ Gemini API key ในหน้าของ extension
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
