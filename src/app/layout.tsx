import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "157 TATTOO | ร้านสักออนไลน์และระบบจองคิวครบวงจร",
  description:
    "ร้านสัก 157 TATTOO บริการออกแบบและสักลายโดยช่างผู้เชี่ยวชาญ สะอาด ปลอดภัย จองคิวออนไลน์ได้ตลอด 24 ชั่วโมง",
  keywords: "ร้านสัก, จองคิวสัก, ช่างสักมืออาชีพ, 157 TATTOO, ออกแบบลายสัก",
  openGraph: {
    title: "157 TATTOO",
    description: "ร้านสักออนไลน์และระบบจองคิวครบวงจร สะอาด ปลอดภัย",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="light">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#1f2937",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#000", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
