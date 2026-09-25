import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DivisionPage from "@/components/features-pages/DivisionPage";
import { DIVISIONS, DIVISION_MAP, isDivisionId } from "@/lib/divisions";
import { APP } from "@/lib/registry";

export function generateStaticParams() {
  return DIVISIONS.map((d) => ({ division: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ division: string }> }): Promise<Metadata> {
  const { division } = await params;
  if (!isDivisionId(division)) return {};
  const d = DIVISION_MAP[division];
  return { title: `${d.en} features — ${APP.name}`, description: d.leadEn };
}

export default async function Page({ params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  if (!isDivisionId(division)) notFound();
  return <DivisionPage id={division} />;
}
