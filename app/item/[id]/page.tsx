import type { Metadata } from "next";
import { ItemDetail } from "@/components/item/ItemDetail";
import { APP_NAME } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Item · ${APP_NAME}`,
    description: `View listing details on ${APP_NAME}.`,
    openGraph: { title: `Listing ${id}` },
  };
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  return <ItemDetail id={id} />;
}
