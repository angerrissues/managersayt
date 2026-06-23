import BlogersPageClient from "@/components/bloggers/BlogersPageClient";
import { getBloggers } from "@/actions/admin";
import type { Blogger } from "@/types/blogger";

export default async function Statistics() {
  const bloggers = await getBloggers();

  return (
    <BlogersPageClient bloggers={bloggers as unknown as Blogger[]} mode="statistics" />
  );
}
