import { notFound } from "next/navigation";

type ChatPageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatIdPage({ params }: ChatPageParams) {
  const { id } = await params;
  if (!id) {
    notFound();
  }
  return <div>id: {id}</div>;
}
