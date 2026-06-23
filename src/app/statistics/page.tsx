import BlogersPageClient from "@/components/BlogersPageClient";
import { getBloggers } from "@/actions/admin";

export default async function Statistics() {
  const bloggers = await getBloggers();

  return (
    <BlogersPageClient bloggers={bloggers as any} mode="statistics" />
  );
}
