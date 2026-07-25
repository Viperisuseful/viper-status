import { StatusPageClient } from "@/components/status-page-client";
import { getPublicStatus } from "@/lib/status-cache";

export default async function Home() {
  const initialStatus = await getPublicStatus();
  return <StatusPageClient initialStatus={initialStatus} />;
}

