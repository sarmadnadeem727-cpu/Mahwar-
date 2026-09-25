import type { Metadata } from "next";
import FeaturesHub from "@/components/features-pages/FeaturesHub";
import { APP } from "@/lib/registry";

export const metadata: Metadata = {
  title: `Features — ${APP.name}`,
  description: "Finance on one side, supply chain on the other, working capital where they meet. Every engine in the Mahwar terminal.",
};

export default function FeaturesPage() {
  return <FeaturesHub />;
}
