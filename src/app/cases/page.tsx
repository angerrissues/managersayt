import CasesPageClient from "@/components/CasesPageClient";
import { getCases } from "@/actions/admin";

export default async function CasesPage() {
  const cases = await getCases();
  return <CasesPageClient cases={cases as any} />;
}
