"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Unauthenticated, Authenticated, useQuery } from "convex/react";

export default function Home() {
  return (
    <div className="">
      <Unauthenticated>
        <Button asChild>
          <SignUpButton />
        </Button>
        <Button variant={"outline"} asChild>
          <SignInButton />
        </Button>
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <p>Welcome back!</p>
      </Authenticated>
    </div>
  );
}

// function Content() {
//   const {} = useQuery(api.)
//   return (
//     <div>

//     </div>
//   )
// }
