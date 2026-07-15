-- =============================================
-- 157 TATTOO — Supabase Database Schema
-- วางโค้ดนี้ใน Supabase SQL Editor แล้วรัน
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ช่างสัก (Artists)
-- =============================================
CREATE TABLE IF NOT EXISTS artists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  specialty    TEXT,
  avatar_url   TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. รายการจองคิว (Bookings)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name      TEXT NOT NULL,
  customer_phone     TEXT NOT NULL,
  line_id            TEXT,
  booking_date       DATE NOT NULL,
  booking_time       TIME NOT NULL,
  artist_id          UUID REFERENCES artists(id) ON DELETE SET NULL,
  tattoo_description TEXT NOT NULL,
  status             TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  price              NUMERIC(10, 2),
  deposit            NUMERIC(10, 2) DEFAULT 0.00,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ใบเสร็จรับเงิน (Receipts)
-- =============================================
CREATE TABLE IF NOT EXISTS receipts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id         UUID REFERENCES bookings(id) ON DELETE SET NULL,
  receipt_number     TEXT UNIQUE NOT NULL,
  customer_name      TEXT NOT NULL,
  artist_name        TEXT NOT NULL,
  tattoo_description TEXT NOT NULL,
  subtotal           NUMERIC(10, 2) NOT NULL,
  deposit_deducted   NUMERIC(10, 2) DEFAULT 0.00,
  discount           NUMERIC(10, 2) DEFAULT 0.00,
  total_paid         NUMERIC(10, 2) NOT NULL,
  payment_method     TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'card')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. โปรไฟล์พนักงาน (Profiles - เชื่อมโยงกับ Supabase Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'artist', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ฟังก์ชันสร้างโปรไฟล์อัตโนมัติเมื่อสมัครสมาชิก
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Employee'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- ช่างสัก: ดูได้ทุกคน, จัดการได้เฉพาะผู้เข้าสู่ระบบ
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artists_read_all"   ON artists FOR SELECT USING (TRUE);
CREATE POLICY "artists_manage_auth" ON artists FOR ALL USING (auth.role() = 'authenticated');

-- การจองคิว: ลูกค้าเพิ่มข้อมูล/เช็คสถานะได้, พนักงานดูและอัปเดตได้ทั้งหมด
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_insert_public" ON bookings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "bookings_select_public" ON bookings FOR SELECT USING (TRUE);
CREATE POLICY "bookings_manage_auth"   ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- ใบเสร็จ: ดูได้ทุกคน (หรือพนักงาน), พนักงานจัดการได้ทั้งหมด
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receipts_read_public" ON receipts FOR SELECT USING (TRUE);
CREATE POLICY "receipts_manage_auth" ON receipts FOR ALL USING (auth.role() = 'authenticated');

-- โปรไฟล์: จัดการตนเอง
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- ข้อมูลเริ่มต้น (Seed Data - ช่างสักร้าน 157 TATTOO)
-- =============================================
INSERT INTO artists (name, specialty, avatar_url, is_available) VALUES
  ('ช่างหนึ่ง (Artist Nueng)', 'Realism, Portrait, Black and Grey', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', TRUE),
  ('ช่างเจ (Artist Jay)', 'Minimal, Fine Line, Old School', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', TRUE),
  ('ช่างมาร์ค (Artist Mark)', 'Japanese Traditional, Irezumi, Neo Thai', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', TRUE)
ON CONFLICT DO NOTHING;
