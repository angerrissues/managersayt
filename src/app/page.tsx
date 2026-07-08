import HomeClient from "@/components/HomeClient";
import { getBloggers } from "@/actions/admin";

export default async function Home() {
  const bloggers = await getBloggers();
  return <HomeClient initialBloggerCount={bloggers.length} />;
}
