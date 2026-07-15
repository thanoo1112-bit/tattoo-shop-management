"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking, Artist, Receipt } from "@/types";
import toast from "react-hot-toast";
import { Calendar, Phone, Clock, FileText, CheckCircle, XCircle, Search, Filter, DollarSign, Tag, CreditCard } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function BookingsAdminPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Confirm Modal state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [depositInput, setDepositInput] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");

  // Receipt Modal state
  const [billingBooking, setBillingBooking] = useState<Booking | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: bookingsData }, { data: artistsData }] = await Promise.all([
        supabase.from("bookings").select("*, artist:artists(*)").order("created_at", { ascending: false }),
        supabase.from("artists").select("*")
      ]);
      setBookings(bookingsData || []);
      setArtists(artistsData || []);
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateStatus = async (id: string, status: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success("อัปเดตสถานะสำเร็จ");
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  // Handle opening confirm modal
  const openConfirmModal = (booking: Booking) => {
    setEditingBooking(booking);
    setPriceInput(booking.price ? booking.price.toString() : "");
    setDepositInput(booking.deposit ? booking.deposit.toString() : "0");
    setSelectedArtist(booking.artist_id || "");
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          price: Number(priceInput) || null,
          deposit: Number(depositInput) || 0,
          artist_id: selectedArtist || null
        })
        .eq("id", editingBooking.id);

      if (error) throw error;
      toast.success("ยืนยันคิวและบันทึกข้อมูลราคาเรียบร้อย");
      setEditingBooking(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("ข้อผิดพลาด: " + err.message);
    }
  };

  // Handle opening receipt billing modal
  const openBillingModal = (booking: Booking) => {
    setBillingBooking(booking);
    setDiscountInput("0");
    setPaymentMethod("transfer");
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingBooking) return;

    const subtotal = billingBooking.price || 0;
    const deposit = billingBooking.deposit || 0;
    const discount = Number(discountInput) || 0;
    const totalPaid = Math.max(subtotal - deposit - discount, 0);

    const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;

    try {
      // 1. Create receipt
      const { data: newReceipt, error: receiptError } = await supabase
        .from("receipts")
        .insert([
          {
            booking_id: billingBooking.id,
            receipt_number: receiptNumber,
            customer_name: billingBooking.customer_name,
            artist_name: billingBooking.artist?.name || "ไม่ระบุช่างสัก",
            tattoo_description: billingBooking.tattoo_description,
            subtotal,
            deposit_deducted: deposit,
            discount,
            total_paid: totalPaid,
            payment_method: paymentMethod,
          }
        ])
        .select()
        .single();

      if (receiptError) throw receiptError;

      // 2. Mark booking as completed
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", billingBooking.id);

      if (bookingError) throw bookingError;

      toast.success("ออกใบเสร็จสำเร็จ!");
      setActiveReceipt(newReceipt);
      setBillingBooking(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("ข้อผิดพลาด: " + err.message);
    }
  };

  // Filters
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_phone.includes(search) ||
      b.tattoo_description.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return b.status === statusFilter && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-wider">คิวการจองและบริการลูกค้า</h1>
        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Booking List & Queue Management</p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">การจองทั้งหมด</span>
          <span className="text-2xl font-black text-gray-900 block mt-1">{stats.total} รายการ</span>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">รอการยืนยันคิว</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">{stats.pending} รายการ</span>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">คิวที่ยืนยันแล้ว</span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{stats.confirmed} รายการ</span>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">งานที่เสร็จสิ้น</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{stats.completed} รายการ</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="ค้นหาตามชื่อ, เบอร์โทร, รายละเอียดงานสัก..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="flex gap-2">
          <select
            className="input-field font-semibold text-sm max-w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รอการตรวจสอบ</option>
            <option value="confirmed">ยืนยันคิวแล้ว</option>
            <option value="completed">สักเสร็จสิ้น</option>
            <option value="cancelled">ยกเลิกคิว</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-bold">กำลังโหลดข้อมูล...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400 font-bold">ไม่พบรายการการจองคิว</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ลูกค้า</th>
                  <th className="px-6 py-4">วัน / เวลานัด</th>
                  <th className="px-6 py-4">รายละเอียดงานสัก</th>
                  <th className="px-6 py-4">ช่างสัก</th>
                  <th className="px-6 py-4">ราคา/มัดจำ</th>
                  <th className="px-6 py-4">สถานะ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div>{b.customer_name}</div>
                      <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                        โทร: {b.customer_phone} {b.line_id && `| Line: ${b.line_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      <div>
                        {new Date(b.booking_date).toLocaleDateString("th-TH", {
                          day: "2-digit", month: "short", year: "2-digit"
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {b.booking_time.slice(0, 5)} น.
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-2 text-xs text-gray-600 font-medium">{b.tattoo_description}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {b.artist ? (
                        <div className="flex items-center gap-2">
                          {b.artist.avatar_url && (
                            <img src={b.artist.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span>{b.artist.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">ยังไม่ระบุ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {b.price ? `฿${Number(b.price).toLocaleString()}` : <span className="text-gray-400 font-normal">รอประเมิน</span>}
                      {b.deposit > 0 && (
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          มัดจำแล้ว: ฿{Number(b.deposit).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        ${b.status === 'pending' ? 'badge-status-pending' : ''}
                        ${b.status === 'confirmed' ? 'badge-status-confirmed' : ''}
                        ${b.status === 'completed' ? 'badge-status-completed' : ''}
                        ${b.status === 'cancelled' ? 'badge-status-cancelled' : ''}
                      `}>
                        {b.status === 'pending' && 'รอการตรวจสอบ'}
                        {b.status === 'confirmed' && 'ยืนยันคิวแล้ว'}
                        {b.status === 'completed' && 'เสร็จสิ้น'}
                        {b.status === 'cancelled' && 'ยกเลิกคิว'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => openConfirmModal(b)}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg font-bold text-xs transition"
                          >
                            ตรวจสอบ & ยืนยันคิว
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs transition"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}

                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => openBillingModal(b)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                          >
                            ออกใบเสร็จ
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs transition"
                          >
                            ยกเลิก
                          </button>
                        </>
                      )}

                      {b.status === "completed" && (
                        <span className="text-xs text-gray-400 font-bold">ออกเอกสารเรียบร้อย</span>
                      )}

                      {b.status === "cancelled" && (
                        <span className="text-xs text-gray-400 font-bold">ยกเลิกแล้ว</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm & Price Assignment Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">ตรวจสอบและยืนยันคิวสัก</h3>
            <p className="text-gray-500 text-xs mb-6">ระบุราคาประเมินและเงินมัดจำเพื่ออัปเดตและนัดคิวลูกค้า</p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่อช่างสักผู้ดูแล</label>
                <select
                  className="input-field"
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  required
                >
                  <option value="">เลือกช่างสัก...</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ราคาประเมินเบื้องต้น (บาท)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="เช่น 3000"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">เงินมัดจำชำระแล้ว (บาท)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="หากไม่มี ใส่ 0"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition text-xs font-bold"
                >
                  ยืนยันและเปิดคิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Billing / Receipt Modal Form */}
      {billingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">เรียกเก็บเงินและออกใบเสร็จ</h3>
            <p className="text-gray-500 text-xs mb-6">สรุปรายละเอียดค่าบริการและออกใบเสร็จการชำระเงิน</p>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">ค่าบริการประเมิน:</span>
                <span className="font-bold text-gray-900">฿{Number(billingBooking.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">หักเงินมัดจำคิว:</span>
                <span className="font-bold text-red-500">-฿{Number(billingBooking.deposit).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleBillingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> ส่วนลดเพิ่มเติม (บาท)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <CreditCard size={12} /> วิธีชำระเงิน
                </label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="transfer">โอนเงิน (Mobile Banking)</option>
                  <option value="cash">เงินสด</option>
                  <option value="card">บัตรเครดิต</option>
                </select>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-black text-gray-900 mb-4">
                <span>ยอดเงินชำระจริง:</span>
                <span className="text-lg">
                  ฿{Math.max((billingBooking.price || 0) - (billingBooking.deposit || 0) - (Number(discountInput) || 0), 0).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBillingBooking(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-xs font-bold"
                >
                  ยืนยันและออกใบเสร็จ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printed Receipt Viewer Modal */}
      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}
