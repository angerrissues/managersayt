import CasesPageClient from "@/components/cases/CasesPageClient";
import { getCases } from "@/actions/admin";
import type { Case } from "@/types/case";

export default async function CasesPage() {
  const cases = await getCases();
  return <CasesPageClient cases={cases as unknown as Case[]} />;
}
