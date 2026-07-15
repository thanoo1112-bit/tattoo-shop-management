# ครัวไทยแท้ — Restaurant Web App 🍲

ระบบจัดการร้านอาหารออนไลน์ครบวงจร สร้างด้วย **Next.js 14 + Supabase** พร้อม Deploy บน Vercel

## ✨ ฟีเจอร์หลัก

- 🍽️ **หน้าเมนูอาหาร** — เรียงตามหมวดหมู่ พร้อมภาพและราคา
- 🛒 **ระบบตะกร้า** — เพิ่ม/ลดรายการ บันทึกอัตโนมัติ
- 📋 **Checkout** — กรอกชื่อ โต๊ะ หมายเหตุ ยืนยันออร์เดอร์
- 📍 **ติดตามออร์เดอร์** — อัปเดตสถานะแบบ Real-time
- 🔐 **Login พนักงาน** — ระบบ Auth ด้วย Supabase Auth
- 📊 **Dashboard** — ภาพรวมยอดขายวันนี้
- 📦 **จัดการออร์เดอร์** — เปลี่ยนสถานะ, Real-time updates
- 🍜 **จัดการเมนู** — เพิ่ม/แก้ไข/ลบ, Toggle พร้อมจำหน่าย
- 🧾 **ออกใบเสร็จ** — Preview + สั่งพิมพ์
- 📈 **รายงาน** — กราฟ 7 วัน, เมนูยอดนิยม

---

## 🚀 วิธีติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

คัดลอก `.env.example` และสร้าง `.env.local`:

```bash
cp .env.example .env.local
```

แล้วแก้ไขค่าในไฟล์ `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> หาค่าได้ที่: Supabase Dashboard → Project Settings → API

### 3. ตั้งค่า Supabase Database

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เปิด Project ของคุณ → **SQL Editor**
3. คัดลอกโค้ดจากไฟล์ `supabase/schema.sql` ทั้งหมด
4. วางและกด **Run** (ระบบจะสร้าง tables + seed data อัตโนมัติ)

### 4. สร้างบัญชีพนักงาน

ที่ Supabase Dashboard → **Authentication → Users → Add User**:
- Email: `admin@krauthai.com`
- Password: ตั้งรหัสผ่านที่ต้องการ

> **หมายเหตุ**: บัญชีที่สร้างจะมี role `staff` โดยอัตโนมัติ  
> ถ้าต้องการเปลี่ยนเป็น `admin` ให้อัปเดต column `role` ในตาราง `profiles`

### 5. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## 📂 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx              # หน้าเมนูอาหาร (ลูกค้า)
│   ├── cart/page.tsx         # ตะกร้าสินค้า
│   ├── checkout/page.tsx     # ยืนยันออร์เดอร์
│   ├── order/[id]/page.tsx   # ติดตามออร์เดอร์
│   ├── login/page.tsx        # Login พนักงาน
│   └── dashboard/
│       ├── layout.tsx        # Layout Dashboard (Sidebar)
│       ├── page.tsx          # ภาพรวม
│       ├── orders/page.tsx   # จัดการออร์เดอร์
│       ├── menu/page.tsx     # จัดการเมนู
│       └── reports/page.tsx  # รายงานยอดขาย
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── MenuCard.tsx          # การ์ดเมนูอาหาร
│   ├── OrderStatusBadge.tsx  # Badge แสดงสถานะ
│   └── ReceiptModal.tsx      # Modal ใบเสร็จ
├── context/
│   └── CartContext.tsx       # Cart state management
├── lib/
│   └── supabase/
│       ├── client.ts         # Supabase Browser client
│       └── server.ts         # Supabase Server client
├── types/
│   └── index.ts              # TypeScript types
└── middleware.ts             # Auth middleware
```

---

## 🌐 Deploy บน Vercel

### 1. Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "feat: initial restaurant app"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) → **New Project**
2. Import repository จาก GitHub
3. เพิ่ม Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. กด **Deploy**

---

## 🗃️ Database Tables

| Table | คำอธิบาย |
|-------|---------|
| `categories` | หมวดหมู่อาหาร |
| `menu_items` | รายการเมนูอาหาร |
| `orders` | ออร์เดอร์ของลูกค้า |
| `order_items` | รายการอาหารในแต่ละออร์เดอร์ |
| `profiles` | โปรไฟล์พนักงาน (ต่อจาก Auth) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router + TypeScript)
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Icons**: Lucide React
