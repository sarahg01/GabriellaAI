export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;  // Changed from 'title'
  brand: string;
  description: string | null;
  price: number;  // NEW
  category: string;  // NEW
  image_url: string;
  affiliate_url: string;  // Changed from 'buy_link'
  youtube_review_url: string | null;  // Changed from 'review_link'
  buy_clicks: number;
  review_clicks: number;
  created_by: string | null;
  created_at: string;
}
export type ClickType = "buy" | "review";
