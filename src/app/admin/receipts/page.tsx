"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Receipt } from "@/types";
import toast from "react-hot-toast";
import { Search, Printer, Calendar, User, FileText, ClipboardList } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function ReceiptsAdminPage() {
  const supabase = createClient();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReceipts(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถดึงข้อมูลประวัติใบเสร็จได้");
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    return (
      r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.artist_name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-wider">ประวัติและข้อมูลใบเสร็จ</h1>
        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Invoice history & Billing records</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          className="input-field pl-10"
          placeholder="ค้นหาตามเลขที่ใบเสร็จ, ชื่อลูกค้า, หรือชื่อช่างสัก..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Table List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-bold">กำลังโหลดข้อมูลใบเสร็จ...</div>
        ) : filteredReceipts.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400 font-bold">ไม่พบประวัติใบเสร็จรับเงิน</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">เลขที่ใบเสร็จ</th>
                  <th className="px-6 py-4">ลูกค้า</th>
                  <th className="px-6 py-4">ช่างสักผู้ดูแล</th>
                  <th className="px-6 py-4">วันที่ออกเอกสาร</th>
                  <th className="px-6 py-4">ยอดรับสุทธิ</th>
                  <th className="px-6 py-4">ชำระด้วย</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{r.receipt_number}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{r.customer_name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{r.artist_name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(r.created_at).toLocaleString("th-TH", {
                        day: "2-digit", month: "short", year: "2-digit",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-950">฿{Number(r.total_paid).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
                        {r.payment_method === "transfer" ? "โอนเงิน" : r.payment_method === "cash" ? "เงินสด" : "บัตรเครดิต"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveReceipt(r)}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg font-bold text-xs transition inline-flex items-center gap-1.5"
                      >
                        <Printer size={13} /> พิมพ์/เปิดดู
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reprint modal */}
      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}
