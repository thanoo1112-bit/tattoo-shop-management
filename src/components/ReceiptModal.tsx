"use client";

import { useRef } from "react";
import type { Receipt } from "@/types";
import { X, Printer } from "lucide-react";

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ใบเสร็จ ${receipt.receipt_number}</title>
          <style>
            body { font-family: 'Noto Sans Thai', monospace; font-size: 13px; margin: 0; padding: 16px; width: 280px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #999; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .total { font-size: 15px; font-weight: bold; }
            h2 { margin: 4px 0; }
            p { margin: 2px 0; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">ใบเสร็จรับเงิน</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div
            ref={receiptRef}
            className="font-mono text-xs text-gray-800"
          >
            <div className="center">
              <h2 className="bold text-lg text-gray-900">157 TATTOO</h2>
              <p className="text-gray-500">ร้านสักออนไลน์ครบวงจร</p>
              <p>โทร: 099-157-7777</p>
            </div>

            <div className="line" />

            <div className="row">
              <span>เลขที่ใบเสร็จ:</span>
              <span className="bold">{receipt.receipt_number}</span>
            </div>
            <div className="row">
              <span>ชื่อลูกค้า:</span>
              <span>{receipt.customer_name}</span>
            </div>
            <div className="row">
              <span>ช่างสัก:</span>
              <span className="bold">{receipt.artist_name}</span>
            </div>
            <div className="row">
              <span>วันที่:</span>
              <span>
                {new Date(receipt.created_at).toLocaleString("th-TH", {
                  day: "2-digit", month: "2-digit", year: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>

            <div className="line" />

            <div>
              <p className="bold">รายละเอียดงานสัก:</p>
              <p className="text-gray-600 pl-2 whitespace-pre-wrap">{receipt.tattoo_description}</p>
            </div>

            <div className="line" />

            <div className="row">
              <span>ค่าบริการสัก:</span>
              <span>฿{Number(receipt.subtotal).toLocaleString()}</span>
            </div>
            
            {Number(receipt.deposit_deducted) > 0 && (
              <div className="row text-gray-500">
                <span>หักเงินมัดจำ:</span>
                <span>-฿{Number(receipt.deposit_deducted).toLocaleString()}</span>
              </div>
            )}

            {Number(receipt.discount) > 0 && (
              <div className="row text-gray-500">
                <span>ส่วนลด:</span>
                <span>-฿{Number(receipt.discount).toLocaleString()}</span>
              </div>
            )}

            <div className="line" />

            <div className="row total text-gray-900">
              <span>ยอดชำระสุทธิ:</span>
              <span>฿{Number(receipt.total_paid).toLocaleString()}</span>
            </div>

            <div className="row text-xs text-gray-500 mt-1">
              <span>ช่องทางชำระเงิน:</span>
              <span className="uppercase">{receipt.payment_method === 'transfer' ? 'โอนเงิน' : receipt.payment_method === 'cash' ? 'เงินสด' : 'บัตรเครดิต'}</span>
            </div>

            <div className="line" />

            <div className="center text-gray-500 mt-2">
              <p>ขอบคุณที่ไว้วางใจร้าน 157 TATTOO 🙏</p>
              <p>ผลงานทุกชิ้นประณีตและใส่ใจความสะอาดสูงสุด</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            ปิด
          </button>
          <button
            id="print-receipt-button"
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  );
}
