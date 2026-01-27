import { getChats } from "@/actions/get-chats";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { PawPrintIcon } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PlayCards() {
  const user = await currentUser();
  if (!user) notFound();

  const result = await getChats({ userId: user.id });

  const total = result?.metadata?.total;

  const cardLinks = [
    {
      label: "Total Chats",
      value: total,
      description: "Created so far",
    },
    {
      label: "Reports Checked",
      value: 0,
      description: "Reviewed successfully",
    },
  ];

  return (
    <section className="grid gap-4 px-4 sm:grid-cols-2 md:px-6">
      {cardLinks.map((item) => (
        <Card key={item.label} className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <CardAction>
              <PawPrintIcon className="text-muted-foreground" />
            </CardAction>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {item.value}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
