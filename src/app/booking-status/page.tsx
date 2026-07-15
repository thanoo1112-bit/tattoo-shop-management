"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";
import { Search, Clipboard, Calendar, Clock, User, Scissors, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

function StatusContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  const queryId = searchParams.get("id");

  useEffect(() => {
    if (queryId) {
      setBookingId(queryId);
      handleSearch(queryId);
    }
  }, [queryId]);

  const handleSearch = async (idToSearch?: string) => {
    const targetId = idToSearch || bookingId;
    if (!targetId.trim()) {
      toast.error("กรุณากรอกรหัสการจอง");
      return;
    }

    setLoading(true);
    setBooking(null);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, artist:artists(*)")
        .eq("id", targetId.trim())
        .single();

      if (error) {
        throw error;
      }

      setBooking(data);
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่พบข้อมูลการจองตามรหัสระบุ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 mt-10">
      <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-2">ตรวจสอบสถานะการจอง</h2>
        <p className="text-gray-500 text-xs mb-6">
          ป้อนรหัสคิวการจอง (Booking ID) ที่ได้รับจากการจองคิวออนไลน์ เพื่อตรวจสอบสถานะปัจจุบัน
        </p>

        {/* Search Bar */}
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              className="input-field pl-10"
              placeholder="ป้อนรหัสคิว เช่น d290f1d2-..."
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="btn-primary px-5 py-3 flex items-center justify-center gap-1.5"
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>

        {/* Result Area */}
        {booking && (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Header Badge */}
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">รหัสคิว: {booking.id.slice(0, 8)}...</span>
              <span className={`
                ${booking.status === 'pending' ? 'badge-status-pending' : ''}
                ${booking.status === 'confirmed' ? 'badge-status-confirmed' : ''}
                ${booking.status === 'completed' ? 'badge-status-completed' : ''}
                ${booking.status === 'cancelled' ? 'badge-status-cancelled' : ''}
              `}>
                {booking.status === 'pending' && 'รอตรวจสอบ'}
                {booking.status === 'confirmed' && 'ยืนยันคิวแล้ว'}
                {booking.status === 'completed' && 'สักเสร็จสิ้น'}
                {booking.status === 'cancelled' && 'ยกเลิกคิว'}
              </span>
            </div>

            {/* Content list */}
            <div className="p-5 space-y-4 text-xs sm:text-sm font-medium text-gray-700">
              <div className="flex gap-3">
                <User size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">ชื่อผู้จอง</p>
                  <p className="text-gray-900 font-bold">{booking.customer_name}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">วันที่จองสัก</p>
                  <p className="text-gray-900 font-bold">
                    {new Date(booking.booking_date).toLocaleDateString("th-TH", {
                      day: "2-digit", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">เวลานัดหมาย</p>
                  <p className="text-gray-900 font-bold">{booking.booking_time.slice(0, 5)} น.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Scissors size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">ช่างสักที่ดูแล</p>
                  <p className="text-gray-900 font-bold">{booking.artist?.name || "ช่างสักสุ่มของร้าน"}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clipboard size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">รายละเอียดงานสัก</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{booking.tattoo_description}</p>
                </div>
              </div>

              {(booking.price !== null || booking.deposit > 0) && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {booking.price !== null && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">ราคาประเมินเบื้องต้น:</span>
                      <span className="font-bold text-gray-900">฿{Number(booking.price).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.deposit > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">เงินมัดจำมัดชำระแล้ว:</span>
                      <span className="font-bold text-emerald-600">฿{Number(booking.deposit).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-20">
        <Suspense fallback={<div className="text-center py-20">กำลังโหลด...</div>}>
          <StatusContent />
        </Suspense>
      </main>
    </>
  );
}
