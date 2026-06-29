export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  description: string | null;
  image_url: string;
  buy_link: string;
  review_link: string | null;
  buy_clicks: number;
  review_clicks: number;
  created_by: string | null;
  created_at: string;
}

export type ClickType = "buy" | "review";
