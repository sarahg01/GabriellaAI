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

export type LinkType = "buy" | "review";

export interface ProductLink {
  id: string;
  product_id: string;
  link_type: LinkType;
  label: string | null;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ProductLinks {
  buy: ProductLink[];
  review: ProductLink[];
}
