import { Suspense } from "react";
import { PlayAnalytics } from "./component/play-analytics";
import PlayCards from "./component/play-cards";
import PlayHeader from "./component/play-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlaygroundPage() {
  return (
    <div className="space-y-6 md:space-y-14">
      {/* Welcome header */}
      <PlayHeader />
      <Suspense fallback={<PlayGroundChildSkeleton />}>
        {/* cards */}
        <PlayCards />
        {/* charts of 2 different types */}
        <PlayAnalytics />
      </Suspense>
    </div>
  );
}

function PlayGroundChildSkeleton() {
  return (
    <section className="w-full px4 md:px-6 space-y-6 md:space-y-14">
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="w-full h-52" />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="w-full h-80" />
        ))}
      </div>
    </section>
  );
}
