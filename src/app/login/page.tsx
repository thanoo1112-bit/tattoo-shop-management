"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Scissors, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    toast.success("เข้าสู่ระบบสำเร็จ!");
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Scissors size={32} className="text-white transform rotate-90" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-wider">157 TATTOO</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Staff Administration</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">เข้าสู่ระบบพนักงาน</h2>
          <p className="text-xs text-gray-400 mb-6">
            กรุณาลงชื่อเข้าใช้ด้วยบัญชีพนักงานที่ได้รับอนุมัติ
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                อีเมล
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field pl-10"
                  placeholder="staff@157tattoo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="input-field pl-10 pr-10"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ระบบสำหรับพนักงานของ 157 TATTOO เท่านั้น
        </p>
      </div>
    </div>
  );
}
