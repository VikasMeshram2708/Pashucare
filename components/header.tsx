"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { MenuIcon } from "lucide-react";

export function Header() {
  const navLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/ai",
      label: "AI",
    },
    {
      href: "/contact",
      label: "Contact Us",
    },
  ] as const;

  return (
    <header className="p-4 sticky top-0 bg-background z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            PashuCare AI
          </h1>
        </Link>
        <nav className="hidden lg:flex items-center gap-4">
          {navLinks.map((l) => (
            <Link href={l.href} key={l.label}>
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                {l.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant={"ghost"}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Link href="/">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      PashuCare AI
                    </h1>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex p-5 flex-col gap-4">
                {navLinks.map((l) => (
                  <Link href={l.href} key={l.label}>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                      {l.label}
                    </span>
                  </Link>
                ))}
              </nav>
              <SheetFooter>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Button type="button" variant={"link"}>
                    <SignInButton>Sign In</SignInButton>
                  </Button>
                  <Button>
                    <SignUpButton>Sign Up</SignUpButton>
                  </Button>
                </SignedOut>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Button asChild type="button" variant={"link"}>
              <SignInButton>Sign In</SignInButton>
            </Button>
            <Button type="button" asChild>
              <SignUpButton>Sign Up</SignUpButton>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
