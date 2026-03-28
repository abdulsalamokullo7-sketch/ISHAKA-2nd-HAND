import type { Timestamp } from "firebase/firestore";
import type { Category, Condition, RegionId } from "./constants";

export type ItemStatus = "available" | "sold";

export interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category | string;
  condition: Condition | string;
  images: string[];
  location: string;
  region: RegionId;
  status: ItemStatus;
  createdAt: Timestamp | null;
  /** Business owner listings can be marked verified */
  verified?: boolean;
  /** Seller contact — required for trust */
  phone?: string;
  studentIdImage?: string | null;
  /** Featured / hot deal */
  featured?: boolean;
}

export type SellRequestStatus = "pending" | "approved" | "rejected";

/** Buyer question about a listing — shop reads in Admin → Buyer messages. */
export interface ItemBuyerMessage {
  id: string;
  itemId: string;
  itemName: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
  createdAt: Timestamp | null;
}

export interface SellRequest {
  id: string;
  itemName: string;
  images: string[];
  expectedPrice: number;
  condition: string;
  phone: string;
  description: string;
  location: string;
  meetingPreference: string;
  status: SellRequestStatus;
  createdAt: Timestamp | null;
  adminNote?: string;
  negotiatedPrice?: number | null;
}
