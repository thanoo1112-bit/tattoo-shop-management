"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import {
  Scissors, LayoutDashboard, Calendar, ClipboardList,
  LogOut, Menu, X, Users, Receipt
} from "lucide-react";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/admin",          icon: Calendar,       label: "รายการจองคิว" },
  { href: "/admin/artists",  icon: Users,          label: "จัดการช่างสัก" },
  { href: "/admin/receipts", icon: Receipt,        label: "ประวัติใบเสร็จ" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data as Profile);
    };
    load();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("ออกจากระบบแล้ว");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed sm:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm">
            <Scissors size={18} className="text-white transform rotate-90" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm tracking-wider">157 TATTOO</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Backoffice System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all ${
                  active
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          {profile && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {profile.full_name || profile.email}
              </p>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                {profile.role === "admin" ? "ผู้จัดการร้าน" : "พนักงาน / ช่างสัก"}
              </span>
            </div>
          )}
          <button
            id="logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="sm:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-black text-gray-900 text-sm tracking-wider">157 TATTOO BACKOFFICE</span>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
