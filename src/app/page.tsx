"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Artist } from "@/types";
import toast from "react-hot-toast";
import { Calendar, Phone, User, MessageSquare, Clipboard, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const supabase = createClient();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [artistId, setArtistId] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchArtists() {
      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .eq("is_available", true);
        if (error) throw error;
        setArtists(data || []);
      } catch (err) {
        console.error("Error loading artists:", err);
        toast.error("ไม่สามารถโหลดข้อมูลช่างสักได้");
      } finally {
        setLoadingArtists(false);
      }
    }
    fetchArtists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time || !artistId || !description) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            customer_name: name,
            customer_phone: phone,
            line_id: lineId || null,
            booking_date: date,
            booking_time: time,
            artist_id: artistId,
            tattoo_description: description,
            status: "pending",
            deposit: 0,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setSuccessBookingId(data[0].id);
        toast.success("ส่งข้อมูลการจองคิวสำเร็จ!");
        // Reset form
        setName("");
        setPhone("");
        setLineId("");
        setDate("");
        setTime("");
        setArtistId("");
        setDescription("");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการจองคิว: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={12} />
              157 Tattoo Premium Studio
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none mb-6">
              สรรสร้างศิลปะบนเรือนร่าง <br />
              <span className="text-gray-500">สะท้อนตัวตนที่เป็นคุณ</span>
            </h1>
            <p className="max-w-xl mx-auto text-gray-600 text-base sm:text-lg mb-8 font-medium">
              ร้านสักระดับพรีเมียม 157 TATTOO พร้อมให้บริการออกแบบลายสักและสักลายโดยช่างผู้เชี่ยวชาญ สะอาด ปลอดภัย ด้วยเครื่องมือมาตรฐานสากล
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl">
                <Shield size={16} className="text-gray-900" /> มั่นใจความสะอาด 100%
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl">
                <Clock size={16} className="text-gray-900" /> เปิดทุกวัน 11:00 - 21:00 น.
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column: Booking Form */}
          <div className="md:col-span-3">
            {successBookingId ? (
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clipboard size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ส่งจองคิวสำเร็จแล้ว!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  เจ้าหน้าที่จะตรวจสอบข้อมูล และติดต่อกลับโดยเร็วที่สุดเพื่อประเมินราคาและยืนยันคิว
                </p>
                <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs text-left mb-6">
                  <p className="text-gray-500 mb-1">รหัสคิวการจองของคุณ:</p>
                  <p className="font-bold text-gray-900 text-sm select-all">{successBookingId}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/booking-status?id=${successBookingId}`}
                    className="btn-primary w-full py-3 block text-center"
                  >
                    ตรวจสอบสถานะคิว
                  </Link>
                  <button
                    onClick={() => setSuccessBookingId(null)}
                    className="btn-secondary w-full py-3"
                  >
                    จองคิวใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">จองคิวสักออนไลน์</h3>
                <p className="text-gray-500 text-xs mb-6">
                  กรอกข้อมูลความต้องการจองคิวสักเพื่อให้ช่างประเมินและติดต่อกลับ
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <User size={12} /> ชื่อ-นามสกุลผู้จอง *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="เช่น สมชาย ใจดี"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Phone size={12} /> เบอร์โทรศัพท์ *
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="เช่น 0891234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Line ID (ถ้ามี)
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="เช่น line_id_157"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Calendar size={12} /> วันที่ต้องการสัก *
                      </label>
                      <input
                        type="date"
                        className="input-field"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Clock size={12} /> เวลาที่ต้องการสัก *
                      </label>
                      <select
                        className="input-field"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      >
                        <option value="">เลือกเวลา...</option>
                        <option value="11:00:00">11:00 น.</option>
                        <option value="13:00:00">13:00 น.</option>
                        <option value="15:00:00">15:00 น.</option>
                        <option value="17:00:00">17:00 น.</option>
                        <option value="19:00:00">19:00 น.</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      เลือกช่างสักที่ท่านต้องการ *
                    </label>
                    {loadingArtists ? (
                      <div className="py-4 text-center text-gray-400 text-xs">กำลังโหลดข้อมูลช่างสัก...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {artists.map((artist) => (
                          <label
                            key={artist.id}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition text-center ${
                              artistId === artist.id
                                ? "border-black bg-gray-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="artist"
                              value={artist.id}
                              checked={artistId === artist.id}
                              onChange={() => setArtistId(artist.id)}
                              className="sr-only"
                            />
                            {artist.avatar_url && (
                              <img
                                src={artist.avatar_url}
                                alt={artist.name}
                                className="w-12 h-12 rounded-full object-cover mb-2"
                              />
                            )}
                            <span className="text-xs font-bold text-gray-900 block">{artist.name}</span>
                            <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{artist.specialty}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MessageSquare size={12} /> รายละเอียดงานสักที่ต้องการ (ขนาด, ตำแหน่ง, สี) *
                    </label>
                    <textarea
                      className="input-field min-h-[100px] py-3 resize-none"
                      placeholder="ระบุขนาด (ซม.), ตำแหน่งที่ต้องการสัก, โทนสี หรือแนวงานสักที่สนใจ..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                  >
                    {submitting ? "กำลังส่งข้อมูล..." : "ยืนยันการจองคิว"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Artist Info & Studio Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Artist Showcase */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <h4 className="text-base font-black text-gray-950 uppercase tracking-wider mb-4">
                ทีมช่างสักของเรา
              </h4>
              <div className="space-y-4">
                {loadingArtists ? (
                  <p className="text-xs text-gray-400">กำลังโหลด...</p>
                ) : (
                  artists.map((artist) => (
                    <div key={artist.id} className="flex items-start gap-3">
                      {artist.avatar_url && (
                        <img
                          src={artist.avatar_url}
                          alt={artist.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">{artist.name}</h5>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{artist.specialty}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Safety & Studio Guarantee */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <h4 className="text-base font-black text-gray-950 uppercase tracking-wider mb-3">
                มาตรฐานความปลอดภัย
              </h4>
              <ul className="space-y-3.5 text-xs text-gray-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                  <span>เข็มสักและปลอกเข็มเปลี่ยนใหม่ แกะกล่องทุกครั้งต่อหน้าลูกค้า</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                  <span>ใช้เครื่องอบฆ่าเชื้อมาตรฐานการแพทย์ (Autoclave) ในการทำความสะอาดอุปกรณ์ทุกชิ้น</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                  <span>สีสักเกรดพรีเมียมนำเข้าจากต่างประเทศ มีความปลอดภัยสูง สีสดติดทนนาน</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                  <span>พื้นที่ร้านสะอาด มีการพ่นฆ่าเชื้อและทำความสะอาดเตียงสักทุกรอบงาน</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
