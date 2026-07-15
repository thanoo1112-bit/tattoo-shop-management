export interface Artist {
  id: string;
  name: string;
  specialty: string | null;
  avatar_url: string | null;
  is_available: boolean;
  created_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  line_id: string | null;
  booking_date: string;
  booking_time: string;
  artist_id: string | null;
  tattoo_description: string;
  status: BookingStatus;
  price: number | null;
  deposit: number;
  created_at: string;
  artist?: Artist | null;
}

export type PaymentMethod = "cash" | "transfer" | "card";

export interface Receipt {
  id: string;
  booking_id: string | null;
  receipt_number: string;
  customer_name: string;
  artist_name: string;
  tattoo_description: string;
  subtotal: number;
  deposit_deducted: number;
  discount: number;
  total_paid: number;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "artist" | "staff";
  created_at: string;
}
