import { getChats } from "@/actions/get-chats";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PlayAnalyticsCharts } from "./play-analytics-chart";

export async function PlayAnalytics() {
  const user = await currentUser();
  if (!user) notFound();

  const result = await getChats({ userId: user.id });

  const chats = result.metadata?.data ?? [];

  return <PlayAnalyticsCharts chats={chats} />;
}
