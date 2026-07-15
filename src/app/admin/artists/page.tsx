"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Artist } from "@/types";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, Sparkles } from "lucide-react";

export default function ArtistsAdminPage() {
  const supabase = createClient();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setArtists(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถดึงข้อมูลช่างสักได้");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingArtist(null);
    setName("");
    setSpecialty("");
    setAvatarUrl("");
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setName(artist.name);
    setSpecialty(artist.specialty || "");
    setAvatarUrl(artist.avatar_url || "");
    setIsAvailable(artist.is_available);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("กรุณาระบุชื่อช่างสัก");
      return;
    }

    try {
      if (editingArtist) {
        // Edit Mode
        const { error } = await supabase
          .from("artists")
          .update({
            name,
            specialty: specialty || null,
            avatar_url: avatarUrl || null,
            is_available: isAvailable
          })
          .eq("id", editingArtist.id);
        if (error) throw error;
        toast.success("แก้ไขข้อมูลช่างสักสำเร็จ");
      } else {
        // Add Mode
        const { error } = await supabase
          .from("artists")
          .insert([
            {
              name,
              specialty: specialty || null,
              avatar_url: avatarUrl || null,
              is_available: isAvailable
            }
          ]);
        if (error) throw error;
        toast.success("เพิ่มช่างสักใหม่สำเร็จ");
      }
      setIsModalOpen(false);
      fetchArtists();
    } catch (err: any) {
      console.error(err);
      toast.error("ผิดพลาด: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบช่างสักนี้ออกจากระบบ?")) return;

    try {
      const { error } = await supabase
        .from("artists")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("ลบช่างสักสำเร็จ");
      fetchArtists();
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถลบช่างสักได้");
    }
  };

  const toggleAvailability = async (artist: Artist) => {
    try {
      const { error } = await supabase
        .from("artists")
        .update({ is_available: !artist.is_available })
        .eq("id", artist.id);
      if (error) throw error;
      toast.success("เปลี่ยนสถานะความพร้อมสำเร็จ");
      fetchArtists();
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-wider">จัดการช่างสัก</h1>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">Artist Portfolio & Availability</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary py-2.5 px-4 flex items-center gap-1.5 text-xs font-bold"
        >
          <Plus size={16} /> เพิ่มช่างสักใหม่
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 font-bold">กำลังโหลดข้อมูลช่างสัก...</div>
      ) : artists.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-400 font-bold">ยังไม่มีข้อมูลช่างสักในระบบ</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                {artist.avatar_url ? (
                  <img
                    src={artist.avatar_url}
                    alt={artist.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black shrink-0">
                    157
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">{artist.name}</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1 whitespace-pre-wrap">{artist.specialty || "ไม่มีระบุเฉพาะทาง"}</p>
                </div>
              </div>

              {/* Status toggler */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-500">สถานะความพร้อมสัก:</span>
                <button
                  onClick={() => toggleAvailability(artist)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                    artist.is_available
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {artist.is_available ? "พร้อมรับงาน (Available)" : "พักงาน/คิวเต็ม (Busy)"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(artist)}
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 flex items-center justify-center gap-1.5 text-xs font-bold transition"
                >
                  <Edit2 size={13} /> แก้ไขข้อมูล
                </button>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="py-2 px-3 hover:bg-red-50 border border-transparent rounded-xl text-red-600 flex items-center justify-center transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {editingArtist ? "แก้ไขข้อมูลช่างสัก" : "เพิ่มช่างสักใหม่"}
            </h3>
            <p className="text-gray-500 text-xs mb-6">กรอกข้อมูลพอร์ตโฟลิโอเบื้องต้นของช่างสักในระบบร้าน</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">ชื่อช่างสัก *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="เช่น ช่างอาร์ต (Artist Art)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">แนวงานสักที่ถนัด (คั่นด้วยจุลภาค)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="เช่น Minimal, Tribal, Color Work"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">ลิงก์รูปโปรไฟล์ (URL)</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="เช่น https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="artist-available"
                  className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <label htmlFor="artist-available" className="text-xs font-bold text-gray-700 cursor-pointer">
                  เปิดให้ลูกค้าจองคิวออนไลน์ผ่านระบบได้ทันที
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition text-xs font-bold"
                >
                  {editingArtist ? "บันทึกการแก้ไข" : "เพิ่มช่างสัก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
