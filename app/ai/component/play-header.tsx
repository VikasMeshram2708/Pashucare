"use client";

import { useUser } from "@clerk/nextjs";

export default function PlayHeader() {
  const { user } = useUser();
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <section className="space-y-2 md:space-y-4 px-4 md:px-6">
      <h2 className="text-base md:text-lg lg:text-2xl xl:text-4xl font-bold leading-tight">
        Welcome back{" "}
        <span className="italic underline decoration-wavy decoration-yellow-400 underline-offset-4 md:underline-offset-8">
          {user?.fullName}
        </span>{" "}
        to Pashucare AI.
      </h2>
      <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
        {today}
      </p>
    </section>
  );
}
