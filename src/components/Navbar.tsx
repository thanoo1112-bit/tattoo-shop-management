"use client";

import Link from "next/link";
import { Scissors, Menu, X, Calendar, ClipboardList, LogIn } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md transition-shadow">
              <Scissors size={20} className="text-white transform rotate-90" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg leading-none tracking-wider">157 TATTOO</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Premium Studio</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-black font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <Calendar size={16} />
              จองคิวสักออนไลน์
            </Link>
            <Link
              href="/booking-status"
              className="text-gray-600 hover:text-black font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <ClipboardList size={16} />
              ตรวจสอบสถานะ
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-black font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <LogIn size={16} />
              เข้าสู่ระบบพนักงาน
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <div className="sm:hidden">
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-black font-semibold px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar size={16} />
                จองคิวสักออนไลน์
              </Link>
              <Link
                href="/booking-status"
                className="text-gray-700 hover:text-black font-semibold px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ClipboardList size={16} />
                ตรวจสอบสถานะ
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-black font-semibold px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                เข้าสู่ระบบพนักงาน
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
