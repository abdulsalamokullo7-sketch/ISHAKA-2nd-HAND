import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: `Items in your cart on ${APP_NAME} — contact sellers on WhatsApp or call.`,
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
